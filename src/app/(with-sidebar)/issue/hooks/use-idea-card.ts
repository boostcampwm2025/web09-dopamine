import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTooltipStore } from '@/components/tooltip/use-tooltip-store';
import { VOTE_TYPE } from '@/constants/issue';
import { updateIdeaVote } from '@/lib/api/vote';
import { getUserIdForIssue } from '@/lib/storage/issue-user-storage';
import { CardStatus } from '../types/idea';
import type { FilterType } from './use-filter-idea';

interface UseIdeaCardProps {
  issueId?: string;
  ideaId?: string;
  userId?: string | null;
  content?: string;
  agreeCount?: number;
  disagreeCount?: number;
  isSelected?: boolean;
  status?: CardStatus;
  editable?: boolean;
  onSave?: (content: string) => void;
  onClick?: () => void;
}

export default function useIdeaCard(props: UseIdeaCardProps) {
  const {
    issueId,
    ideaId,
    userId: userIdOverride = null,
    content = '',
    agreeCount = 0,
    disagreeCount = 0,
    isSelected = false,
    status: statusOverride = 'default',
    editable = false,
    onSave,
  } = props;

  const openTooltip = useTooltipStore((state) => state.openTooltip);
  const closeTooltip = useTooltipStore((state) => state.closeTooltip);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const voteRequestId = useRef(0);

  const [status, setStatus] = useState<CardStatus>('default');

  // 투표 관련 로컬 상태
  // `userVote`: 사용자가 현재 어떤 투표를 선택했는지(VOTE_TYPE.AGREE | VOTE_TYPE.DISAGREE | null)
  // agreeCountState / disagreeCountState: 로컬에서 보여줄 카운트 (낙관적 업데이트)
  const [userVote, setUserVote] = useState<
    typeof VOTE_TYPE.AGREE | typeof VOTE_TYPE.DISAGREE | null
  >(null);
  const [agreeCountState, setAgreeCountState] = useState<number>(agreeCount);
  const [disagreeCountState, setDisagreeCountState] = useState<number>(disagreeCount);

  useEffect(() => {
    setAgreeCountState(agreeCount);
  }, [agreeCount]);

  useEffect(() => {
    setDisagreeCountState(disagreeCount);
  }, [disagreeCount]);

  /**
   * 사용자의 투표 변경에 따른 예상 투표 수(agree, disagree)를 미리 계산하는 함수
   * @param nextVote 사용자가 새로 선택한 투표 타입 (찬성/반대/취소)
   */
  const computeNextCounts = useCallback(
    (nextVote: typeof VOTE_TYPE.AGREE | typeof VOTE_TYPE.DISAGREE | null) => {
      let nextAgree = agreeCountState;
      let nextDisagree = disagreeCountState;

      // 1. 기존에 했던 투표가 있다면, 먼저 그 수치를 차감
      if (userVote === VOTE_TYPE.AGREE) nextAgree -= 1;
      if (userVote === VOTE_TYPE.DISAGREE) nextDisagree -= 1;

      // 2. 새로 선택한 투표가 있다면, 해당 수치를 증가
      if (nextVote === VOTE_TYPE.AGREE) nextAgree += 1;
      if (nextVote === VOTE_TYPE.DISAGREE) nextDisagree += 1;

      return {
        // 음수가 되지 않도록 방어 로직 포함
        agree: Math.max(0, nextAgree),
        disagree: Math.max(0, nextDisagree),
      };
    },
    [agreeCountState, disagreeCountState, userVote],
  );

  /**
   * 투표 데이터를 서버에 저장하고 UI 상태를 동기화하는 함수
   * 낙관적 업데이트 기법을 사용하여 사용자 경험을 개선함
   */
  const persistVote = useCallback(
    async (nextVote: typeof VOTE_TYPE.AGREE | typeof VOTE_TYPE.DISAGREE | null) => {
      // 필수 데이터가 없거나 임시 아이디어인 경우 요청 중단
      if (!issueId || !ideaId) return;
      if (ideaId.startsWith('temp-')) return;

      const userId = userIdOverride ?? getUserIdForIssue(issueId);
      if (!userId) return;

      // [경쟁 상태 방지] 요청마다 고유 ID를 부여하여 가장 최신 요청만 반영되도록 함
      const requestId = (voteRequestId.current += 1);
      
      // [에러 복구용] API 실패 시 이전 상태로 되돌리기 위해 현재 상태 저장
      const prevState = {
        agree: agreeCountState,
        disagree: disagreeCountState,
        vote: userVote,
      };

      // 1. 낙관적 업데이트: 서버 응답을 기다리지 않고 UI를 먼저 변경
      const nextCounts = computeNextCounts(nextVote);
      setAgreeCountState(nextCounts.agree);
      setDisagreeCountState(nextCounts.disagree);
      setUserVote(nextVote);

      try {
        // 2. 서버에 투표 데이터 업데이트 요청
        const result = await updateIdeaVote(issueId, ideaId, {
          userId,
          type: nextVote,
        });

        // [검증] 만약 API 응답이 오기 전에 다른 투표 요청이 발생했다면, 이 응답은 무시
        if (voteRequestId.current !== requestId) return;

        // 3. 서버에서 확정된 최신 데이터로 상태 재동기화 (서버 데이터가 최종 권위)
        setAgreeCountState(result.agreeCount);
        setDisagreeCountState(result.disagreeCount);
        setUserVote(
          result.userVote === 'agree'
            ? VOTE_TYPE.AGREE
            : result.userVote === 'disagree'
              ? VOTE_TYPE.DISAGREE
              : null,
        );
      } catch (error) {
        // [예외 처리] 요청이 실패하고 최신 요청일 경우, UI를 이전 상태로 롤백(Rollback)
        if (voteRequestId.current !== requestId) return;
        console.error('Vote update failed:', error);
        setAgreeCountState(prevState.agree);
        setDisagreeCountState(prevState.disagree);
        setUserVote(prevState.vote);
      }
    },
    [
      agreeCountState,
      computeNextCounts,
      disagreeCountState,
      ideaId,
      issueId,
      userIdOverride,
      userVote,
    ],
  );

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

  // 상태 우선순위: isSelected(선택된 카드) 가 최우선으로 'selected'를 적용합니다.
  // 그 외에는 부모에서 전달된 `status`(예: 'highlighted')를 그대로 사용합니다.
  useEffect(() => {
    if (isSelected) {
      setStatus('selected');
      return;
    }
    setStatus(statusOverride);
  }, [isSelected, statusOverride]);

  // 찬성 버튼 처리
  // - 이미 찬성 상태면 취소(카운트 감소)
  // - 반대에서 찬성으로 바뀌면 반대 카운트는 감소
  // 낙관적 업데이트로 UI에 즉시 반영합니다.
  const handleAgree = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지

      if (userVote === VOTE_TYPE.AGREE) {
        // 찬성 취소
        void persistVote(null);
      } else if (userVote === VOTE_TYPE.DISAGREE) {
        // 반대 -> 찬성
        void persistVote(VOTE_TYPE.AGREE);
      } else {
        // 미투표 -> 찬성
        void persistVote(VOTE_TYPE.AGREE);
      }
    },
    [persistVote, userVote],
  );

  // 반대 버튼 처리 (찬성 처리와 대칭)
  const handleDisagree = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // 카드 클릭 이벤트 버블링 방지

      if (userVote === VOTE_TYPE.DISAGREE) {
        // 반대 취소
        void persistVote(null);
      } else if (userVote === VOTE_TYPE.AGREE) {
        // 찬성 -> 반대
        void persistVote(VOTE_TYPE.DISAGREE);
      } else {
        // 미투표 -> 반대
        void persistVote(VOTE_TYPE.DISAGREE);
      }
    },
    [persistVote, userVote],
  );

  // 편집 내용을 제출합니다. 비어있으면 무시.
  // onSave 콜백이 제공되면 변경된 값을 전달해 외부 동기화를 할 수 있습니다.
  const submitEdit = useCallback(() => {
    const trimmed = editValue.trim();
    if (!trimmed) {
      textareaRef.current?.focus();
      openTooltip(textareaRef.current!, '내용을 입력해주세요');
      const timer = setTimeout(() => {
        closeTooltip();
      }, 1000);

      return () => clearTimeout(timer);
    }
    setDisplayContent(trimmed);
    setIsEditing(false);
    if (onSave) onSave(trimmed);
  }, [editValue, onSave]);

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
    textareaRef,
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

export const useIdeaStatus = (filteredIds: Set<string>, activeFilter: FilterType) => {
  return useCallback(
    (ideaId: string): CardStatus => {
      if (!filteredIds.has(ideaId)) return 'default';
      if (activeFilter === 'most-liked') return 'mostLiked';
      if (activeFilter === 'need-discussion') return 'needDiscussion';
      return 'default';
    },
    [filteredIds, activeFilter],
  );
};
