import Image from 'next/image';
import * as S from './issue-graph-link.styles';

interface IssueGraphLinkProps {
  onClick: () => void;
}

export default function IssueGraphLink({ onClick }: IssueGraphLinkProps) {
  return (
    <S.Wrapper onClick={onClick}>
      <S.StyledIssueGraphLink href="#">
        <Image
          src="/map.svg"
          alt="지도 이미지"
          width={16}
          height={16}
        />
        이슈 맵 보기
      </S.StyledIssueGraphLink>
    </S.Wrapper>
  );
}
