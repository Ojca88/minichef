import { MEALS, recipesFor, recipeById, seededRandom } from './data';

export function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function mondayOf(date) {
  const d = new Date(date);
  const day = (d.getDay() + 6) % 7; // 0 = Monday
  d.setDate(d.getDate() - day);
  d.setHours(0, 0, 0, 0);
  return d;
}

// Devuelve solo las recetas aptas para la edad del bebé y la temporada elegida
// (si se han configurado); si el filtro deja el grupo vacío, cae de vuelta a
// un filtro más laxo para no romper el plan.
export function poolFor(meal, ageIdx, season) {
  const all = recipesFor(meal);
  let pool = all;
  if (ageIdx !== null && ageIdx !== undefined) {
    const byAge = pool.filter(r => r.ageIdx <= ageIdx);
    if (byAge.length) pool = byAge;
  }
  if (season) {
    const bySeason = pool.filter(r => r.season === season || r.season === 'ambas');
    if (bySeason.length) pool = bySeason;
  }
  return pool.length ? pool : all;
}

export function randomPick(meal, excludeId, ageIdx, season) {
  const pool = poolFor(meal, ageIdx, season);
  const options = pool.filter(r => r.id !== excludeId);
  const finalPool = options.length ? options : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

export function pickForSeedAged(meal, seed, ageIdx, season) {
  const pool = poolFor(meal, ageIdx, season);
  const idx = Math.floor(seededRandom(seed) * pool.length);
  return pool[idx];
}

// Semilla única por fecha+comida, basada en días desde epoch (en vez de
// mes*40 + día*3), para que no colisione entre fechas de meses distintos.
// mes*40 se solapaba con día*3 (hasta 93) y producía cientos de semillas
// repetidas por año, correlacionando la asignación entre fechas que
// deberían generarse de forma independiente.
export function seedFor(d, mi) {
  const dayIndex = Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  return dayIndex * MEALS.length + mi;
}

// Genera, para un conjunto de fechas, solo los ids de receta (no el objeto completo)
// — es lo único que se guarda y sincroniza en la nube.
export function generateIdsFor(dates, ageIdx, season) {
  const patch = {};
  dates.forEach((d) => {
    const key = dateKey(d);
    const entry = {};
    MEALS.forEach((meal, mi) => { entry[meal] = pickForSeedAged(meal, seedFor(d, mi), ageIdx, season).id; });
    patch[key] = entry;
  });
  return patch;
}

// Un valor guardado en plans[fecha][comida] puede ser:
//  - un string: id de una receta real (buscar con recipeById)
//  - un objeto { manual: true, name }: plato escrito a mano, sin ficha propia
// resolveValue() lo convierte siempre en algo con al menos { id?, name, manual? }
export function resolveValue(value, meal, seed, ageIdx, season) {
  if (value && typeof value === 'object') return value; // ya es una entrada manual
  if (typeof value === 'string') return recipeById(value) || pickForSeedAged(meal, seed, ageIdx, season);
  return pickForSeedAged(meal, seed, ageIdx, season);
}
