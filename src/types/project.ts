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

export interface ProjectwithTopic {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  created_at: Date;
  topics: {
    id: string;
    title: string;
    issueCount: number;
  }[];
  members: {
    id: string;
    name: string | null;
    image: string | null;
    role: 'OWNER' | 'MEMBER';
  }[];
}

export const maxTitleLength = 30;
