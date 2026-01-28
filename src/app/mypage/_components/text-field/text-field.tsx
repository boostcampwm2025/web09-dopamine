import { ReactNode, useState } from 'react';
import * as S from './text-field.styles';

interface TextFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onEnter?: () => void;
  placeholder?: string;
  readOnly?: boolean;
  description?: string;
  icon?: ReactNode;
  onIconClick?: () => void;
}

export default function TextField({
  label,
  value,
  onChange,
  onBlur,
  onEnter,
  placeholder,
  readOnly = false,
  description,
  icon,
  onIconClick,
}: TextFieldProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      onEnter?.();
    }
  };

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
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
        />
        {icon && (
          <S.IconWrapper 
            className={!readOnly && isFocused ? 'active' : ''}
            onClick={onIconClick}
            style={{ cursor: onIconClick ? 'pointer' : 'default' }}
          >
            {icon}
          </S.IconWrapper>
        )}
      </S.InputWrapper>
      {description && <S.Description>{description}</S.Description>}
    </S.TextFieldContainer>
  );
}
