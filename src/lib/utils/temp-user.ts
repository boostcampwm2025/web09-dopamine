const STORAGE_KEY = 'temp_user_id';

export function getTempUserId(): string {
  const existingId = localStorage.getItem(STORAGE_KEY);
  
  if (existingId && existingId.length === 36) {
    return existingId;
  }
  
  const newId = crypto.randomUUID();
  localStorage.setItem(STORAGE_KEY, newId);
  
  return newId;
}

export function resetTempUserId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
