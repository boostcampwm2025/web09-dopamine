import type { Category } from '@/types/category';
import getAPIResponseData from '../utils/api-response';
import { withSseHeader } from '../utils/with-sse-header';

type CategoryPayload = {
  title: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
};

export function fetchCategories(issueId: string): Promise<Category[]> {
  return getAPIResponseData<Category[]>({
    url: `/api/issues/${issueId}/categories`,
    method: 'GET',
  });
}

export function createCategory(
  issueId: string,
  payload: CategoryPayload,
  connectionId?: string,
): Promise<Category> {
  return getAPIResponseData<Category>({
    url: `/api/issues/${issueId}/categories`,
    method: 'POST',
    headers: withSseHeader({ 'Content-Type': 'application/json' }, connectionId),
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  issueId: string,
  categoryId: string,
  payload: Partial<CategoryPayload>,
  connectionId?: string,
): Promise<Category> {
  return getAPIResponseData<Category>({
    url: `/api/issues/${issueId}/categories/${categoryId}`,
    method: 'PATCH',
    headers: withSseHeader({ 'Content-Type': 'application/json' }, connectionId),
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(
  issueId: string,
  categoryId: string,
  connectionId?: string,
): Promise<void> {
  return getAPIResponseData<void>({
    url: `/api/issues/${issueId}/categories/${categoryId}`,
    method: 'DELETE',
    headers: withSseHeader(undefined, connectionId),
  });
}
