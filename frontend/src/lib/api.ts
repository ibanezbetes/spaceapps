import axios from 'axios';
import { config } from '../config';
import type { ObjectsResponse, ObjectDetails, ChatResponse, Category, BBox } from './types';

const api = axios.create({
  baseURL: config.apiBase,
  timeout: 10000,
});

export async function fetchObjects(
  category: Category | Category[],
  bbox?: BBox,
  page = 1,
  limit = config.defaultLimit,
  signal?: AbortSignal
): Promise<ObjectsResponse> {
  const categories = Array.isArray(category) ? category : [category];
  const params: Record<string, string> = {
    category: categories.join(','),
    page: String(page),
    limit: String(limit),
  };
  
  if (bbox) {
    params.bbox = `${bbox.minRA},${bbox.minDec},${bbox.maxRA},${bbox.maxDec}`;
  }
  
  const { data } = await api.get<ObjectsResponse>('/objects', { params, signal });
  return data;
}

export async function fetchObjectById(id: string, signal?: AbortSignal): Promise<ObjectDetails> {
  const { data } = await api.get<ObjectDetails>(`/objects/${id}`, { signal });
  return data;
}

export async function sendChatMessage(
  id: string,
  question?: string,
  signal?: AbortSignal
): Promise<ChatResponse> {
  const { data } = await api.post<ChatResponse>(
    `/chat/${id}`,
    { question },
    { signal }
  );
  return data;
}

export function createSSEUrl(id: string, question?: string): string {
  const url = new URL(`/chat/${id}`, config.apiBase);
  url.searchParams.set('stream', 'true');
  return url.toString();
}
