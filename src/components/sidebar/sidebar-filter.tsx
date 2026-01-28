import { useState, useRef, useEffect } from 'react';
import * as S from './sidebar-filter.styles';

interface SidebarFilterProps {
  value: 'issue' | 'member';
  onChange: (value: 'issue' | 'member') => void;
}

export default function SidebarFilter({ value, onChange }: SidebarFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (newValue: 'issue' | 'member') => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <S.Container ref={filterRef}>
      <S.Trigger onClick={() => setIsOpen(!isOpen)}>
        {value === 'issue' ? '이슈' : '멤버'}
      </S.Trigger>
      {isOpen && (
        <S.Menu>
          <S.MenuItem isActive={value === 'issue'}>
            <button onClick={() => handleSelect('issue')}>이슈</button>
          </S.MenuItem>
          <S.MenuItem isActive={value === 'member'}>
            <button onClick={() => handleSelect('member')}>멤버</button>
          </S.MenuItem>
        </S.Menu>
      )}
    </S.Container>
  );
}
