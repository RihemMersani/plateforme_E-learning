const slugify = (value) => String(value || '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

const withSlug = (row) => ({
  ...row,
  slug: `${slugify(row.title)}-${row.id}`,
});

const idFromSlug = (slug) => {
  const id = Number(String(slug || '').split('-').pop());
  return Number.isInteger(id) && id > 0 ? id : null;
};

module.exports = {
  idFromSlug,
  slugify,
  withSlug,
};
