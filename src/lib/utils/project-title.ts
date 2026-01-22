import { MAX_TITLE_LENGTH } from '@/constants/project';

export function isProjectTitleTooLong(title: string) {
  return title.trim().length > MAX_TITLE_LENGTH;
}
