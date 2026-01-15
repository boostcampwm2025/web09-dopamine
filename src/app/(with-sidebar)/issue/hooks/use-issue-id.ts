import { useParams } from 'next/navigation';

export const useIssueId = () => {
  const params = useParams();
  return params.id as string;
};
