import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { fetchObjects, fetchObjectById } from '../lib/api';
import type { ObjectsResponse, ObjectDetails, Category, BBox } from '../lib/types';

export function useObjectsQuery(
  categories: Category[],
  bbox: BBox | null,
  page = 1,
  limit = 500
): UseQueryResult<ObjectsResponse> {
  return useQuery({
    queryKey: ['objects', categories, bbox, page, limit],
    queryFn: ({ signal }) => {
      if (!bbox || categories.length === 0) {
        return Promise.resolve({ items: [], page: 1, total: 0, hasMore: false });
      }
      return fetchObjects(categories, bbox, page, limit, signal);
    },
    staleTime: 60000, // 1 minute
    enabled: !!bbox && categories.length > 0,
  });
}

export function useObjectDetailsQuery(id: string | null): UseQueryResult<ObjectDetails> {
  return useQuery({
    queryKey: ['object', id],
    queryFn: ({ signal }) => {
      if (!id) {
        throw new Error('No ID provided');
      }
      return fetchObjectById(id, signal);
    },
    enabled: !!id,
    staleTime: 300000, // 5 minutes
  });
}
