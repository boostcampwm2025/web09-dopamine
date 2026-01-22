import styled from '@emotion/styled';
import {
  FormContainer,
  FormFooter,
  FormInfoContainer,
  FormInput,
  FormInputRow,
  FormInputTitle,
  FormInputWrapper,
  FormSubmitButton,
  FormTextarea,
} from '@/components/modal/modal-form.styles';
import { theme } from '@/styles/theme';

type Variant = 'topic' | 'project';

export const Container = styled(FormContainer)<{ $variant: Variant }>`
  gap: ${({ $variant }) => ($variant === 'project' ? '30px' : '20px')};
  min-width: ${({ $variant }) => ($variant === 'topic' ? '400px' : 'unset')};
`;

export const InfoContainer = styled(FormInfoContainer)<{ $variant: Variant }>`
  gap: ${({ $variant }) => ($variant === 'project' ? '10px' : '16px')};
`;

export const InputWrapper = styled(FormInputWrapper)``;

export const InputTitle = styled(FormInputTitle)``;

export const InputRow = styled(FormInputRow)``;

export const Input = styled(FormInput)<{ $variant: Variant }>`
  padding: ${({ $variant }) => ($variant === 'project' ? '12px 44px 12px 8px' : '12px 16px')};
`;

export const Textarea = styled(FormTextarea)<{ $variant: Variant }>`
  padding: ${({ $variant }) => ($variant === 'project' ? '12px 44px 12px 8px' : '12px 16px')};
`;

export const InputDescription = styled.div`
  font-size: ${theme.font.size.medium};
  color: ${theme.colors.red[500]};
`;

export const CharCount = styled.span<{ $isOverLimit: boolean }>`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: ${theme.font.size.small};
  font-weight: ${theme.font.weight.semibold};
  color: ${({ $isOverLimit }) => ($isOverLimit ? theme.colors.red[500] : theme.colors.gray[600])};
  pointer-events: none;
`;

export const Footer = styled(FormFooter)``;

export const SubmitButton = styled(FormSubmitButton)<{ $variant: Variant }>`
  height: ${({ $variant }) => ($variant === 'project' ? '40px' : 'auto')};
  padding: ${({ $variant }) => ($variant === 'project' ? '0 18px' : '12px 24px')};
`;
