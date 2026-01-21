import { maxTitleLength } from '@/types/project';

export function isProjectTitleTooLong(title: string) {
  return title.trim().length > maxTitleLength;
}
