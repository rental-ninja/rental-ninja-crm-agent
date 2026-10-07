// Builds every cut-out once, before the first frame: the shared kit, then the film's own builders (film.yml app.builders).
function buildAll() {
  buildNinja(110); buildNature(); buildPeople(); buildHouse(); buildSite(); buildBrand();
  for (const f of FILM.builders || []) if (typeof window[f] === 'function') window[f](); else console.warn('builder missing', f);
}
