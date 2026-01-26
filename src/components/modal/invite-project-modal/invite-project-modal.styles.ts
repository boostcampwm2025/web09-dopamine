import styled from '@emotion/styled';
import { InputTitle } from '@/app/project/_components/project-create-modal/project-create-modal.styles';
import { theme } from '@/styles/theme';

export * from '@/components/modal/issue-create-modal/issue-create-modal.styles';
export * from '@/app/project/_components/project-create-modal/project-create-modal.styles';

// InfoContainer 간격 조정
export const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const EmailInputTitle = styled(InputTitle)`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;
export const Title = styled.span`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[900]};
`;

export const TagList = styled.ul`
  display: flex;
  flex-flow: row wrap;
  gap: 8px;
  /* min-height: 32px; */
`;

export const TagListItem = styled.li`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 6px 12px;
  color: ${theme.colors.gray[700]};
  border-radius: ${theme.radius.large};
  background-color: ${theme.colors.gray[100]};
  border: 1px solid ${theme.colors.gray[200]};
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

export const Divider = styled.div`
  height: 1px;
  background-color: ${theme.colors.gray[200]};
  margin: 5px 0;
`;

export const SuccessSection = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-radius: ${theme.radius.medium};
  background-color: ${theme.colors.green[50]};
  border: 1px solid ${theme.colors.green[200]};
  margin-top: 8px;
`;

export const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  color: ${theme.colors.green[700]};
  flex: 1;
`;

export const CopyLinkButton = styled.button`
  padding: 10px 16px;
  border-radius: ${theme.radius.medium};
  background-color: ${theme.colors.green[600]};
  color: ${theme.colors.white};
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.semibold};
  border: none;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;

  &:hover {
    background-color: ${theme.colors.green[700]};
  }

  &:active {
    background-color: ${theme.colors.green[800]};
  }

  &:disabled {
    background-color: ${theme.colors.gray[300]};
    cursor: not-allowed;
  }
`;

export const ResetButton = styled.button`
  &:hover {
    color: ${theme.colors.red[500]};
  }
`;
