'use client';

import { useParams } from 'next/navigation';
import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarFilter from '@/components/sidebar/sidebar-filter';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import { CircleSkeleton, TextSkeleton } from '@/components/skeleton/skeleton';
import { useProjectQuery } from '@/hooks/project';
import { useSmartLoading } from '@/hooks/use-smart-loading';
import * as ProjectS from './projcet-sidebar.styles';
import { useProjectSidebar } from './use-project-sidebar';

const ProjectSidebar = () => {
  const {
    filteredTopics,
    filteredMembers,
    searchValue,
    handleSearchChange,
    searchTarget,
    setSearchTarget,
  } = useProjectSidebar();
  const params = useParams();
  const projectId = params.id as string;

  const { data: projectData, isLoading } = useProjectQuery(projectId);
  const showLoading = useSmartLoading(isLoading);

  const topics = showLoading ? [] : projectData?.topics || [];
  const members = showLoading ? [] : projectData?.members || [];

  return (
    <Sidebar
      inputProps={{
        value: searchValue,
        onChange: handleSearchChange,
        placeholder: '검색어를 입력하세요',
      }}
      suffix={
        <SidebarFilter
          value={searchTarget}
          onChange={setSearchTarget}
          items={['topic', 'member']}
        />
      }
    >
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
              ) : filteredTopics.length > 0 ? (
                filteredTopics.map((topic) => (
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
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <MemberSidebarItem
                    key={member.id}
                    profile={member.image || '/profile.svg'}
                    id={member.id}
                    name={member.name || '익명'}
                    role={member.role}
                  />
                ))
              ) : (
                <div style={{ padding: '16px', color: '#9ca3af', fontSize: '14px' }}>
                  멤버가 없습니다
                </div>
              )}
            </S.SidebarList>
          </ProjectS.ScrollableSection>
        </ProjectS.MemberSectionWrapper>
      </ProjectS.SidebarSection>
    </Sidebar>
  );
};

export default ProjectSidebar;
