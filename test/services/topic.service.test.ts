import { findIssuesWithMapDataByTopicId } from '@/lib/repositories/issue.repository';
import { findTopicWithPermissionData, updateTopicTitle } from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';

jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/topic.repository');

const mockedFindIssuesWithMapDataByTopicId = findIssuesWithMapDataByTopicId as jest.MockedFunction<
  typeof findIssuesWithMapDataByTopicId
>;
const mockedFindTopicWithPermissionData = findTopicWithPermissionData as jest.MockedFunction<
  typeof findTopicWithPermissionData
>;
const mockedUpdateTopicTitle = updateTopicTitle as jest.MockedFunction<typeof updateTopicTitle>;

describe('topicService', () => {
  const mockParams = { topicId: 't1', title: 'New', userId: 'u1' };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIssuesMapData', () => {
    it('이슈/노드/연결 정보를 올바르게 매핑한다', async () => {
      mockedFindIssuesWithMapDataByTopicId.mockResolvedValue({
        issues: [
          {
            id: 'issue-1',
            title: 'Issue 1',
            status: 'OPEN',
            createdAt: new Date('2024-01-01T00:00:00Z'),
            updatedAt: new Date('2024-01-02T00:00:00Z'),
            issueNode: {
              id: 'node-1',
              positionX: 100,
              positionY: 200,
            },
          },
          {
            id: 'issue-2',
            title: 'Issue 2',
            status: 'CLOSE',
            createdAt: new Date('2024-02-01T00:00:00Z'),
            updatedAt: new Date('2024-02-02T00:00:00Z'),
            issueNode: null,
          },
        ],
        connections: [
          {
            id: 'conn-1',
            sourceIssueId: 'issue-1',
            targetIssueId: 'issue-2',
            sourceHandle: 'right',
            targetHandle: 'left',
          },
        ],
      } as any);

      const result = await topicService.getIssuesMapData('topic-1');

      expect(mockedFindIssuesWithMapDataByTopicId).toHaveBeenCalledWith('topic-1');
      expect(result.issues).toEqual([
        {
          id: 'issue-1',
          title: 'Issue 1',
          status: 'OPEN',
          createdAt: new Date('2024-01-01T00:00:00Z'),
          updatedAt: new Date('2024-01-02T00:00:00Z'),
        },
        {
          id: 'issue-2',
          title: 'Issue 2',
          status: 'CLOSE',
          createdAt: new Date('2024-02-01T00:00:00Z'),
          updatedAt: new Date('2024-02-02T00:00:00Z'),
        },
      ]);
      expect(result.nodes).toEqual([
        {
          id: 'node-1',
          issueId: 'issue-1',
          positionX: 100,
          positionY: 200,
        },
      ]);
      expect(result.connections).toEqual([
        {
          id: 'conn-1',
          sourceIssueId: 'issue-1',
          targetIssueId: 'issue-2',
          sourceHandle: 'right',
          targetHandle: 'left',
        },
      ]);
    });
  });

  describe('updateTopicTitle', () => {
    it('토픽이 없으면 TOPIC_NOT_FOUND 에러를 던져야 한다', async () => {
      mockedFindTopicWithPermissionData.mockResolvedValue(null);

      await expect(topicService.updateTopicTitle(mockParams)).rejects.toThrow('TOPIC_NOT_FOUND');
    });

    it('프로젝트 멤버가 아니면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
      mockedFindTopicWithPermissionData.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        project: { projectMembers: [] }, // 멤버 아님
      } as any);

      await expect(topicService.updateTopicTitle(mockParams)).rejects.toThrow('PERMISSION_DENIED');
    });

    it('권한이 있으면 수정을 실행해야 한다', async () => {
      mockedFindTopicWithPermissionData.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        project: { projectMembers: [{ id: 'm1' }] },
      } as any);
      mockedUpdateTopicTitle.mockResolvedValue({ id: 't1', title: 'New' });

      const result = await topicService.updateTopicTitle(mockParams);

      expect(result.title).toBe('New');
      expect(mockedUpdateTopicTitle).toHaveBeenCalledWith('t1', 'New');
    });
  });
});
