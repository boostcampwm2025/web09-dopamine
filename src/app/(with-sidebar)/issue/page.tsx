'use client';

import { useEffect, useState } from 'react';
import Canvas from '@/app/(with-sidebar)/issue/_components/canvas/canvas';
import IdeaCard from '@/app/(with-sidebar)/issue/_components/idea-card/idea-card';
import { useIdeaCardStackStore } from '@/app/(with-sidebar)/issue/store/use-idea-card-stack-store';
import { useIdeaStore } from '@/app/(with-sidebar)/issue/store/use-idea-store';
import { useIssueStore } from '@/app/(with-sidebar)/issue/store/use-issue-store';
import type { Category } from '@/app/(with-sidebar)/issue/types/category';
import type { IdeaWithPosition, Position } from '@/app/(with-sidebar)/issue/types/idea';
import CategoryCard from './_components/category/category-card';

const IssuePage = () => {
  // TODO: URL 파라미터나 props에서 실제 issueId 가져오기
  // 예: const { issueId } = useParams() 또는 props.issueId
  const issueId = 'default'; // 임시 기본값

  const { ideas, addIdea, updateIdeaContent, updateIdeaPosition, deleteIdea, setIdeas } =
    useIdeaStore(issueId);
  const { addCard, removeCard } = useIdeaCardStackStore(issueId);

  const voteStatus = useIssueStore((state) => state.voteStatus);
  //TODO: 추후 투표 종료 시 투표 기능이 활성화되지 않도록 기능 추가 필요
  const isVoteActive = voteStatus !== 'READY';

  const [categories, setCategories] = useState<Category[]>([]);

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
      isVotephase: false,
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

  const handleAIStructure = () => {
    // 1. 새 카테고리 생성 (임시로 3개)
    const newCategories: Category[] = [
      {
        id: 'cat-1',
        title: 'SNS 마케팅',
        position: { x: 100, y: 100 },
        isMuted: false,
      },
      {
        id: 'cat-2',
        title: '콘텐츠 제작',
        position: { x: 700, y: 100 },
        isMuted: false,
      },
      {
        id: 'cat-3',
        title: '커뮤니티 활동',
        position: { x: 500, y: 1000 },
        isMuted: false,
      },
    ];

    // 2. 아이디어 분류 로직 (임시로 단순 분배)
    const categorizedIdeas = ideas.map((idea, index) => {
      // 3개 카테고리에 순서대로 분배
      const categoryIndex = index % 3;
      const categoryId = newCategories[categoryIndex].id;

      return {
        ...idea,
        categoryId,
        position: null, // 카테고리 내부는 position 불필요 (CSS Grid가 처리)
      };
    });

    // 3. State 업데이트 (transition 트리거)
    setCategories(newCategories);
    setIdeas(categorizedIdeas);
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

  return (
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
                isVotephase={isVoteActive}
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
            isVotephase={isVoteActive}
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
  );
};

export default IssuePage;
