import { useModalStore } from '../use-modal-store';
import InviteProjectModal from './invite-project-modal';

export const useInviteProjectModal = () => {
  const { openModal } = useModalStore();

  const openInviteProjectModal = (
    projectId: string,
    projectTitle: string,
    e?: React.MouseEvent,
  ) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    openModal({
      title: '멤버 초대하기',
      content: (
        <InviteProjectModal
          id={projectId}
          title={projectTitle}
        />
      ),
      hasCloseButton: true,
    });
  };

  return { openInviteProjectModal };
};
