import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { ProjectList } from '@/app/project/_components/project-list/project-list';
import { authOptions } from '@/lib/auth';
import { getProjectListForUser } from '@/lib/services/project.service';

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect('/');
  }

  const projects = await getProjectListForUser(session.user.id);
  return <ProjectList projects={projects} />;
}
