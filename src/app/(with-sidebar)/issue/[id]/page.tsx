'use client';

import { useEffect, useRef } from 'react';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { DndContext, DragOverlay } from '@dnd-kit/core';
import Canvas from '@/app/(with-sidebar)/issue/_components/canvas/canvas';
import CategoryCard from '@/app/(with-sidebar)/issue/_components/category/category-card';
import FilterPanel from '@/app/(with-sidebar)/issue/_components/filter-panel/filter-panel';
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { useSelectedIdeaQuery } from '@/app/(with-sidebar)/issue/hooks/react-query/use-selected-idea-query';
import { useAIStructuring } from '@/app/(with-sidebar)/issue/hooks/use-ai-structuring';
import { useCategoryOperations } from '@/app/(with-sidebar)/issue/hooks/use-category-operations';
import { useDragAndDrop } from '@/app/(with-sidebar)/issue/hooks/use-drag-and-drop';
import { useFilterIdea } from '@/app/(with-sidebar)/issue/hooks/use-filter-idea';
import { useIdeaStatus } from '@/app/(with-sidebar)/issue/hooks/use-idea-card';
import { useIdeaOperations } from '@/app/(with-sidebar)/issue/hooks/use-idea-operations';
import { useIssueData } from '@/app/(with-sidebar)/issue/hooks/use-issue-data';
import { useIssueEvents } from '@/app/(with-sidebar)/issue/hooks/use-issue-events';
import { useCanvasStore } from '@/app/(with-sidebar)/issue/store/use-canvas-store';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { useModalStore } from '@/components/modal/use-modal-store';
import { ISSUE_STATUS } from '@/constants/issue';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import IssueJoinModal from '../_components/issue-join-modal/issue-join-modal';
import { useIssueQuery } from '../hooks/react-query/use-issue-query';

const IssuePage = () => {
  const params = useParams<{ id: string }>();
  const pathname = usePathname();
  const issueIdFromPath = pathname?.split('/issue/')[1]?.split('/')[0] ?? '';
  const issueId = Array.isArray(params.id) ? params.id[0] : (params.id ?? issueIdFromPath);
  const router = useRouter();
  const { openModal, isOpen } = useModalStore();
  const hasOpenedModal = useRef(false);

  const scale = useCanvasStore((state) => state.scale);
  const userId = getUserIdForIssue(issueId) ?? '';

  const { data: selectedIdeaId } = useSelectedIdeaQuery(issueId);

  // 1. 이슈 데이터 초기화
  const { isLoading } = useIssueQuery(issueId);
  const { status, isAIStructuring, isCreateIdeaActive, isVoteButtonVisible, isVoteDisabled } =
    useIssueData(issueId);

  // userId 체크 및 모달 표시
  useEffect(() => {
    if (!issueId || hasOpenedModal.current || isOpen) return;

    if (!userId) {
      hasOpenedModal.current = true;
      openModal({
        title: '이슈 참여',
        content: <IssueJoinModal issueId={issueId} />,
        closeOnOverlayClick: false,
        hasCloseButton: false,
      });
    }
  }, [issueId, isOpen, openModal]);

  // 이슈가 종료된 경우 summary 페이지로 리다이렉트
  useEffect(() => {
    if (status === ISSUE_STATUS.CLOSE && issueId) {
      router.replace(`/issue/${issueId}/summary`);
    }
  }, [status, issueId, router]);

  // SSE 연결
  useIssueEvents({ issueId, enabled: !!userId });

  // 2. 아이디어 관련 작업
  const {
    ideas,
    handleCreateIdea,
    handleSaveIdea,
    handleDeleteIdea,
    handleSelectIdea,
    handleIdeaPositionChange,
    handleMoveIdeaToCategory,
  } = useIdeaOperations(issueId, isCreateIdeaActive);

  // 3. 카테고리 관련 작업
  const { categories, checkCategoryOverlap, handleCategoryPositionChange, handleDeleteCategory } =
    useCategoryOperations(issueId, ideas, scale);

  // 4. DnD 관련 작업
  const { sensors, activeId, overlayEditValue, handleDragStart, handleDragEnd } = useDragAndDrop({
    ideas,
    scale,
    onIdeaPositionChange: handleIdeaPositionChange,
    onMoveIdeaToCategory: handleMoveIdeaToCategory,
  });

  // 5. AI 구조화 작업
  useAIStructuring({
    issueId,
    ideas,
  });

  // 하이라이트된 아이디어
  const { activeFilter, setFilter, filteredIds } = useFilterIdea(issueId, ideas);
  const getIdeaStatus = useIdeaStatus(filteredIds, activeFilter);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 채택 단계 시작 시 필터 UI 적용 */}
        {status === 'SELECT' && (
          <FilterPanel
            value={activeFilter}
            onChange={setFilter}
          />
        )}

        <Canvas onDoubleClick={handleCreateIdea}>
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
            .filter((idea) => idea.categoryId === null)
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

        {/* 드래그 오버레이 (고스트 이미지) */}
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
      </DndContext>

      {isLoading && <LoadingOverlay />}
      {/* AI 구조화 로딩 오버레이 */}
      {isAIStructuring && <LoadingOverlay message="AI가 아이디어를 분류하고 있습니다..." />}
    </>
  );
};

export default IssuePage;
