import type { MouseEvent } from 'react';
import * as S from './filter-panel.styles';

export type FilterKey = 'most-liked' | 'need-discussion' | 'none';

interface FilterPanelProps {
  value: FilterKey;
  onChange: (value: FilterKey) => void;
}

export default function FilterPanel({ value, onChange }: FilterPanelProps) {
  const toggleFilter = (nextFilter: 'most-liked' | 'need-discussion') => {
    onChange(value === nextFilter ? 'none' : nextFilter);
  };

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    const nextFilter = e.currentTarget.dataset.filter as
      | 'most-liked'
      | 'need-discussion'
      | undefined;
    if (!nextFilter) return;
    toggleFilter(nextFilter);
  };

  return (
    <S.FilterPanel>
      <S.Btn
        type="button"
        data-filter="most-liked"
        $selected={value === 'most-liked'}
        onClick={handleClick}
      >
        찬반순
      </S.Btn>
      <S.Btn
        type="button"
        data-filter="need-discussion"
        $selected={value === 'need-discussion'}
        onClick={handleClick}
      >
        논의 필요
      </S.Btn>
    </S.FilterPanel>
  );
}
