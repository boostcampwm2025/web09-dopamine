export interface Project {
  id: string;
  title: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProjectListItem extends Project {
  memberCount: number;
}

export interface CreateProjectResponse {
  id: string;
  title: string;
  ownerId: string;
  createdAt: string;
}
