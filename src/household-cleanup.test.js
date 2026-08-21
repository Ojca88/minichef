import { describe, it, expect } from 'vitest';
import { scrubUserAttribution } from '../supabase/functions/_shared/household-cleanup.ts';

// Estas funciones las usan las Edge Functions (Deno), pero al no depender
// de ninguna API específica de Deno, se pueden probar igual aquí con
// Vitest — así queda cubierta la parte más delicada de la baja de cuenta y
// la limpieza automática, sin necesidad de desplegar nada para probarlo.

describe('scrubUserAttribution', () => {
  it('borra el "by" de una comida marcada por el usuario que se da de baja', () => {
    const data = {
      eaten: {
        '2026-08-20': { Comida: { done: true, by: { userId: 'u1', name: 'Ana', avatar: null } } },
      },
    };
    const { data: result, changed } = scrubUserAttribution(data, 'u1');
    expect(changed).toBe(true);
    expect(result.eaten['2026-08-20'].Comida).toEqual({ done: true, by: null });
  });

  it('no toca el "by" de otro usuario', () => {
    const data = {
      eaten: { '2026-08-20': { Comida: { done: true, by: { userId: 'otro', name: 'Óscar', avatar: null } } } },
    };
    const { data: result, changed } = scrubUserAttribution(data, 'u1');
    expect(changed).toBe(false);
    expect(result.eaten['2026-08-20'].Comida.by.userId).toBe('otro');
  });

  it('borra el "addedBy" de un artículo de la compra del usuario que se da de baja', () => {
    const data = {
      shoppingItems: [
        { id: 'x1', name: 'Plátanos', addedBy: { userId: 'u1', name: 'Ana', avatar: null } },
        { id: 'x2', name: 'Leche', addedBy: { userId: 'otro', name: 'Óscar', avatar: null } },
      ],
    };
    const { data: result, changed } = scrubUserAttribution(data, 'u1');
    expect(changed).toBe(true);
    expect(result.shoppingItems[0].addedBy).toBeNull();
    expect(result.shoppingItems[1].addedBy.userId).toBe('otro');
  });

  it('no falla con datos vacíos o sin eaten/shoppingItems', () => {
    expect(() => scrubUserAttribution({}, 'u1')).not.toThrow();
    expect(() => scrubUserAttribution(null, 'u1')).not.toThrow();
    const { changed } = scrubUserAttribution({}, 'u1');
    expect(changed).toBe(false);
  });

  it('no muta el objeto original (devuelve una copia)', () => {
    const original = { eaten: { d1: { Comida: { done: true, by: { userId: 'u1', name: 'Ana' } } } } };
    const { data: result } = scrubUserAttribution(original, 'u1');
    expect(original.eaten.d1.Comida.by.userId).toBe('u1'); // el original sigue intacto
    expect(result.eaten.d1.Comida.by).toBeNull();
  });
});
