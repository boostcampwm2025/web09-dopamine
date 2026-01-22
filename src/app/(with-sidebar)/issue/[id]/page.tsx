'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import Canvas from '@/app/(with-sidebar)/issue/_components/canvas/canvas';
import CategoryCard from '@/app/(with-sidebar)/issue/_components/category/category-card';
import FilterPanel from '@/app/(with-sidebar)/issue/_components/filter-panel/filter-panel';
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { useCanvasStore } from '@/app/(with-sidebar)/issue/store/use-canvas-store';
import { ErrorPage } from '@/components/error/error';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useModalStore } from '@/components/modal/use-modal-store';
import { ISSUE_STATUS, ISSUE_STATUS_DESCRIPTION } from '@/constants/issue';
import { joinIssueAsLoggedInUser } from '@/lib/api/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { getActiveDiscussionIdeaIds } from '@/lib/utils/active-discussion-idea';
import IssueJoinModal from '../_components/issue-join-modal/issue-join-modal';
import {
  useCategoryOperations,
  useDragAndDrop,
  useFilterIdea,
  useIdeaOperations,
  useIdeaStatus,
  useIssueData,
  useIssueEvents,
  useIssueQuery,
  useSelectedIdeaQuery,
} from '../hooks';

const IssuePage = () => {
  const params = useParams<{ id: string; issueId?: string }>();
  const pathname = usePathname();
  const issueIdFromPath = pathname?.split('/issue/')[1]?.split('/')[0] ?? '';
  const issueId =
    params.issueId ?? (Array.isArray(params.id) ? params.id[0] : (params.id ?? issueIdFromPath));
  const router = useRouter();
  const { openModal, isOpen } = useModalStore();
  const hasOpenedModal = useRef(false);

  const scale = useCanvasStore((state) => state.scale);
  const userId = getUserIdForIssue(issueId) ?? '';

  const { data: selectedIdeaId } = useSelectedIdeaQuery(issueId);

  // 드래그 중인 아이디어의 임시 position 관리
  const [draggingPositions, setDraggingPositions] = useState<
    Record<string, { x: number; y: number }>
  >({});

  // 1. 이슈 데이터 초기화
  const { isLoading } = useIssueQuery(issueId);
  const {
    isIssueError,
    status,
    members,
    isQuickIssue,
    isAIStructuring,
    isCreateIdeaActive,
    isVoteButtonVisible,
    isVoteDisabled,
  } = useIssueData(issueId);

  const { data: session, status: sessionStatus } = useSession();

  // 로그인 사용자가 이슈에 참여했는지 확인
  const isLoggedInUserMember = useMemo(() => {
    if (!session?.user?.id || !members) return false;
    return members.some((member) => member.id === session.user.id);
  }, [session?.user?.id, members]);

  // 토픽 내 이슈 접근 권한 검증
  useEffect(() => {
    if (!issueId || isLoading || sessionStatus === 'loading') return;

    // 토픽 내 이슈인데 로그인하지 않은 경우 → 홈으로 리다이렉트
    if (isQuickIssue === false && !session?.user?.id) {
      router.replace('/');
    }
  }, [issueId, isQuickIssue, session, sessionStatus, isLoading, router]);

  // 로그인 사용자 자동 참여
  useEffect(() => {
    const autoJoinLoggedInUser = async () => {
      if (!issueId || isLoading || sessionStatus === 'loading' || !session?.user?.id) return;

      // 이미 참여한 경우 스킵
      if (isLoggedInUserMember) return;

      try {
        await joinIssueAsLoggedInUser(issueId);
      } catch (error) {
        console.error('자동 참여 실패:', error);
      }
    };

    autoJoinLoggedInUser();
  }, [issueId, isLoading, sessionStatus, session?.user?.id, isLoggedInUserMember]);

  // userId 체크 및 모달 표시
  useEffect(() => {
    if (!issueId || hasOpenedModal.current || isOpen) return;

    // 로그인한 사용자는 참여 모달 표시 안 함 (토픽 -> 이슈)
    if (session?.user?.id) return;

    // 익명 사용자 + localStorage에 userId 없음 -> 참여 모달
    if (!userId) {
      hasOpenedModal.current = true;
      openModal({
        title: '이슈 참여',
        content: <IssueJoinModal issueId={issueId} />,
        closeOnOverlayClick: false,
        hasCloseButton: false,
      });
    }
  }, [issueId, session, isOpen, openModal, userId]);

  // 이슈가 종료된 경우 summary 페이지로 리다이렉트
  useEffect(() => {
    if (status === ISSUE_STATUS.CLOSE && issueId) {
      router.replace(`/issue/${issueId}/summary`);
    }
  }, [status, issueId, router]);

  // SSE 연결
  // 로그인 사용자 또는 localStorage에 userId가 있는 익명 사용자만 연결
  const shouldConnectSSE = !!(session?.user?.id || userId);
  useIssueEvents({ issueId, enabled: shouldConnectSSE });

  // 2. 아이디어 관련 작업
  const {
    ideas: serverIdeas,
    isIdeasError,
    handleCreateIdea,
    handleSaveIdea,
    handleDeleteIdea,
    handleSelectIdea,
    handleIdeaPositionChange: serverHandleIdeaPositionChange,
    handleMoveIdeaToCategory,
  } = useIdeaOperations(issueId, isCreateIdeaActive);

  // 드래그 중인 position을 오버레이
  const ideas = useMemo(() => {
    return serverIdeas.map((idea) => {
      if (draggingPositions[idea.id]) {
        return { ...idea, position: draggingPositions[idea.id] };
      }
      return idea;
    });
  }, [serverIdeas, draggingPositions]);

  // position 변경 핸들러 (로컬 상태로 즉시 반영)
  const handleIdeaPositionChange = useCallback(
    (id: string, position: { x: number; y: number }) => {
      // 즉시 로컬 상태 업데이트 (튕김 방지)
      setDraggingPositions((prev) => ({ ...prev, [id]: position }));

      // 서버 요청 (백그라운드)
      serverHandleIdeaPositionChange(id, position);

      // 서버 응답 후 로컬 상태 제거
      setTimeout(() => {
        setDraggingPositions((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 300);
    },
    [serverHandleIdeaPositionChange],
  );

  // 3. 카테고리 관련 작업
  const {
    categories,
    isError: isCategoryError,
    checkCategoryOverlap,
    handleCategoryPositionChange,
    handleDeleteCategory,
  } = useCategoryOperations(issueId, ideas, scale);

  // 4. DnD 관련 작업
  const { sensors, activeId, overlayEditValue, handleDragStart, handleDragEnd } = useDragAndDrop({
    ideas,
    scale,
    onIdeaPositionChange: handleIdeaPositionChange,
    onMoveIdeaToCategory: handleMoveIdeaToCategory,
  });

  // 하이라이트된 아이디어
  const { activeFilter, setFilter, filteredIds } = useFilterIdea(issueId);
  const getIdeaStatus = useIdeaStatus(filteredIds, activeFilter);

  // 댓글이 많은 아이디어 계산
  const activeDiscussionIdeaIds = useMemo(() => getActiveDiscussionIdeaIds(ideas), [ideas]);

  // 에러 여부 확인
  const hasError = isIssueError || isIdeasError || isCategoryError;

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 채택 단계 시작 시 필터 UI 적용 */}
        {status === 'SELECT' && !hasError && (
          <FilterPanel
            value={activeFilter}
            onChange={setFilter}
          />
        )}

        {hasError ? (
          <ErrorPage fullScreen={false} />
        ) : (
          <Canvas
            onDoubleClick={handleCreateIdea}
            bottomMessage={ISSUE_STATUS_DESCRIPTION[status]}
            enableAddIdea={status === ISSUE_STATUS.BRAINSTORMING}
          >
            {/* 카테고리들 - 내부에 아이디어 카드들을 children으로 전달 */}
            {categories.map((category) => {
              const categoryIdeas = ideas.filter((idea) => idea.categoryId === category.id);

              return (
                <CategoryCard
                  key={category.id}
                  {...category}
                  issueId={issueId}
                  onPositionChange={handleCategoryPositionChange}
                  checkCollision={checkCategoryOverlap}
                  onRemove={() => handleDeleteCategory(category.id)}
                  onDropIdea={(ideaId) => handleMoveIdeaToCategory(ideaId, category.id)}
                >
                  {categoryIdeas.map((idea) => (
                    <IdeaCard
                      key={idea.id}
                      {...idea}
                      author={idea.author}
                      userId={idea.userId}
                      issueId={issueId}
                      position={null}
                      isSelected={idea.id === selectedIdeaId}
                      status={getIdeaStatus(idea.id)}
                      isHotIdea={activeDiscussionIdeaIds.has(idea.id)}
                      isVoteButtonVisible={isVoteButtonVisible}
                      isVoteDisabled={isVoteDisabled}
                      onSave={(content) => handleSaveIdea(idea.id, content)}
                      onDelete={() => handleDeleteIdea(idea.id)}
                      onClick={() => handleSelectIdea(idea.id)}
                    />
                  ))}
                </CategoryCard>
              );
            })}

            {/* 자유 배치 아이디어들 (categoryId === null) */}
            {ideas
              .filter((idea) => idea.categoryId === null && idea.position !== null)
              .map((idea) => (
                <IdeaCard
                  key={idea.id}
                  {...idea}
                  issueId={issueId}
                  author={idea.author}
                  userId={idea.userId}
                  isSelected={idea.id === selectedIdeaId}
                  status={getIdeaStatus(idea.id)}
                  isVoteButtonVisible={isVoteButtonVisible}
                  isVoteDisabled={isVoteDisabled}
                  onPositionChange={handleIdeaPositionChange}
                  onSave={(content) => handleSaveIdea(idea.id, content)}
                  onDelete={() => handleDeleteIdea(idea.id)}
                />
              ))}
          </Canvas>
        )}

        {/* 드래그 오버레이 (고스트 이미지) */}
        {!hasError && (
          <DragOverlay dropAnimation={null}>
            {activeId
              ? (() => {
                  const activeIdea = ideas.find((idea) => idea.id === activeId);
                  if (!activeIdea) return null;

                  return (
                    <div
                      style={{
                        transform: `scale(${scale})`,
                        transformOrigin: '0 0', // 왼쪽 위 기준으로 scale
                      }}
                    >
                      <IdeaCard
                        {...activeIdea}
                        issueId={issueId}
                        content={overlayEditValue ?? activeIdea.content}
                        position={null}
                        isSelected={activeIdea.id === selectedIdeaId}
                        author={activeIdea.author}
                        userId={activeIdea.userId}
                        status={getIdeaStatus(activeIdea.id)}
                        isVoteButtonVisible={isVoteButtonVisible}
                        isVoteDisabled={isVoteDisabled}
                      />
                    </div>
                  );
                })()
              : null}
          </DragOverlay>
        )}
      </DndContext>

      {!hasError && isLoading && <LoadingOverlay />}
      {/* AI 구조화 로딩 오버레이 */}
      {!hasError && isAIStructuring && (
        <LoadingOverlay message="AI가 아이디어를 분류하고 있습니다..." />
      )}
    </>
  );
};

export default IssuePage;
