import { useCallback, useEffect, useReducer, useState } from 'react';

interface UseCategoryProps {
  title: string;
}

export default function useCategory(props: UseCategoryProps) {
  const { title } = props;
  const [curTitle, setCurTitle] = useState<string>(title);
  const [draftTitle, setDraftTitle] = useState<string>(title);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const initialState = {
    curTitle: '',
    draftTitle: '',
    isEditing: false,
  };

  type TitleAction =
    | { type: 'SET_CUR_TITLE'; payload: string }
    | { type: 'SET_DRAFT_TITLE'; payload: string }
    | { type: 'SET_IS_EDITING'; payload: boolean };

  const titleReducer = (state: typeof initialState, action: TitleAction) => {
    switch (action.type) {
      case 'SET_CUR_TITLE':
        return {
          ...state,
          curTitle: action.payload,
        };
      case 'SET_DRAFT_TITLE':
        return {
          ...state,
          draftTitle: action.payload,
        };
      case 'SET_IS_EDITING':
        return {
          ...state,
          isEditing: action.payload,
        };
      default:
        return state;
    }
  };

  const [_, dispatch] = useReducer(titleReducer, initialState);

  useEffect(() => {
    dispatch({ type: 'SET_CUR_TITLE', payload: title });
    dispatch({ type: 'SET_DRAFT_TITLE', payload: title });
    dispatch({ type: 'SET_IS_EDITING', payload: false });
  }, [title]);

  const submitEditedTitle = useCallback(
    (nextTitle: string) => {
      const value = nextTitle.trim();
      setCurTitle(value || curTitle);
      setDraftTitle(value || curTitle);
      setIsEditing(false);

      /**
       * To Do
       * 서버에 변경사항 전달
       */
    },
    [curTitle],
  );

  const cancelEditingTitle = () => {
    setDraftTitle(curTitle);
    setIsEditing(false);
  };

  return {
    curTitle,
    isEditing,
    draftTitle,
    setCurTitle,
    setDraftTitle,
    setIsEditing,
    submitEditedTitle,
    cancelEditingTitle,
  };
}
