// supabase/functions/_shared/household-cleanup.ts
//
// Compartido entre delete-account (baja voluntaria) y cleanup-inactive-users
// (borrado automático tras 2 años) — la misma limpieza de "quién lo hizo"
// hace falta en ambos casos.

// deno-lint-ignore no-explicit-any
export function scrubUserAttribution(data: any, userId: string): { data: any; changed: boolean } {
  let changed = false;
  const next = structuredClone(data ?? {});

  if (next.eaten && typeof next.eaten === 'object') {
    for (const dateKey of Object.keys(next.eaten)) {
      const day = next.eaten[dateKey];
      if (!day || typeof day !== 'object') continue;
      for (const meal of Object.keys(day)) {
        const v = day[meal];
        if (v && typeof v === 'object' && v.by && v.by.userId === userId) {
          day[meal] = { ...v, by: null };
          changed = true;
        }
      }
    }
  }

  if (Array.isArray(next.shoppingItems)) {
    next.shoppingItems = next.shoppingItems.map((item: any) => {
      if (item?.addedBy?.userId === userId) {
        changed = true;
        return { ...item, addedBy: null };
      }
      return item;
    });
  }

  return { data: next, changed };
}

// Da de baja a un usuario de todos los hogares a los que pertenece, de forma
// segura: transfiere la propiedad automáticamente (al miembro con más
// antigüedad) cuando hace falta, borra hogares que se quedarían vacíos, y
// limpia su atribución personal de los que sobreviven. Devuelve cuántos
// hogares se borraron, para poder registrarlo sin guardar datos personales.
export async function offboardUserFromHouseholds(
  // deno-lint-ignore no-explicit-any
  admin: any,
  userId: string,
  // Si se indica, se usa para decidir a quién transferir la propiedad
  // cuando hace falta (baja manual, decisión ya tomada por la persona).
  // Si no se indica (borrado automático), se transfiere sola al miembro
  // con más antigüedad en el hogar.
  transferTo?: string | null,
): Promise<{ householdsDeleted: number; requiresDecision: string | null }> {
  const { data: memberships } = await admin
    .from('household_members')
    .select('household_id, role')
    .eq('user_id', userId);

  let householdsDeleted = 0;
  const survivingHouseholdIds: string[] = [];

  for (const m of memberships ?? []) {
    if (m.role === 'owner') {
      const { data: others } = await admin
        .from('household_members')
        .select('user_id, created_at')
        .eq('household_id', m.household_id)
        .neq('user_id', userId)
        .order('created_at', { ascending: true });

      const hasOtherMembers = (others ?? []).length > 0;

      if (!hasOtherMembers) {
        await admin.from('households').delete().eq('id', m.household_id);
        householdsDeleted += 1;
        continue;
      }

      const newOwner = transferTo ?? others![0].user_id;
      const isRealMember = (others ?? []).some((o: { user_id: string }) => o.user_id === newOwner);
      if (!isRealMember) return { householdsDeleted, requiresDecision: m.household_id };

      await admin.from('household_members').update({ role: 'member' })
        .eq('household_id', m.household_id).eq('user_id', userId);
      await admin.from('household_members').update({ role: 'owner' })
        .eq('household_id', m.household_id).eq('user_id', newOwner);
      survivingHouseholdIds.push(m.household_id);
    } else {
      survivingHouseholdIds.push(m.household_id);
    }
  }

  for (const householdId of survivingHouseholdIds) {
    const { data: h } = await admin.from('households').select('data').eq('id', householdId).single();
    if (!h) continue;
    const { data: scrubbed, changed } = scrubUserAttribution(h.data, userId);
    if (changed) {
      await admin.from('households').update({ data: scrubbed, updated_at: new Date().toISOString() }).eq('id', householdId);
    }
  }

  return { householdsDeleted, requiresDecision: null };
}
