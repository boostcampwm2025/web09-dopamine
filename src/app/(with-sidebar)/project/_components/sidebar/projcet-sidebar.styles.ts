import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const SidebarTitle = styled.div`
  display: flex;

  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px 16px;
  font-size: ${theme.font.size.medium};
  font-weight: 700;
  letter-spacing: 1px;
`;
