import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import HomePage from '@/components/home/home-page';

export default async function Page() {
  const session = await getServerSession(authOptions);

  return <HomePage session={session} />;
}
