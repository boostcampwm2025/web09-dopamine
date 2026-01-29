import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const Container = styled.div`
  width: 450px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  background-color: ${theme.colors.gray[50]};
  padding: 20px;
  border-radius: ${theme.radius.medium};
`;

export const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
`;

export const Title = styled.h3`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black};
`;

export const LoginCard = styled.div`
  background-color: ${theme.colors.white};
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.small};
  padding: 15px 11px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const LoginInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const ProviderIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${theme.colors.gray[200]};
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.blue[500]};
  font-size: ${theme.font.size.small};
`;

export const ProviderText = styled.span`
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.gray[700]};
`;

export const StatusBadge = styled.div`
  background-color: ${theme.colors.green[50]};
  color: ${theme.colors.green[600]};
  padding: 6px 12px;
  border-radius: ${theme.radius.medium};
  font-size: ${theme.font.size.xs};
  font-weight: ${theme.font.weight.bold};
  text-transform: uppercase;
`;
