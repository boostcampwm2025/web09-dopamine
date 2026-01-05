'use client';

import styled from '@emotion/styled';

export const StyledNewIssueButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background-color: ${({ theme }) => theme.colors.green[600]};
  border: none;
  border-radius: ${({ theme }) => theme.radius.half};
  box-shadow: 0 4px 4px -1px rgba(0, 0, 0, 0.2);
  cursor: pointer;
`;
