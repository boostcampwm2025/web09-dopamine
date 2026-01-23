import { InvitationRepository } from '../repositories/invitation.repository';

export const InvitationService = {
  async getInvitationInfo(token: string) {
    const invitation = await InvitationRepository.findInvitationByToken(token);

    if (!invitation) {
      throw new Error('INVITATION_NOT_FOUND');
    }
    if (new Date() > invitation.expiresAt) {
      throw new Error('INVITATION_EXPIRED');
    }

    return {
      isValid: true,
      token: invitation.token,
      projectId: invitation.projectId,
      projectTitle: invitation.project.title,
      ownerName: invitation.project.owner?.name ?? '알 수 없는 사용자',
      memberCount: invitation.project._count.projectMembers,
      myEmail: invitation.invitees[0]?.email,
    };
  },

  async acceptInvitation(token: string, userEmail: string, userId: string) {
    // 초대장 조회 (해당 이메일이 명단에 있는지 필터링해서 가져옴)
    const invitation = await InvitationRepository.findInvitationByEmail(token, userEmail);

    // 유효성 검증
    if (!invitation) {
      throw new Error('INVITATION_NOT_FOUND'); // 존재하지 않는 토큰
    }

    // 이미 멤버인지 확인 (중복 가입 방지)
    const existingMember = await InvitationRepository.checkProjectMemberDuplicate(
      userId,
      invitation.projectId,
    );

    // 이미 멤버인 경우
    if (existingMember) {
      throw new Error('ALREADY_EXISTED');
    }

    if (new Date() > invitation.expiresAt) {
      throw new Error('INVITATION_EXPIRED'); // 만료됨
    }

    const validInvitee = invitation.invitees[0]; // 빈 배열이면 반환 값에 내 이메일이 없음

    if (!validInvitee) {
      throw new Error('EMAIL_NOT_AUTHORIZED');
    }

    // 초대장 정보 업데이트 & 프로젝트 멤버에 유저 추가
    await InvitationRepository.createProjectMember(validInvitee.id, userId, invitation.projectId);

    return { projectId: invitation.projectId };
  },
};
