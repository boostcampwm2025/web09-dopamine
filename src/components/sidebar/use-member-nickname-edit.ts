import { useState } from 'react';
import { useUpdateNicknameMutation } from '@/hooks/issue/use-issue-member-mutation';

interface UseMemberNicknameEditProps {
  issueId: string;
  userId: string;
  initialName: string;
}

export const useMemberNicknameEdit = ({ issueId, userId, initialName }: UseMemberNicknameEditProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialName);
  const { update } = useUpdateNicknameMutation(issueId, userId);

  const startEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(true);
    setEditName(initialName);
  };

  const cancelEditing = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsEditing(false);
    setEditName(initialName);
  };

  const saveEditing = (e?: React.MouseEvent | React.FormEvent) => {
    e?.stopPropagation();
    if (editName.trim() === initialName) {
      setIsEditing(false);
      return;
    }
    update.mutate(editName, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      saveEditing(e as any);
    } else if (e.key === 'Escape') {
      cancelEditing(e as any);
    }
  };

  return {
    isEditing,
    editName,
    setEditName,
    startEditing,
    cancelEditing,
    saveEditing,
    handleKeyDown,
  };
};
