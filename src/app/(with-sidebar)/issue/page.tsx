'use client';

import { useEffect, useState } from 'react';
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
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import LoadingOverlay from '@/components/loading-overlay/loading-overlay';
import CategoryCard from './_components/category/category-card';

type Phase = 'ideation' | 'voting' | 'discussion';

const IssuePage = () => {
  // TODO: URL 파라미터나 props에서 실제 issueId 가져오기
  // 예: const { issueId } = useParams() 또는 props.issueId
  const issueId = 'default'; // 임시 기본값

  const { ideas, addIdea, updateIdeaContent, updateIdeaPosition, deleteIdea, setIdeas } =
    useIdeaStore(issueId);
  const { addCard, removeCard } = useIdeaCardStackStore(issueId);

  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPhase, setCurrentPhase] = useState<Phase>('ideation');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isAILoading, setIsAILoading] = useState(false);

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
    setCategories((prevCategories) =>
      prevCategories.map((cat) => (cat.id === id ? { ...cat, position } : cat)),
    );
  };

  const handleCreateIdea = (position: Position) => {
    const newIdea: IdeaWithPosition = {
      id: `idea-${Date.now()}`,
      content: '',
      author: '나',
      categoryId: null,
      position,
      editable: true,
      isVotePhrase: false,
    };

    addIdea(newIdea);
    addCard(newIdea.id);
  };

  const handleSaveIdea = (id: string, content: string) => {
    updateIdeaContent(id, content);
  };

  const handleDeleteIdea = (id: string) => {
    deleteIdea(id);
    removeCard(id);
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
  };

  // dnd-kit 드래그 종료
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    setActiveId(null);

    const ideaId = active.id as string;
    const idea = ideas.find((i) => i.id === ideaId);

    if (!idea) return;

    // 카테고리로 드롭한 경우
    if (over && over.id.toString().startsWith('category-')) {
      handleMoveIdeaToCategory(ideaId, over.id as string);
    }
    // 자유 배치 영역 (over가 없거나 카테고리가 아닌 경우)
    else if (idea.position) {
      const CANVAS_SCALE = 0.7;

      // delta는 화면 픽셀 단위이므로 Canvas scale로 나눠서 보정
      updateIdeaPosition(ideaId, {
        x: idea.position.x + delta.x / CANVAS_SCALE,
        y: idea.position.y + delta.y / CANVAS_SCALE,
      });
    }
  };

  const handleAIStructure = async () => {
    // 빈 content를 가진 아이디어는 제외
    const validIdeas = ideas
      .filter((idea) => idea.content.trim().length > 0)
      .map((idea) => ({
        id: idea.id,
        content: idea.content,
      }));

    // 유효한 아이디어가 없으면 조기 리턴
    if (validIdeas.length === 0) {
      alert('분류할 아이디어가 없습니다.');
      return;
    }

    const payload = {
      issueId,
      ideas: validIdeas,
    };

    setIsAILoading(true);
    try {
      const res = await fetch('/api/categorize', {
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
      setIsAILoading(false);
    }
  };

  useEffect(() => {
    ideas.forEach((idea) => {
      addCard(idea.id);
    });
  }, []);

  // AI 구조화 이벤트 리스너
  useEffect(() => {
    const handleAIStructureEvent = () => {
      handleAIStructure();
    };

    window.addEventListener('aiStructure', handleAIStructureEvent);
    return () => window.removeEventListener('aiStructure', handleAIStructureEvent);
  }, [ideas]); // ideas가 변경될 때마다 리스너 재등록

  // Phase 변경 이벤트 리스너
  useEffect(() => {
    const handlePhaseChangeEvent = (e: CustomEvent<Phase>) => {
      setCurrentPhase(e.detail);
    };

    window.addEventListener('phaseChange', handlePhaseChangeEvent as EventListener);
    return () => window.removeEventListener('phaseChange', handlePhaseChangeEvent as EventListener);
  }, []);

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Canvas onDoubleClick={handleCreateIdea}>
          {/* 카테고리들 - 내부에 아이디어 카드들을 children으로 전달 */}
          {categories.map((category) => {
            const categoryIdeas = ideas.filter((idea) => idea.categoryId === category.id);

            return (
              <CategoryCard
                key={category.id}
                id={category.id}
                title={category.title}
                position={category.position}
                isMuted={category.isMuted}
                onPositionChange={handleCategoryPositionChange}
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
                    position={null} // 카테고리 내부는 position 불필요
                    isSelected={idea.isSelected}
                    isVotePhrase={currentPhase === 'voting' || currentPhase === 'discussion'}
                    agreeCount={idea.agreeCount}
                    disagreeCount={idea.disagreeCount}
                    needDiscussion={idea.needDiscussion}
                    editable={idea.editable}
                    onSave={(content) => handleSaveIdea(idea.id, content)}
                    onDelete={() => handleDeleteIdea(idea.id)}
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
                isVotePhrase={currentPhase === 'voting' || currentPhase === 'discussion'}
                agreeCount={idea.agreeCount}
                disagreeCount={idea.disagreeCount}
                needDiscussion={idea.needDiscussion}
                editable={idea.editable}
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
                      transform: 'scale(0.7)',
                      transformOrigin: '0 0', // 왼쪽 위 기준으로 scale
                    }}
                  >
                    <IdeaCard
                      id={activeIdea.id}
                      content={activeIdea.content}
                      author={activeIdea.author}
                      categoryId={activeIdea.categoryId}
                      position={null}
                      isSelected={activeIdea.isSelected}
                      agreeCount={activeIdea.agreeCount}
                      disagreeCount={activeIdea.disagreeCount}
                      needDiscussion={activeIdea.needDiscussion}
                    />
                  </div>
                );
              })()
            : null}
        </DragOverlay>
      </DndContext>

      {/* AI 구조화 로딩 오버레이 */}
      {isAILoading && <LoadingOverlay message="AI가 아이디어를 분류하고 있습니다..." />}
    </>
  );
};

export default IssuePage;
