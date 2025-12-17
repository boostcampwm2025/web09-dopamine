import * as S from './styles';

interface SidebarItemProps {
  title: string;
  href: string;
  status?: string;
}

export default function SidebarItem({ title, href, status }: SidebarItemProps) {
  return (
    <S.SidebarListItem>
      <S.ListItemLink href={href}>{title}</S.ListItemLink>
      {status ?? <span>{status}</span>}
    </S.SidebarListItem>
  );
}
