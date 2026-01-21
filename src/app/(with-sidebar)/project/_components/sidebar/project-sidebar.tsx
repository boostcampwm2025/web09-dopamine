import MemberSidebarItem from '@/components/sidebar/member-sidebar-item';
import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';
import * as ProjectS from './projcet-sidebar.styles';

const TOPIC_LIST = [
  { title: '서비스 홍보 방안', href: '#' },
  { title: '프론트앤드 아키텍쳐', href: '#' },
  { title: '바이럴 문구 작성', href: '#' },
  { title: '초기 유저 리텐션 전략', href: '#' },
] as const;

const MEMBER_LIST = [
  { id: '1', name: '김민수', role: 'OWNER', image: '/profile.svg' },
  { id: '2', name: '이지은', role: 'MEMBER', image: '/profile.svg' },
  { id: '3', name: '박준호', role: 'MEMBER', image: '/profile.svg' },
  { id: '4', name: '정서현', role: 'MEMBER', image: '/profile.svg' },
  { id: '5', name: '김수호', role: 'MEMBER', image: '/profile.svg' },
  { id: '6', name: '장발장', role: 'MEMBER', image: '/profile.svg' },
];

const ProjectSidebar = () => {
  return (
    <Sidebar>
      <ProjectS.SidebarSection>
        <ProjectS.TopicSectionWrapper>
          <S.SidebarTitle>TOPIC LIST</S.SidebarTitle>
          <ProjectS.ScrollableSection>
            <S.SidebarList>
              {TOPIC_LIST.map((topic, index) => (
                <SidebarItem
                  isTopic
                  key={index}
                  title={topic.title}
                  href={topic.href}
                />
              ))}
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
