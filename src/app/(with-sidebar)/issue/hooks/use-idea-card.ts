import { useCallback, useEffect, useState } from 'react';

interface UseIdeaCardProps {
  content?: string;
  agreeCount?: number;
  disagreeCount?: number;
  isSelected?: boolean;
  needDiscussion?: boolean;
  editable?: boolean;
  onSave?: (content: string) => void;
  onClick?: () => void;
}

export default function useIdeaCard(props: UseIdeaCardProps) {
  const {
    content = '',
    agreeCount = 0,
    disagreeCount = 0,
    isSelected = false,
    needDiscussion = false,
    editable = false,
    onSave,
  } = props;

  const [status, setStatus] = useState<'needDiscussion' | 'selected' | 'default'>('default');

  // 투표 관련 로컬 상태
  // `userVote`: 사용자가 현재 어떤 투표를 선택했는지('agree' | 'disagree' | null)
  // agreeCountState / disagreeCountState: 로컬에서 보여줄 카운트 (낙관적 업데이트)
  const [userVote, setUserVote] = useState<'agree' | 'disagree' | null>(null);
  const [agreeCountState, setAgreeCountState] = useState<number>(agreeCount);
  const [disagreeCountState, setDisagreeCountState] = useState<number>(disagreeCount);

  // 편집 관련 로컬 상태
  // isEditing: 현재 편집 모드인지
  // editValue: 편집 중인 텍스트
  // displayContent: 화면에 보여줄 최종 내용
  const [isEditing, setIsEditing] = useState<boolean>(!!editable);
  const [editValue, setEditValue] = useState<string>(content);
  const [displayContent, setDisplayContent] = useState<string>(content);

  // 부모로부터 content가 바뀌면 로컬 editValue와 displayContent를 동기화합니다.
  useEffect(() => {
    setEditValue(content);
    setDisplayContent(content);
  }, [content]);

  // isSelected / needDiscussion 플래그에 따라 status를 설정합니다.
  useEffect(() => {
    if (isSelected) {
      setStatus('selected');
      return;
    }
    if (needDiscussion) {
      setStatus('needDiscussion');
      return;
    }
    setStatus('default');
  }, [isSelected, needDiscussion]);

  // 찬성 버튼 처리
  // - 이미 찬성 상태면 취소(카운트 감소)
  // - 반대에서 찬성으로 바뀌면 반대 카운트는 감소
  // 낙관적 업데이트로 UI에 즉시 반영합니다.
  const handleAgree = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지

      if (userVote === 'agree') {
        // 찬성 취소
        setAgreeCountState((c) => Math.max(0, c - 1));
        setUserVote(null);
      } else if (userVote === 'disagree') {
        // 반대 -> 찬성
        setAgreeCountState((c) => c + 1);
        setDisagreeCountState((c) => Math.max(0, c - 1));
        setUserVote('agree');
      } else {
        // 미투표 -> 찬성
        setAgreeCountState((c) => c + 1);
        setUserVote('agree');
      }
    },
    [userVote],
  );

  // 반대 버튼 처리 (찬성 처리와 대칭)
  const handleDisagree = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지

      if (userVote === 'disagree') {
        // 반대 취소
        setDisagreeCountState((c) => Math.max(0, c - 1));
        setUserVote(null);
      } else if (userVote === 'agree') {
        // 찬성 -> 반대
        setDisagreeCountState((c) => c + 1);
        setAgreeCountState((c) => Math.max(0, c - 1));
        setUserVote('disagree');
      } else {
        // 미투표 -> 반대
        setDisagreeCountState((c) => c + 1);
        setUserVote('disagree');
      }
    },
    [userVote],
  );

  // 편집 내용을 제출합니다. 비어있으면 무시.
  // onSave 콜백이 제공되면 변경된 값을 전달해 외부 동기화를 할 수 있습니다.
  const submitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed) return;
    setDisplayContent(trimmed);
    setIsEditing(false);
    if (onSave) onSave(trimmed);
  }, [editValue, onSave]);

  // 편집 textarea에서 Enter(Shift 미누름) 시 제출
  const handleKeyDownEdit = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        submitEdit();
      }
    },
    [submitEdit],
  );

  return {
    status,
    userVote,
    agreeCountState,
    disagreeCountState,
    isEditing,
    editValue,
    displayContent,
    setEditValue,
    handleAgree,
    handleDisagree,
    submitEdit,
    handleKeyDownEdit,
  };
}
