import styled from '@emotion/styled';

export const BaseFlex = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Container = styled(BaseFlex)`
  gap: 24px;
  width: 100%;
  height: 100%;
  min-width: 650px;
`;

export const LogoContainer = styled(BaseFlex)`
  flex-direction: row;
  gap: 8px;
`;

export const Logo = styled(BaseFlex)`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: linear-gradient(135deg, #00a94f 0%, #059669 100%);
  box-shadow:
    0 10px 15px -3px #bbf7d0,
    0 4px 6px -4px #bbf7d0;
  color: #fff;
  font-size: 20px;
  font-weight: 700;
`;

export const TitleContainer = styled(BaseFlex)`
  gap: 8px;
`;

export const Title = styled.h1`
  font-size: 90px;
  font-weight: 800;
  line-height: 96px;
  white-space: nowrap;
`;

export const Highlight = styled.span<{ color: string; background?: string }>`
  color: ${({ color }) => color};
  ${({ background }) => background && `background: ${background};`}
`;

export const SubTitleContainer = styled(BaseFlex)`
  gap: 8px;
  color: #4b5563;
`;

export const Text = styled.p`
  font-size: 24px;
  font-weight: 700;
  line-height: 32px;
`;

export const StartButton = styled.button<{ background?: string }>`
  width: 200px;
  height: 60px;
  border-radius: 16px;
  background: ${({ background }) => background || '#00a94f'};
  color: #fff;
  font-size: 24px;
  font-weight: 600;
  cursor: pointer;
`;

export const SocialLoginContainer = styled(BaseFlex)`
  margin-top: 20px;
  flex-direction: row;
  gap: 50px;
`;

export const ButtonContainer = styled(BaseFlex)`
  margin-top: 10px;
  gap: 40px;
`;