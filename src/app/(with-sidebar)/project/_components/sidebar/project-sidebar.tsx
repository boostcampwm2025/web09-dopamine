import Sidebar from '@/components/sidebar/sidebar';
import SidebarItem from '@/components/sidebar/sidebar-item';
import * as S from '@/components/sidebar/sidebar.styles';

const TOPIC_LIST = [
  { title: '서비스 홍보 방안', href: '#' },
  { title: '프론트앤드 아키텍쳐', href: '#' },
  { title: '바이럴 문구 작성', href: '#' },
  { title: '초기 유저 리텐션 전략', href: '#' },
] as const;

const ProjectSidebar = () => {
  return (
    <Sidebar>
      <div>
        <S.SidebarTitle>TOPIC LIST</S.SidebarTitle>
        <S.SidebarList>
          {TOPIC_LIST.map((topic, index) => {
            return (
              <SidebarItem
                isTopic={true}
                key={index}
                title={topic.title}
                href={topic.href}
              />
            );
          })}
        </S.SidebarList>
      </div>
    </Sidebar>
  );
};

export default ProjectSidebar;
