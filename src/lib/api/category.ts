import type { Category } from '@/types/category';
import getAPIResponseData from '../utils/api-response';

type CategoryPayload = {
  title: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
};


export async function fetchCategories(issueId: string): Promise<Category[]> {
  try {
    return await getAPIResponseData<Category[]>({
      url: `/api/issues/${issueId}/category`,
      method: 'GET',
    });
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return [];
  }
}

export async function createCategory(issueId: string, payload: CategoryPayload): Promise<Category> {
  return getAPIResponseData<Category>({
    url: `/api/issues/${issueId}/category`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

export async function updateCategory(
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

export async function deleteCategory(
  issueId: string,
  categoryId: string,
): Promise<void> {
  await getAPIResponseData<null>({
    url: `/api/issues/${issueId}/category/${categoryId}`,
    method: 'DELETE',
  });
}
