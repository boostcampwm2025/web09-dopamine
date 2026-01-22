import { LeaveRepository } from '@/lib/repositories/leave.repository';
import { LeaveService } from '@/lib/services/leave.service';

jest.mock('@/lib/repositories/leave.repository');

const mockedLeaveRepository = LeaveRepository as jest.Mocked<typeof LeaveRepository>;

describe('LeaveService.leaveProject (프로젝트 탈퇴)', () => {
  const projectId = 'project-1';
  const ownerId = 'owner-1';
  const memberId = 'member-1';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('프로젝트가 존재하지 않으면 에러를 던진다', async () => {
    mockedLeaveRepository.getProjectOwnerId.mockResolvedValue(null);

    await expect(LeaveService.leaveProject(projectId, memberId)).rejects.toThrow(
      'PROJECT_NOT_FOUND',
    );
    expect(mockedLeaveRepository.leaveProject).not.toHaveBeenCalled();
  });

  it('프로젝트 소유자(Owner)는 탈퇴할 수 없다', async () => {
    mockedLeaveRepository.getProjectOwnerId.mockResolvedValue({ ownerId });

    await expect(LeaveService.leaveProject(projectId, ownerId)).rejects.toThrow(
      'PROJECT_OWNER_CANNOT_LEAVE',
    );
    expect(mockedLeaveRepository.leaveProject).not.toHaveBeenCalled();
  });

  it('해당 프로젝트에 참여 중인 멤버가 아니면 에러를 던진다', async () => {
    mockedLeaveRepository.getProjectOwnerId.mockResolvedValue({ ownerId });
    mockedLeaveRepository.leaveProject.mockResolvedValue(0); // 삭제된 행이 0개일 때

    await expect(LeaveService.leaveProject(projectId, memberId)).rejects.toThrow(
      'PROJECT_MEMBER_NOT_FOUND',
    );
    expect(mockedLeaveRepository.leaveProject).toHaveBeenCalledWith(projectId, memberId);
  });

  it('성공적으로 탈퇴하면 projectId를 반환한다', async () => {
    mockedLeaveRepository.getProjectOwnerId.mockResolvedValue({ ownerId });
    mockedLeaveRepository.leaveProject.mockResolvedValue(1); // 삭제 성공

    await expect(LeaveService.leaveProject(projectId, memberId)).resolves.toEqual({ projectId });
    expect(mockedLeaveRepository.leaveProject).toHaveBeenCalledWith(projectId, memberId);
  });
});
