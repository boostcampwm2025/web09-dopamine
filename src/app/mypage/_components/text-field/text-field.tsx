import { ReactNode, useState } from 'react';
import * as S from './text-field.styles';

interface TextFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  description?: string;
  icon?: ReactNode;
}

export default function TextField({
  label,
  value,
  onChange,
  placeholder,
  readOnly = false,
  description,
  icon,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <S.TextFieldContainer>
      <S.Label className={!readOnly && isFocused ? 'active' : ''}>{label}</S.Label>
      <S.InputWrapper
        $isReadOnly={readOnly}
        $isFocused={isFocused}
      >
        <S.Input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          disabled={readOnly}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        {icon && (
          <S.IconWrapper className={!readOnly && isFocused ? 'active' : ''}>{icon}</S.IconWrapper>
        )}
      </S.InputWrapper>
      {description && <S.Description>{description}</S.Description>}
    </S.TextFieldContainer>
  );
}
