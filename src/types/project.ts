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
