import { useState, useRef, useEffect } from 'react';
import * as S from './sidebar-filter.styles';

export type FilterType = 'issue' | 'member' | 'topic';

interface SidebarFilterProps {
  value: FilterType;
  onChange: (value: FilterType) => void;
  items?: FilterType[];
}

const LABEL_MAP: Record<FilterType, string> = {
  issue: '이슈',
  member: '멤버',
  topic: '토픽',
};

export default function SidebarFilter({ value, onChange, items = ['issue', 'member'] }: SidebarFilterProps) {
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

  const handleSelect = (newValue: FilterType) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <S.Container ref={filterRef}>
      <S.Trigger onClick={() => setIsOpen(!isOpen)}>
        {LABEL_MAP[value]}
      </S.Trigger>
      {isOpen && (
        <S.Menu>
          {items.map((item) => (
            <S.MenuItem key={item} isActive={value === item}>
              <button onClick={() => handleSelect(item)}>{LABEL_MAP[item]}</button>
            </S.MenuItem>
          ))}
        </S.Menu>
      )}
    </S.Container>
  );
}
