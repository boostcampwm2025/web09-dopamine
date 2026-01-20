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
}
