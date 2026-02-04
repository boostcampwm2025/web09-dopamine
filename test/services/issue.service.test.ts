import { findIssueWithPermissionData, updateIssueTitle } from '@/lib/repositories/issue.repository';
import { issueService } from '@/lib/services/issue.service';

jest.mock('@/lib/repositories/issue.repository');

const mockedFindPermission = findIssueWithPermissionData as jest.Mock;
const mockedUpdateTitle = updateIssueTitle as jest.Mock;

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
    // 1. 공통 실패 케이스: 이슈 없음
    test('이슈가 존재하지 않으면 ISSUE_NOT_FOUND 에러를 던져야 한다', async () => {
      mockedFindPermission.mockResolvedValue(null);

      await expect(issueService.updateIssueTitle(mockParams)).rejects.toThrow('ISSUE_NOT_FOUND');
    });

    // 2. Quick Issue (topicId 없음) 케이스
    describe('Quick Issue 권한 검증 (topicId가 없는 경우)', () => {
      test('소유자(Owner)라면 제목 수정에 성공해야 한다', async () => {
        // Given: topicId가 없고, issueMembers(Owner)가 존재함
        mockedFindPermission.mockResolvedValue({
          topicId: null,
          issueMembers: [{ id: 'member-1' }],
          topic: null,
        });
        mockedUpdateTitle.mockResolvedValue({ id: 'issue-1', title: '새로운 제목' });

        // When
        const result = await issueService.updateIssueTitle(mockParams);

        // Then
        expect(mockedUpdateTitle).toHaveBeenCalledWith(mockParams.issueId, mockParams.title);
        expect(result.title).toBe('새로운 제목');
      });

      test('소유자가 아니라면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
        // Given: issueMembers가 빈 배열
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

    // 3. 일반 이슈 (topicId 있음) 케이스
    describe('일반 이슈 권한 검증 (topicId가 있는 경우)', () => {
      test('프로젝트 멤버라면 제목 수정에 성공해야 한다', async () => {
        // Given: topicId가 있고, projectMembers가 존재함
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [], // 일반 이슈는 이 필드를 보지 않음
          topic: {
            project: {
              projectMembers: [{ id: 'pm-1' }],
            },
          },
        });
        mockedUpdateTitle.mockResolvedValue({ id: 'issue-1', title: '새로운 제목' });

        // When
        const result = await issueService.updateIssueTitle(mockParams);

        // Then
        expect(mockedUpdateTitle).toHaveBeenCalled();
        expect(result.id).toBe('issue-1');
      });

      test('프로젝트 멤버가 아니라면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
        // Given: projectMembers가 빈 배열
        mockedFindPermission.mockResolvedValue({
          topicId: 'topic-1',
          issueMembers: [{ id: 'owner-1' }], // Owner여도 프로젝트 멤버가 아니면 거절 (로직 기준)
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
    });
  });
});
