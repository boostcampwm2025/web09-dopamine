import { STATUS_LABEL } from '@/constants/issue';
import { IssueStatus } from '@/types/issue';
import * as S from './sidebar.styles';

interface SidebarItemProps {
  isTopic?: boolean;
  title: string;
  href: string;
  status?: IssueStatus;
}

export default function SidebarItem({ isTopic, title, href, status }: SidebarItemProps) {
  return (
    <S.SidebarListItem>
      <S.ListItemLink href={href}>
        {isTopic && <S.Bullet />}
        <span>{title}</span>
        {status && <S.StatusLabel status={status}>{STATUS_LABEL[status]}</S.StatusLabel>}
      </S.ListItemLink>
    </S.SidebarListItem>
  );
}
