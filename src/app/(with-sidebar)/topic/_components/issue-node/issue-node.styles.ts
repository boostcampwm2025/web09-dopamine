import styled from '@emotion/styled';
import { ISSUE_STATUS } from '@/constants/issue';
import { theme } from '@/styles/theme';
import { IssueStatus } from '@/types/issue';

export const NodeContainer = styled.div<{ status: IssueStatus }>`
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 12px;
  background-color: ${theme.colors.white};
  color: ${theme.colors.black};
  border-radius: ${theme.radius.large};
  cursor: pointer;
  width: 250px;
  height: fit-content;

  box-sizing: border-box;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  ${({ status }) => {
    switch (status) {
      case ISSUE_STATUS.BRAINSTORMING:
        return `outline: 2px solid ${theme.colors.yellow[400]}`;
      case ISSUE_STATUS.CATEGORIZE:
        return `
          outline: 2px solid ${theme.colors.blue[400]};
        `;
      case ISSUE_STATUS.VOTE:
        return `
          outline: 2px solid ${theme.colors.red[400]};
        `;
      case ISSUE_STATUS.SELECT:
        return `
          outline: 2px solid ${theme.colors.green[600]};
        `;
      case ISSUE_STATUS.CLOSE:
        return `
          outline: 2px solid ${theme.colors.gray[500]};
          background-color: ${theme.colors.gray[100]};
        `;
      default:
        return `
          outline: 2px solid ${theme.colors.gray[300]};
          background-color: ${theme.colors.gray[100]};
        `;
    }
  }}
`;

export const BadgeWrapper = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
`;

export const Badge = styled.div<{ status: IssueStatus }>`
  border-radius: ${theme.radius.large};
  padding: 4px 12px;
  font-size: ${theme.font.size.small};
  color: ${theme.colors.white};
  font-weight: ${theme.font.weight.bold};

  ${({ status }) => {
    switch (status) {
      case ISSUE_STATUS.BRAINSTORMING:
        return `
          background-color: ${theme.colors.yellow[100]};
          color: ${theme.colors.yellow[600]};
        `;
      case ISSUE_STATUS.CATEGORIZE:
        return `
          background-color: ${theme.colors.blue[100]};
          color: ${theme.colors.blue[600]};
        `;
      case ISSUE_STATUS.VOTE:
        return `
          background-color: ${theme.colors.red[100]};
          color: ${theme.colors.red[600]};
        `;
      case ISSUE_STATUS.SELECT:
        return `
          background-color: ${theme.colors.green[100]};
          color: ${theme.colors.green[600]};
        `;
      case ISSUE_STATUS.CLOSE:
        return `
          background-color: ${theme.colors.gray[500]};
        `;
      default:
        return `
          background-color: ${theme.colors.gray[400]};
        `;
    }
  }}
`;

export const TitleWrapper = styled.div`
  display: flex;
  justify-content: flex-start;
  margin-bottom: 8px;
`;

export const Title = styled.div<{ status?: IssueStatus }>`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};

  ${({ status }) => {
    switch (status) {
      case ISSUE_STATUS.CLOSE:
        return `
          color: ${theme.colors.gray[500]};
        `;
      default:
        return `
        color: ${theme.colors.gray[900]};`;
    }
  }}
`;
