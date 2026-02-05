import Image from 'next/image';
import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

const BaseCard = styled.div`
  background-color: white;
  border-radius: ${theme.radius.large};
  padding: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 240px;

  &:hover {
    box-shadow: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
  }
`;

// 프로젝트 카드
export const Card = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 20px;
  border: 1px solid ${theme.colors.gray[200]};
  position: relative;
`;

export const CardHeader = styled.div<{ hasIcon?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: ${({ hasIcon }) => (hasIcon ? '0' : '20px')};
`;

export const Icon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.blue[50]};
  border-radius: ${theme.radius.medium};
`;

export const Title = styled.h3`
  font-size: ${theme.font.size.large};
  font-weight: ${theme.font.weight.bold};
  color: black;
  margin: 0;
`;

export const Info = styled.p`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.regular};
  color: ${theme.colors.gray[400]};
  margin: 0;
`;

export const CardFooter = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Divider = styled.div`
  width: 100%;
  height: 1px;
  background-color: ${theme.colors.gray[200]};
`;

export const CardBody = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export const MemberAvatars = styled.div`
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
`;

export const MemberAvatar = styled(Image)`
  border-radius: 50%;
  border: 2px solid white;

  &:not(:first-of-type) {
    margin-left: -8px;
  }
`;

export const RestCount = styled.span`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.regular};
  color: ${theme.colors.gray[400]};
  margin-left: 4px;
`;

export const AddMember = styled.button`
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.green[600]};
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;

  text-align: left;

  &:hover {
    color: ${theme.colors.green[700]};
  }
`;

// 새 프로젝트 만들기 카드
export const CreateCard = styled(BaseCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 2px dashed ${theme.colors.gray[200]};
  min-height: 240px;

  &:hover {
    border-color: ${theme.colors.gray[400]};
  }
`;

export const CreateIcon = styled.div`
  font-size: 40px;
  color: ${theme.colors.gray[300]};
`;

export const CreateText = styled.p`
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.gray[300]};
  margin: 0;
  font-weight: ${theme.font.weight.bold};
`;

export const MenuWrapper = styled.div`
  position: absolute;
  top: 24px;
  right: 24px;
  z-index: 10;
`;

export const Button = styled.button`
  cursor: pointer;
  background: none;
  border-radius: ${theme.radius.small};
  padding: 4px;
  display: flex;

  &:hover {
    background-color: ${theme.colors.gray[100]};
  }
`;

export const MenuModal = styled.div`
  position: absolute;
  top: 24px;
  right: 0;
  min-width: 120px;
  padding: 8px;
  background-color: white;
  border: 1px solid ${theme.colors.gray[200]};
  border-radius: ${theme.radius.medium};
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.08);
`;

export const MenuItem = styled.button`
  position: relative;
  width: 100%;
  padding: 8px 10px;
  background: none;
  border: none;
  border-radius: ${theme.radius.small};
  text-align: left;
  cursor: pointer;
  color: ${theme.colors.red[600]};

  &:hover {
    background-color: ${theme.colors.gray[50]};
  }

  &:hover > span {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

export const Tooltip = styled.span`
  position: absolute;
  right: 0;
  top: 100%;
  margin-top: 6px;
  padding: 6px 8px;
  background-color: ${theme.colors.gray[900]};
  color: white;
  border-radius: ${theme.radius.small};
  font-size: ${theme.font.size.small};
  white-space: nowrap;
  opacity: 0;
  transform: translateY(-4px);
  pointer-events: none;
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
`;
