import Image from 'next/image';
import * as S from './new-issue-button.styles';

//TODO: 이벤트 연결 필요
export default function NewIssueButton() {
  return (
    <S.StyledNewIssueButton>
      <Image
        src="/add.svg"
        alt="플러스 아이콘"
        width={18}
        height={18}
      ></Image>
    </S.StyledNewIssueButton>
  );
}
