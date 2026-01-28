import { InvitationRepository } from '@/lib/repositories/invitation.repository';
import { InvitationService } from '@/lib/services/invitation.service';

jest.mock('@/lib/repositories/invitation.repository');

const mockedRepository = InvitationRepository as jest.Mocked<typeof InvitationRepository>;

describe('InvitationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getInvitationInfo', () => {
    it('초대장이 없으면 에러를 던진다', async () => {
      mockedRepository.findInvitationByToken.mockResolvedValue(null);

      await expect(InvitationService.getInvitationInfo('token-1')).rejects.toThrow(
        'INVITATION_NOT_FOUND',
      );
    });

    it('초대장이 만료되면 에러를 던진다', async () => {
      mockedRepository.findInvitationByToken.mockResolvedValue({
        token: 'token-1',
        expiresAt: new Date('2000-01-01T00:00:00Z'),
        projectId: 'project-1',
        project: {
          id: 'project-1',
          title: 'Project',
          owner: { name: 'Owner' },
          _count: { projectMembers: 2 },
        },
        invitees: [{ email: 'test@example.com' }],
      } as any);

      await expect(InvitationService.getInvitationInfo('token-1')).rejects.toThrow(
        'INVITATION_EXPIRED',
      );
    });

    it('유효한 토큰이면 초대 정보가 매핑되어 반환된다', async () => {
      mockedRepository.findInvitationByToken.mockResolvedValue({
        token: 'token-1',
        expiresAt: new Date('2999-01-01T00:00:00Z'),
        projectId: 'project-1',
        project: {
          id: 'project-1',
          title: 'Project Title',
          owner: null,
          _count: { projectMembers: 3 },
        },
        invitees: [{ email: 'invitee@example.com' }],
      } as any);

      const result = await InvitationService.getInvitationInfo('token-1');

      expect(result).toEqual({
        isValid: true,
        token: 'token-1',
        projectId: 'project-1',
        projectTitle: 'Project Title',
        ownerName: '알 수 없는 사용자',
        memberCount: 3,
        myEmail: 'invitee@example.com',
      });
    });
  });

  describe('acceptInvitation', () => {
    it('초대장이 없으면 에러를 던진다', async () => {
      mockedRepository.findInvitationByEmail.mockResolvedValue(null);

      await expect(
        InvitationService.acceptInvitation('token-1', 'user@example.com', 'user-1'),
      ).rejects.toThrow('INVITATION_NOT_FOUND');
      expect(mockedRepository.checkProjectMemberDuplicate).not.toHaveBeenCalled();
    });

    it('이미 멤버이면 에러를 던진다', async () => {
      mockedRepository.findInvitationByEmail.mockResolvedValue({
        projectId: 'project-1',
        expiresAt: new Date('2999-01-01T00:00:00Z'),
        invitees: [{ id: 'invitee-1' }],
      } as any);
      mockedRepository.checkProjectMemberDuplicate.mockResolvedValue({ id: 'pm-1' } as any);

      await expect(
        InvitationService.acceptInvitation('token-1', 'user@example.com', 'user-1'),
      ).rejects.toThrow('ALREADY_EXISTED');
      expect(mockedRepository.createProjectMember).not.toHaveBeenCalled();
    });

    it('초대장이 만료되면 에러를 던진다', async () => {
      mockedRepository.findInvitationByEmail.mockResolvedValue({
        projectId: 'project-1',
        expiresAt: new Date('2000-01-01T00:00:00Z'),
        invitees: [{ id: 'invitee-1' }],
      } as any);
      mockedRepository.checkProjectMemberDuplicate.mockResolvedValue(null);

      await expect(
        InvitationService.acceptInvitation('token-1', 'user@example.com', 'user-1'),
      ).rejects.toThrow('INVITATION_EXPIRED');
      expect(mockedRepository.createProjectMember).not.toHaveBeenCalled();
    });

    it('이메일이 초대 명단에 없으면 에러를 던진다', async () => {
      mockedRepository.findInvitationByEmail.mockResolvedValue({
        projectId: 'project-1',
        expiresAt: new Date('2999-01-01T00:00:00Z'),
        invitees: [],
      } as any);
      mockedRepository.checkProjectMemberDuplicate.mockResolvedValue(null);

      await expect(
        InvitationService.acceptInvitation('token-1', 'user@example.com', 'user-1'),
      ).rejects.toThrow('EMAIL_NOT_AUTHORIZED');
      expect(mockedRepository.createProjectMember).not.toHaveBeenCalled();
    });

    it('성공 시 멤버를 생성하고 projectId를 반환한다', async () => {
      mockedRepository.findInvitationByEmail.mockResolvedValue({
        projectId: 'project-1',
        expiresAt: new Date('2999-01-01T00:00:00Z'),
        invitees: [{ id: 'invitee-1' }],
      } as any);
      mockedRepository.checkProjectMemberDuplicate.mockResolvedValue(null);
      mockedRepository.createProjectMember.mockResolvedValue(undefined);

      const result = await InvitationService.acceptInvitation(
        'token-1',
        'user@example.com',
        'user-1',
      );

      expect(mockedRepository.createProjectMember).toHaveBeenCalledWith(
        'invitee-1',
        'user-1',
        'project-1',
      );
      expect(result).toEqual({ projectId: 'project-1' });
    });
  });
});
