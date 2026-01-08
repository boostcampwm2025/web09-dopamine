import type { MouseEvent } from 'react';
import * as S from './filter-panel.styles';

export type FilterKey = 'most-liked' | 'hot-potato' | 'none';

interface FilterPanelProps {
  value: FilterKey;
  onChange: (value: FilterKey) => void;
}

export default function FilterPanel({ value, onChange }: FilterPanelProps) {
  const toggleFilter = (nextFilter: 'most-liked' | 'hot-potato') => {
    onChange(value === nextFilter ? 'none' : nextFilter);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const nextFilter = e.currentTarget.dataset.filter as 'most-liked' | 'hot-potato' | undefined;
    if (!nextFilter) return;
    toggleFilter(nextFilter);
  };

  return (
    <S.FilterPanel>
      <S.Btn
        type="button"
        data-filter="most-liked"
        $selected={value === 'most-liked'}
        // onClick={handleClick}
      >
        좋아요를 많이 받은 아이디어
      </S.Btn>
      <S.Btn
        type="button"
        data-filter="hot-potato"
        $selected={value === 'hot-potato'}
        // onClick={handleClick}
      >
        논쟁이 뜨거운 아이디어
      </S.Btn>
    </S.FilterPanel>
  );
}
