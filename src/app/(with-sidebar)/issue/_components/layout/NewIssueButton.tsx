import Image from 'next/image';
import * as S from './styles';

//TODO: 이벤트 연결 필요
export default function NewIssueButton() {
  return (
    <S.NewIssueButton>
      <Image
        src="/add.svg"
        alt="플러스 아이콘"
        width={18}
        height={18}
      ></Image>
    </S.NewIssueButton>
  );
}
