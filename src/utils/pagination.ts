export const paginate = <T>(items: T[], page: number, limit: number) => {
  const total = items.length;
  const start = (page - 1) * limit;
  const end = start + limit;
  const slice = items.slice(start, end);
  return { items: slice, total, hasMore: end < total };
};
