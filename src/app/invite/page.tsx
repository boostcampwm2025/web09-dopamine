'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useInvitationInfo } from '@/hooks/invitation/use-invitation-query';
import * as S from './pags.styles';

export default function Page() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get('code');

  const { data, isLoading, isError } = useInvitationInfo(code);

  useEffect(() => {
    if (!code || isError) {
      toast.error('유효하지 않은 접근입니다!');
      router.replace('/');
    }
  }, [code, isError, router]);

  if (isLoading) {
    return <LoadingOverlay message="초대 링크 확인 중.." />;
  }

  // 로딩은 끝났는데 데이터가 없거나 에러인 경우
  if (!code || isError || !data) {
    return null;
  }

  return (
    <S.InviteContainer fullScreen={true}>
      <S.PostItWrapper>
        <S.InviteMain>
          <S.IconWrapper>
            {/* 프로젝트 아이콘 ?? 로고 (로고 필요함)
            <S.IconCircle>
            </S.IconCircle> */}
          </S.IconWrapper>
          <S.MessageSection>
            <S.Title>프로젝트 초대</S.Title>
            <S.Description>
              <S.StrongText>{data?.ownerName}</S.StrongText>님의{' '}
              <S.StrongText>{data?.projectTitle}</S.StrongText> 프로젝트에 초대합니다.
              <br />
              {data?.memberCount}명의 멤버가 참여중입니다.
            </S.Description>
          </S.MessageSection>

          <S.ButtonGroup>
            <S.Button>참여하기</S.Button>
          </S.ButtonGroup>
        </S.InviteMain>

        <S.Shadow />
      </S.PostItWrapper>
    </S.InviteContainer>
  );
}
