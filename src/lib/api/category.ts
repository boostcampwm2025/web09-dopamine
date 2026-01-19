import type { Category } from '@/types/category';

type CategoryPayload = {
  title: string;
  positionX?: number;
  positionY?: number;
  width?: number;
  height?: number;
};

export async function fetchCategories(issueId: string): Promise<Category[]> {
  try {
    const response = await fetch(`/api/issues/${issueId}/category`);
    if (response.ok) {
      const data = await response.json();
      return data.categories;
    }
    return [];
  } catch (error) {
    console.error('카테고리 조회 실패:', error);
    return [];
  }
}

export async function createCategory(issueId: string, payload: CategoryPayload): Promise<Category> {
  const response = await fetch(`/api/issues/${issueId}/category`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('카테고리 생성에 실패했습니다.');
  }

  return response.json();
}

export async function updateCategory(
  issueId: string,
  categoryId: string,
  payload: Partial<CategoryPayload>,
): Promise<Category> {
  const response = await fetch(`/api/issues/${issueId}/category/${categoryId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error('카테고리 수정에 실패했습니다.');
  }

  return response.json();
}

export async function deleteCategory(
  issueId: string,
  categoryId: string,
): Promise<{ success: boolean }> {
  const response = await fetch(`/api/issues/${issueId}/category/${categoryId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('카테고리 삭제에 실패했습니다.');
  }

  return response.json();
}
