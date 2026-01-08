'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import Canvas from '@/app/(with-sidebar)/issue/_components/canvas/canvas';
import CategoryCard from '@/app/(with-sidebar)/issue/_components/category/category-card';
import FilterPanel from '@/app/(with-sidebar)/issue/_components/filter-panel/filter-panel';
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { useIdeaHighlight } from '@/app/(with-sidebar)/issue/hooks/use-highlighted-ideas';
import { useCanvasStore } from '@/app/(with-sidebar)/issue/store/use-canvas-store';
import { useCategoryStore } from '@/app/(with-sidebar)/issue/store/use-category-store';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import { ISSUE_STATUS } from '@/constants/issue';

const IssuePage = () => {
  // TODO: URL 파라미터나 props에서 실제 issueId 가져오기
  // 예: const { issueId } = useParams() 또는 props.issueId
  // TODO: 실제 issueId로 useIssueStore > setInitialData 실행
  const params = useParams<{ id: string }>();
  const issueId = params.id;

  const {
    ideas,
    hasEditingIdea,
    resetEditingIdea,
    addIdea,
    updateIdeaContent,
    updateIdeaPosition,
    deleteIdea,
    setIdeas,
    selectIdea
  } = useIdeaStore(issueId);
  const { addCard, removeCard, setInitialCardData } = useIdeaCardStackStore(issueId);
  const { categories, setCategories, addCategory, deleteCategory, updateCategoryPosition } =
    useCategoryStore(issueId);

  const { isAIStructuring } = useIssueStore();
  const { finishAIStructure, setInitialData } = useIssueStore((state) => state.actions);
  const scale = useCanvasStore((state) => state.scale); // Canvas scale 가져오기

  const status = useIssueStore((state) => state.status);
  const isCreateIdeaActive = status === 'BRAINSTORMING';

  const voteStatus = useIssueStore((state) => state.voteStatus);

  // Redis에서 이슈 상태 가져와서 초기화
  useEffect(() => {
    const fetchIssueStatus = async () => {
      try {
        const response = await fetch(`/api/issues/${issueId}/status`);
        if (response.ok) {
          const data = await response.json();
          setInitialData({ id: issueId, status: data.status || ISSUE_STATUS.BRAINSTORMING });
        } else {
          // Redis에 데이터가 없으면 기본값으로 초기화
          setInitialData({ id: issueId, status: ISSUE_STATUS.BRAINSTORMING });
        }
      } catch (error) {
        console.error('이슈 상태 가져오기 실패:', error);
        setInitialData({ id: issueId, status: ISSUE_STATUS.BRAINSTORMING });
      }
    };

    fetchIssueStatus();
  }, [issueId, setInitialData]);

  const isVoteActive = voteStatus === 'IN_PROGRESS';

  const [activeId, setActiveId] = useState<string | null>(null);
  const [overlayEditValue, setOverlayEditValue] = useState<string | null>(null);

  const categorySizesRef = useRef<Map<string, { width: number; height: number }>>(new Map());

  useEffect(() => {
    const updateCategorySizes = () => {
      const newSizes = new Map<string, { width: number; height: number }>();

      categories.forEach((category) => {
        const element = document.querySelector(`[data-category-id="${category.id}"]`);
        if (element) {
          const rect = element.getBoundingClientRect();
          newSizes.set(category.id, {
            width: rect.width / scale,
            height: rect.height / scale,
          });
        }
      });

      categorySizesRef.current = newSizes;
    };

    updateCategorySizes();
  }, [categories, ideas, scale]);

  const checkCategoryOverlap = useCallback(
    (draggingCategoryId: string, newPosition: Position) => {
      const draggingSize = categorySizesRef.current.get(draggingCategoryId);
      if (!draggingSize) return false;

      const rect1 = {
        left: newPosition.x,
        right: newPosition.x + draggingSize.width,
        top: newPosition.y,
        bottom: newPosition.y + draggingSize.height,
      };

      for (const category of categories) {
        if (category.id === draggingCategoryId) continue;

        const categorySize = categorySizesRef.current.get(category.id);
        if (!categorySize) continue;

        const rect2 = {
          left: category.position.x,
          right: category.position.x + categorySize.width,
          top: category.position.y,
          bottom: category.position.y + categorySize.height,
        };

        const isOverlapping = !(
          rect1.right < rect2.left ||
          rect1.left > rect2.right ||
          rect1.bottom < rect2.top ||
          rect1.top > rect2.bottom
        );

        if (isOverlapping) return true;
      }

      return false;
    },
    [categories],
  );

  //하이라이트된 아이디어
  const { activeFilter, setFilter, highlightedIds } = useIdeaHighlight(issueId, ideas);

  // dnd-kit sensors 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동해야 드래그 시작
      },
    }),
  );

  const handleIdeaPositionChange = (id: string, position: Position) => {
    updateIdeaPosition(id, position);
  };

  const handleCategoryPositionChange = (id: string, position: Position) => {
    const hasOverlap = checkCategoryOverlap(id, position);
    if (hasOverlap) {
      return;
    }

    updateCategoryPosition(id, position);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const categoryIdeas = ideas.filter((idea) => idea.categoryId === categoryId);

    if (categoryIdeas.length > 0) {
      alert(
        `카테고리 내부에 ${categoryIdeas.length}개의 아이디어가 있습니다.\n먼저 아이디어를 이동하거나 삭제해주세요.`,
      );
      return;
    }

    deleteCategory(categoryId);
  };

  const handleCreateIdea = (position: Position) => {
    if (!isCreateIdeaActive) return;

    if (hasEditingIdea) {
      window.alert('입력 중인 아이디어가 있습니다.');
      return;
    }

    const newIdea: IdeaWithPosition = {
      id: `idea-${Date.now()}`,
      content: '',
      author: '나',
      categoryId: null,
      position,
      editable: true,
      isVotePhase: false,
    };

    addIdea(newIdea);
    addCard(newIdea.id);
  };

  const handleSaveIdea = (id: string, content: string) => {
    updateIdeaContent(id, content);
  };

  const handleDeleteIdea = (id: string) => {
    if (hasEditingIdea) {
      resetEditingIdea();
    }
    deleteIdea(id);
    removeCard(id);
  };

  const handleSelectIdea = (id: string) => {
    selectIdea(id);
  };
  
  const handleVoteChange = (id: string, agreeCount: number, disagreeCount: number) => {
    const current = ideas.find((idea) => idea.id === id);
    if (!current) return;
    if (
      (current.agreeCount ?? 0) === agreeCount &&
      (current.disagreeCount ?? 0) === disagreeCount
    ) {
      return;
    }
    setIdeas(ideas.map((idea) => (idea.id === id ? { ...idea, agreeCount, disagreeCount } : idea)));
  };

  const handleMoveIdeaToCategory = (ideaId: string, targetCategoryId: string | null) => {
    setIdeas(
      ideas.map((idea) =>
        idea.id === ideaId
          ? {
              ...idea,
              categoryId: targetCategoryId,
              position: targetCategoryId === null ? idea.position || { x: 100, y: 100 } : null,
            }
          : idea,
      ),
    );
  };

  // dnd-kit 드래그 시작
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);

    const editValue = event.active.data?.current?.editValue;
    if (editValue) {
      setOverlayEditValue(editValue);
    }
  };

  // dnd-kit 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);
    setOverlayEditValue(null);

    const ideaId = active.id as string;
    const idea = ideas.find((i) => i.id === ideaId);

    if (!idea) return;

    // 카테고리로 드롭한 경우
    if (over && over.id.toString().startsWith('category-')) {
      handleMoveIdeaToCategory(ideaId, over.id as string);
    }
    // 자유 배치 영역 (over가 없거나 카테고리가 아닌 경우)
    else if (idea.position) {
      // delta는 화면 픽셀 단위이므로 Canvas scale로 나눠서 보정
      updateIdeaPosition(ideaId, {
        x: idea.position.x + delta.x / scale,
        y: idea.position.y + delta.y / scale,
      });
    }
  };

  const handleAIStructure = useCallback(async () => {
    const validIdeas = ideas
      .filter((idea) => idea.content.trim().length > 0)
      .map((idea) => ({
        id: idea.id,
        content: idea.content,
      }));

    if (validIdeas.length === 0) {
      alert('분류할 아이디어가 없습니다.');
      finishAIStructure();
      return;
    }

    const payload = {
      issueId,
      ideas: validIdeas,
    };

    try {
      const res = await fetch(`/api/issues/${issueId}/categorize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error('AI 분류 실패');
      }

      const data = await res.json();

      const content = data.result?.message?.content;
      if (!content) {
        throw new Error('AI 응답 형식이 올바르지 않습니다.');
      }

      const aiResponse = JSON.parse(content);

      // AI 응답 처리
      if (aiResponse.categories && Array.isArray(aiResponse.categories)) {
        // 1. 카테고리 생성
        const newCategories: Category[] = aiResponse.categories.map(
          (cat: { title: string; ideaIds: string[] }, index: number) => ({
            id: `category-${Date.now()}-${index}`,
            title: cat.title,
            position: {
              x: 100 + index * 600,
              y: 100,
            },
            isMuted: false,
          }),
        );

        setCategories(newCategories);

        // 2. 각 아이디어의 categoryId 업데이트
        const updatedIdeas = ideas.map((idea) => {
          const categoryIndex = aiResponse.categories.findIndex((cat: any) =>
            cat.ideaIds.includes(idea.id),
          );

          if (categoryIndex !== -1) {
            return {
              ...idea,
              categoryId: newCategories[categoryIndex].id,
              position: null, // 카테고리 내부는 position 불필요
            };
          }

          return idea;
        });

        setIdeas(updatedIdeas);
      }
    } catch (error) {
      console.error('AI 구조화 오류:', error);
      alert('AI 구조화 중 오류가 발생했습니다.');
    } finally {
      finishAIStructure();
    }
  }, [ideas, issueId, setIdeas, finishAIStructure]);

  useEffect(() => {
    if (isAIStructuring) {
      handleAIStructure();
    }
  }, [isAIStructuring, handleAIStructure]);

  useEffect(() => {
    const ideaIds = ideas.map((idea) => idea.id);
    setInitialCardData(ideaIds);
  }, [ideas, setInitialCardData]);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* 투표 시작 시 필터 UI 적용 */}
        {voteStatus === 'IN_PROGRESS' && (
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
                id={category.id}
                issueId={issueId}
                title={category.title}
                position={category.position}
                isMuted={category.isMuted}
                onPositionChange={handleCategoryPositionChange}
                checkCollision={checkCategoryOverlap}
                onRemove={() => handleDeleteCategory(category.id)}
                onDropIdea={(ideaId) => handleMoveIdeaToCategory(ideaId, category.id)}
              >
                {categoryIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    id={idea.id}
                    issueId={issueId}
                    content={idea.content}
                    author={idea.author}
                    categoryId={idea.categoryId}
                    position={null}
                    isSelected={idea.isSelected}
                    isHighlighted={highlightedIds.has(idea.id)}
                    isVotePhase={isVoteActive}
                    agreeCount={idea.agreeCount}
                    disagreeCount={idea.disagreeCount}
                    needDiscussion={idea.needDiscussion}
                    editable={idea.editable}
                    onVoteChange={(agreeCount, disagreeCount) =>
                      handleVoteChange(idea.id, agreeCount, disagreeCount)
                    }
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
                id={idea.id}
                issueId={issueId}
                content={idea.content}
                author={idea.author}
                categoryId={idea.categoryId}
                position={idea.position}
                isSelected={idea.isSelected}
                isHighlighted={highlightedIds.has(idea.id)}
                isVotePhase={isVoteActive}
                agreeCount={idea.agreeCount}
                disagreeCount={idea.disagreeCount}
                needDiscussion={idea.needDiscussion}
                editable={idea.editable}
                onPositionChange={handleIdeaPositionChange}
                onVoteChange={(agreeCount, disagreeCount) =>
                  handleVoteChange(idea.id, agreeCount, disagreeCount)
                }
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
                      id={activeIdea.id}
                      issueId={issueId}
                      content={overlayEditValue ?? activeIdea.content}
                      author={activeIdea.author}
                      categoryId={activeIdea.categoryId}
                      position={null}
                      isSelected={activeIdea.isSelected}
                      isHighlighted={highlightedIds.has(activeIdea.id)}
                      isVotePhase={isVoteActive}
                      agreeCount={activeIdea.agreeCount}
                      disagreeCount={activeIdea.disagreeCount}
                      needDiscussion={activeIdea.needDiscussion}
                      editable={activeIdea.editable}
                    />
                  </div>
                );
              })()
            : null}
        </DragOverlay>
      </DndContext>

      {/* AI 구조화 로딩 오버레이 */}
      {isAIStructuring && <LoadingOverlay message="AI가 아이디어를 분류하고 있습니다..." />}
    </>
  );
};

export default IssuePage;
