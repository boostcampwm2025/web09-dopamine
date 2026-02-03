'use client';

import { useParams } from 'next/navigation';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { CircleSkeleton, TextSkeleton } from '@/components/skeleton/skeleton';
import { useProjectQuery } from '@/hooks/project';
import { useSmartLoading } from '@/hooks/use-smart-loading';
import * as ProjectS from './projcet-sidebar.styles';

const ProjectSidebar = () => {
  const params = useParams();
  const projectId = params.id as string;

  const { data: projectData, isLoading } = useProjectQuery(projectId);
  const showLoading = useSmartLoading(isLoading);

  const topics = showLoading ? [] : projectData?.topics || [];
  const members = showLoading ? [] : projectData?.members || [];

  return (
    <Sidebar>
      <ProjectS.SidebarSection>
        <ProjectS.TopicSectionWrapper>
          <S.SidebarTitle>TOPIC LIST</S.SidebarTitle>
          <ProjectS.ScrollableSection>
            <S.SidebarList>
              {showLoading ? (
                <>
                  <div style={{ padding: '10px 16px 10px 24px' }}>
                    <TextSkeleton width="80%" />
                  </div>
                  <div style={{ padding: '10px 16px 10px 24px' }}>
                    <TextSkeleton width="70%" />
                  </div>
                  <div style={{ padding: '10px 16px 10px 24px' }}>
                    <TextSkeleton width="75%" />
                  </div>
                </>
              ) : (
                topics.map((topic) => (
                  <SidebarItem
                    isTopic
                    key={topic.id}
                    title={topic.title}
                    href={`/topic/${topic.id}`}
                  />
                ))
              )}
            </S.SidebarList>
          </ProjectS.ScrollableSection>
        </ProjectS.TopicSectionWrapper>

        <ProjectS.Divider />

        <ProjectS.MemberSectionWrapper>
          <S.SidebarTitle>MEMBER LIST</S.SidebarTitle>
          <ProjectS.ScrollableSection>
            <S.SidebarList>
              {showLoading ? (
                <>
                  <div
                    style={{
                      padding: '10px 16px 10px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <CircleSkeleton size="24px" />
                    <TextSkeleton width="60%" />
                  </div>
                  <div
                    style={{
                      padding: '10px 16px 10px 24px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <CircleSkeleton size="24px" />
                    <TextSkeleton width="55%" />
                  </div>
                </>
              ) : (
                members.map((member) => (
                  <MemberSidebarItem
                    key={member.id}
                    profile={member.image || '/profile.svg'}
                    id={member.id}
                    name={member.name || '익명'}
                    role={member.role}
                  />
                ))
              )}
            </S.SidebarList>
          </ProjectS.ScrollableSection>
        </ProjectS.MemberSectionWrapper>
      </ProjectS.SidebarSection>
    </Sidebar>
  );
};

export default ProjectSidebar;
