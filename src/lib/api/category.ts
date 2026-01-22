import type { Category } from '@/types/category';
import getAPIResponseData from '../utils/api-response';

type CategoryPayload = {
  title: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
};

export function fetchCategories(issueId: string): Promise<Category[]> {
  return getAPIResponseData<Category[]>({
    url: `/api/issues/${issueId}/category`,
    method: 'GET',
  });
}

export function createCategory(issueId: string, payload: CategoryPayload): Promise<Category> {
  return getAPIResponseData<Category>({
    url: `/api/issues/${issueId}/category`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function updateCategory(
  issueId: string,
  categoryId: string,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  return getAPIResponseData<Category>({
    url: `/api/issues/${issueId}/category/${categoryId}`,
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export function deleteCategory(issueId: string, categoryId: string): Promise<void> {
  return getAPIResponseData<void>({
    url: `/api/issues/${issueId}/category/${categoryId}`,
    method: 'DELETE',
  });
}
