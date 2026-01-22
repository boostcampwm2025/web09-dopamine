import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const SidebarSection = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
`;

export const TopicSectionWrapper = styled.div`
  flex: 0.4;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const MemberSectionWrapper = styled.div`
  flex: 0.6;
  min-height: 0;
  display: flex;
  flex-direction: column;
`;

export const ScrollableSection = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: #e5e7eb;
`;
