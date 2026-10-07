// Builds every cut-out once, before the first frame.
function buildAll() {
  buildNinja(110); buildNature(); buildPeople(); buildHouse(); buildSite(); buildBrand(); buildActOne();
  for (const f of ['buildChannels', 'buildInbox', 'buildPricing', 'buildGuest', 'buildOps', 'buildMoney', 'buildFinale']) if (typeof window[f] === 'function') window[f]();
}
