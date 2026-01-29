'use client';

import Image from 'next/image';
import { useModalStore } from '@/components/modal/use-modal-store';
import CreateIssueModal from '../create-issue-modal/create-issue-modal';
import { IssueNodeSkeleton } from '../issue-node/issue-node';
import * as S from './issue-node-skeleton-grid.styles';

const skeletonOffsets = [
  { x: -300, y: -200, top: 35, left: 40 },
  { x: 120, y: -200, top: 35, left: 60 },
  { x: -160, y: 100, top: 65, left: 40 },
  { x: 140, y: 100, top: 65, left: 60 },
];

export default function IssueNodeSkeletonGrid() {
  const { openModal } = useModalStore();

  const handleClick = () => {
    openModal({
      title: '새 이슈 만들기',
      content: <CreateIssueModal />,
      hasCloseButton: true,
    });
  };

  return (
    <S.SkeletonGridContainer>
      <S.SkeletonGrid>
        {skeletonOffsets.map((offset, index) => (
          <S.SkeletonItem
            key={`skeleton-${index}`}
            x={offset.x}
            y={offset.y}
            top={offset.top}
            left={offset.left}
          >
            <IssueNodeSkeleton />
          </S.SkeletonItem>
        ))}
      </S.SkeletonGrid>
      <S.EmptyOverlay>
        <S.EmptyContent>
          <S.EmptyCard>
            <S.EmptyIcon>
              <Image src="/edit.svg" alt="" width={28} height={28} />
            </S.EmptyIcon>
            <S.EmptyTitle>첫 번째 이슈를 등록하고 시작하세요</S.EmptyTitle>
            <S.EmptyDescription>
              지금 바로 토픽의 첫 단추를 끼워보세요.
            </S.EmptyDescription>
            <S.EmptyButton type="button" onClick={handleClick}>
              <Image src="/white-add.svg" alt="" width={16} height={16} />
              이슈 추가
            </S.EmptyButton>
          </S.EmptyCard>
        </S.EmptyContent>
      </S.EmptyOverlay>
    </S.SkeletonGridContainer>
  );
}
