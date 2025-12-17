import * as S from './styles';
import { IssueStatusType } from './types';

interface SidebarItemProps {
  title: string;
  href: string;
  status?: IssueStatusType;
}

const ISSUE_STATUS: Record<IssueStatusType, string> = {
  open: 'Open',
  voting: 'Voting',
  closed: 'Closed',
};

export default function SidebarItem({ title, href, status }: SidebarItemProps) {
  return (
    <S.SidebarListItem>
      <S.ListItemLink href={href}>
        <span>{title}</span>
        {status && <S.StatusLabel status={status}>{ISSUE_STATUS[status]}</S.StatusLabel>}
      </S.ListItemLink>
    </S.SidebarListItem>
  );
}
