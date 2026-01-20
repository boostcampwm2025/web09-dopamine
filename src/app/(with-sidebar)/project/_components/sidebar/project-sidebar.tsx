'use client';

import { useParams } from 'next/navigation';
import { useProjectQuery } from '../../hooks/use-project-query';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import * as ProjectS from './projcet-sidebar.styles';

const MEMBER_LIST = [
  { id: '1', name: '김민수', role: 'OWNER', image: '/profile.svg' },
  { id: '2', name: '이지은', role: 'MEMBER', image: '/profile.svg' },
  { id: '3', name: '박준호', role: 'MEMBER', image: '/profile.svg' },
  { id: '4', name: '정서현', role: 'MEMBER', image: '/profile.svg' },
  { id: '5', name: '김수호', role: 'MEMBER', image: '/profile.svg' },
  { id: '6', name: '장발장', role: 'MEMBER', image: '/profile.svg' },
];

const ProjectSidebar = () => {
  const params = useParams();
  const projectId = params.id as string;

  const { data: projectData } = useProjectQuery(projectId);
  const topics = projectData?.topics || [];

  return (
    <Sidebar>
      <ProjectS.SidebarSection>
        <ProjectS.TopicSectionWrapper>
          <S.SidebarTitle>TOPIC LIST</S.SidebarTitle>
          <ProjectS.ScrollableSection>
            <S.SidebarList>
              {topics.length > 0 ? (
                topics.map((topic) => (
                  <SidebarItem
                    isTopic
                    key={topic.id}
                    title={topic.title}
                    href={`/topic/${topic.id}`}
                  />
                ))
              ) : (
                <div style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
                  토픽이 없습니다
                </div>
              )}
            </S.SidebarList>
          </ProjectS.ScrollableSection>
        </ProjectS.TopicSectionWrapper>

        <ProjectS.Divider />

        <ProjectS.MemberSectionWrapper>
          <S.SidebarTitle>MEMBER LIST</S.SidebarTitle>
          <ProjectS.ScrollableSection>
            <S.SidebarList>
              {MEMBER_LIST.map((member, index) => (
                <MemberSidebarItem
                  key={index}
                  profile={member.image}
                  id={member.id}
                  name={member.name}
                  role={member.role}
                />
              ))}
            </S.SidebarList>
          </ProjectS.ScrollableSection>
        </ProjectS.MemberSectionWrapper>
      </ProjectS.SidebarSection>
    </Sidebar>
  );
};

export default ProjectSidebar;
