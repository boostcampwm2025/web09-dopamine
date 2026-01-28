import styled from '@emotion/styled';
import { theme } from '@/styles/theme';

export const CardContainer = styled.div`
  width: 512px;
  background-color: ${theme.colors.white};
  border-radius: ${theme.radius.large};
  overflow: hidden;
  box-shadow: 0px 4px 40px 0px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  padding-bottom: 25px;
`;

export const TopSection = styled.div`
  background-color: ${theme.colors.green[700]};
  height: 130px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  margin-bottom: 60px;
`;

export const ProfileImageWrapper = styled.div`
  position: absolute;
  bottom: -50px;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${theme.colors.white};
  padding: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.05);
`;

export const ProfileImage = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: ${theme.colors.gray[100]};
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  font-size: ${theme.font.size.large};
  color: ${theme.colors.gray[500]};
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const InfoSection = styled.div`
  text-align: center;
  margin-bottom: 40px;
`;

export const Name = styled.h2`
  font-size: ${theme.font.size.xl};
  font-weight: ${theme.font.weight.bold};
  color: ${theme.colors.black};
  margin-bottom: 5px;
`;

export const Email = styled.p`
  font-size: ${theme.font.size.medium};
  font-weight: ${theme.font.weight.regular};
  color: ${theme.colors.gray[400]};
`;

export const ContentSection = styled.div`
  padding: 0 33px;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Divider = styled.div`
  height: 1px;
  background-color: ${theme.colors.gray[100]};
  margin: 10px 0;
`;
