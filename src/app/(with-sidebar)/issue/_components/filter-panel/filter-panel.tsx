import * as S from './filter-panel.styles';

export default function FilterPanel() {
  return (
    <S.FilterPanel>
      <S.Btn $variant="most-liked">
        찬성을 많이 받은 이슈
      </S.Btn>
      <S.Btn $variant="hot-potato">
        논쟁이 뜨거운 이슈
      </S.Btn>
      <S.Btn $variant="none">
        필터 제거
      </S.Btn>
    </S.FilterPanel>
  );
}
