import styled from '@emotion/styled';
import { theme } from '@/styles/theme';
import { InputTitle } from '../project-create-modal/project-create-modal.styles';

export * from '@/components/modal/issue-create-modal/issue-create-modal.styles';
export * from '../project-create-modal/project-create-modal.styles';

export const EmailInputTitle = styled(InputTitle)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;
export const Title = styled.span`
  font-size: ${theme.font.size.medium};
`;

export const TagList = styled.ul`
  display: flex;
  flex-flow: row wrap;
  gap: 8px;
`;

export const TagListItem = styled.li`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 2px 8px;
  color: ${theme.colors.gray[600]};
  border-radius: ${theme.radius.large};
  background-color: ${theme.colors.green[100]};
  line-height: 1;

  & button {
    width: 10px;
    height: 12px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: 2;
    font-size: ${theme.font.size.large};
    font-weight: 200;
    color: ${theme.colors.gray[500]};

    &:hover {
      color: ${theme.colors.red[600]};
    }
  }
`;

export const CopyLinkButton = styled.button`
  &:hover {
    color: ${theme.colors.gray[500]};
  }
`;

export const ResetButton = styled.button`
  &:hover {
    color: ${theme.colors.red[500]};
  }
`;
