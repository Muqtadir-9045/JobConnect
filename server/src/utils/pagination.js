const paginationMeta = (total, page, limit) => {
  const pages = Math.ceil(total / limit);
  return { page, limit, total, pages, hasNext: page < pages };
};

module.exports = { paginationMeta };
