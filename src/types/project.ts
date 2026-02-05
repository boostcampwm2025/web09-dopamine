export interface Project {
  id: string;
  title: string;
  description: string | null;
  ownerId: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface ProjectMember {
  user: { id: string; image: string | null; displayName: string | null };
}

export interface ProjectListItem extends Project {
  members: ProjectMember[];
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
