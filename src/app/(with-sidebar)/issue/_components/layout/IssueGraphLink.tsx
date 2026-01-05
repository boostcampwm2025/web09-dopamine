import Image from 'next/image';
import * as S from './styles';

export default function IssueGraphLink() {
  return (
    <S.Wrapper>
      <S.IssueGraphLink href="#">
        <Image
          src="/map.svg"
          alt="지도 이미지"
          width={16}
          height={16}
        />
        이슈 그래프 보기
      </S.IssueGraphLink>
    </S.Wrapper>
  );
}
