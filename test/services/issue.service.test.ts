import {
  findIssueWithPermissionData,
  softDeleteIssue,
  updateIssueTitle,
} from '@/lib/repositories/issue.repository';
import { issueService } from '@/lib/services/issue.service';

jest.mock('@/lib/repositories/issue.repository');

const mockedFindPermission = findIssueWithPermissionData as jest.Mock;
const mockedUpdateTitle = updateIssueTitle as jest.Mock;
const mockedSoftDelete = softDeleteIssue as jest.Mock;

describe('issueService', () => {
  const mockParams = {
    issueId: 'issue-1',
    title: '새로운 제목',
    userId: 'user-1',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateIssueTitle', () => {
    test('이슈가 존재하지 않으면 ISSUE_NOT_FOUND 에러를 던져야 한다', async () => {
      mockedFindPermission.mockResolvedValue(null);
      await expect(issueService.updateIssueTitle(mockParams)).rejects.toThrow('ISSUE_NOT_FOUND');
    });

    describe('Quick Issue 권한 검증 (topicId 없음)', () => {
      test('소유자(Owner)라면 제목 수정에 성공해야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: null,
          issueMembers: [{ id: 'member-1' }], // 💡 항상 배열로 존재해야 함
          topic: null,
        });
        mockedUpdateTitle.mockResolvedValue({ id: 'issue-1', title: '새로운 제목' });

        const result = await issueService.updateIssueTitle(mockParams);
        expect(result.title).toBe('새로운 제목');
      });

      test('소유자가 아니라면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: null,
          issueMembers: [],
          topic: null,
        });
        await expect(issueService.updateIssueTitle(mockParams)).rejects.toThrow(
          'PERMISSION_DENIED',
        );
      });
    });

    describe('일반 이슈 권한 검증 (topicId 있음)', () => {
      test('프로젝트 멤버라면 제목 수정에 성공해야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [],
          topic: {
            project: {
              projectMembers: [{ id: 'pm-1' }],
            },
          },
        });
        mockedUpdateTitle.mockResolvedValue({ id: 'issue-1', title: '새로운 제목' });

        const result = await issueService.updateIssueTitle(mockParams);
        expect(result.id).toBe('issue-1');
      });

      test('프로젝트 멤버가 아니라면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [],
          topic: {
            project: {
              projectMembers: [],
            },
          },
        });
        await expect(issueService.updateIssueTitle(mockParams)).rejects.toThrow(
          'PERMISSION_DENIED',
        );
      });

      test('projectMembers가 정의되지 않은 경우(undefined)도 PERMISSION_DENIED 처리를 해야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [],
          topic: {
            project: {
              projectMembers: undefined,
            },
          },
        });
        await expect(issueService.updateIssueTitle(mockParams)).rejects.toThrow(
          'PERMISSION_DENIED',
        );
      });
    });
  });

  describe('deleteIssue', () => {
    const issueId = 'issue-1';
    const userId = 'user-1';

    test('이슈가 존재하지 않으면 ISSUE_NOT_FOUND 에러를 던져야 한다', async () => {
      mockedFindPermission.mockResolvedValue(null);
      await expect(issueService.deleteIssue(issueId, userId)).rejects.toThrow('ISSUE_NOT_FOUND');
    });

    describe('Quick Issue 삭제 권한 (topicId 없음)', () => {
      test('소유자(Owner)라면 삭제에 성공해야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: null,
          issueMembers: [{ id: 'owner-1' }],
          topic: null,
        });
        mockedSoftDelete.mockResolvedValue({ id: issueId });

        await issueService.deleteIssue(issueId, userId);
        expect(mockedSoftDelete).toHaveBeenCalledWith(issueId);
      });
    });

    describe('일반 이슈 삭제 권한 (topicId 있음)', () => {
      test('프로젝트 멤버라면 삭제에 성공해야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [],
          topic: {
            project: {
              projectMembers: [{ id: 'pm-1' }],
            },
          },
        });
        mockedSoftDelete.mockResolvedValue({ id: issueId });

        await issueService.deleteIssue(issueId, userId);
        expect(mockedSoftDelete).toHaveBeenCalledWith(issueId);
      });

      test('프로젝트 멤버가 아니라면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [],
          topic: {
            project: {
              projectMembers: [],
            },
          },
        });
        await expect(issueService.deleteIssue(issueId, userId)).rejects.toThrow(
          'PERMISSION_DENIED',
        );
      });

      test('프로젝트 정보가 누락된 경우도 권한 거절되어야 한다', async () => {
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [],
          topic: { project: null },
        });
        await expect(issueService.deleteIssue(issueId, userId)).rejects.toThrow(
          'PERMISSION_DENIED',
        );
      });
    });
  });
});
