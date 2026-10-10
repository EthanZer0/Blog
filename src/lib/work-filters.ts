export const workTypes = ['book', 'movie', 'series'] as const;
export const workStatuses = ['planned', 'in-progress', 'finished'] as const;
export type WorkType = typeof workTypes[number];
export type WorkStatus = typeof workStatuses[number];
export type WorkFilters = { type: WorkType | ''; status: WorkStatus | '' };
export const workTypeLabel = { book: '书籍', movie: '电影', series: '剧集' };
export function workStatusLabel(status: WorkStatus, book: boolean) {
  return ({ planned: book ? '想读' : '想看', 'in-progress': book ? '在读' : '正在看', finished: book ? '已读' : '已看完' })[status];
}
export function readWorkFilters(params: URLSearchParams): WorkFilters {
  const type = params.get('type'), status = params.get('status');
  return { type: workTypes.includes(type as WorkType) ? type as WorkType : '', status: workStatuses.includes(status as WorkStatus) ? status as WorkStatus : '' };
}
export function workFilterQuery(filters: WorkFilters) {
  const params = new URLSearchParams();
  if (filters.type) params.set('type', filters.type);
  if (filters.status) params.set('status', filters.status);
  return params.toString();
}
