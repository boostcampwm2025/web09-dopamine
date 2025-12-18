import styled from '@emotion/styled';

type Theme = {
  colors?: {
    surface: string;
    surfaceMuted: string;
    border: string;
    borderMuted: string;
    accent: string;
    accentMuted: string;
    text: string;
    textMuted: string;
  },
};

type ThemeColors = NonNullable<Theme['colors']>;

const color = <K extends keyof ThemeColors>(
  theme: Theme,
  key: K,
  fallback: string,
) => theme?.colors?.[key] ?? fallback;

export const StyledCategoryCard = styled.section<{ muted?: boolean; isOver?: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 11px;
  background: ${({ muted, theme }) =>
    muted
      ? color(theme, 'surfaceMuted', '#fafafa')
      : color(theme, 'surface', '#f0fdf4')};
  border: 2px dashed
    ${({ muted, theme }) =>
      muted
        ? color(theme, 'borderMuted', '#e5e7eb')
        : color(theme, 'border', '#bbf7d0')};
  border-radius: 24px;
  padding: 16px;
  width: fit-content;
  min-width: 400px;
  max-width: 800px;
`;

export const Header = styled.header<{ muted?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  color: ${({ muted, theme }) =>
    muted
      ? color(theme, 'textMuted', '#9a9a9a')
      : color(theme, 'text', '#222222')};
  font-weight: 600;
  font-size: 14px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const Actions = styled.div`
  display: inline-flex;
  gap: 6px;
`;

export const Dot = styled.span<{ muted?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ muted, theme }) =>
    muted
      ? color(theme, 'accentMuted', '#c9c9c9')
      : color(theme, 'accent', '#00a94f')};
`;

export const Title = styled.span<{ muted?: boolean }>`
  color: ${({ muted, theme }) =>
    muted
      ? color(theme, 'textMuted', '#9ca3af')
      : color(theme, 'text', '#00a94f')};
`;

export const Input = styled.input`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 4px 8px;
  font-size: 14px;
  color: #111827;
`;

export const Btn = styled.button<{ muted?: boolean }>`
  display: ${({ muted }) => (muted ? 'none' : 'inline-flex')};
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background: #f8fafc;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
`;

export const DangerBtn = styled(Btn)`
  border-color: #FBD6D0;
  background: #FFFFFF;
  color: #EF5944;
`;

export const ChildrenWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 12px;
`;
