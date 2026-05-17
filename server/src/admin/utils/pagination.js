export function getPagination(query) {
  const page = Math.max(1, parseInt(query.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginationMeta(total, page, limit) {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  return { page, limit, total, totalPages };
}
