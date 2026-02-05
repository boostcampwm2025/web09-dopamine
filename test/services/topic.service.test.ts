import { findIssuesWithMapDataByTopicId } from '@/lib/repositories/issue.repository';
import {
  findTopicWithPermissionData,
  softDeleteTopic,
  updateTopicTitle,
} from '@/lib/repositories/topic.repository';
import { topicService } from '@/lib/services/topic.service';

jest.mock('@/lib/repositories/issue.repository');
jest.mock('@/lib/repositories/topic.repository');

const mockedFindIssuesMap = findIssuesWithMapDataByTopicId as jest.Mock;
const mockedFindTopicPermission = findTopicWithPermissionData as jest.Mock;
const mockedUpdateTitle = updateTopicTitle as jest.Mock;
const mockedSoftDelete = softDeleteTopic as jest.Mock;

describe('topicService', () => {
  const mockParams = { topicId: 'topic-1', title: 'New Topic', userId: 'user-1' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getIssuesMapData', () => {
    it('이슈/노드/연결 정보를 올바르게 분리 및 매핑해야 한다', async () => {
      mockedFindIssuesMap.mockResolvedValue({
        issues: [
          {
            id: 'i1',
            title: 'Issue 1',
            status: 'OPEN',
            createdAt: new Date(),
            updatedAt: new Date(),
            issueNode: { id: 'n1', positionX: 10, positionY: 20 },
          },
          {
            id: 'i2',
            title: 'Issue 2',
            status: 'CLOSE',
            createdAt: new Date(),
            updatedAt: new Date(),
            issueNode: null, // 노드 없는 케이스
          },
        ],
        connections: [{ id: 'c1', sourceIssueId: 'i1', targetIssueId: 'i2' }],
      });

      // When
      const result = await topicService.getIssuesMapData('topic-1');

      // Then
      expect(result.issues).toHaveLength(2);
      expect(result.nodes).toHaveLength(1); // 노드가 있는 i1만 포함되어야 함
      expect(result.nodes[0].issueId).toBe('i1');
      expect(result.connections).toHaveLength(1);
    });
  });

  describe('updateTopicTitle', () => {
    test('토픽이 없으면 TOPIC_NOT_FOUND 에러를 던져야 한다', async () => {
      mockedFindTopicPermission.mockResolvedValue(null);
      await expect(topicService.updateTopicTitle(mockParams)).rejects.toThrow('TOPIC_NOT_FOUND');
    });

    test('프로젝트 멤버가 아니면(length 0) PERMISSION_DENIED 에러를 던져야 한다', async () => {
      mockedFindTopicPermission.mockResolvedValue({
        project: { projectMembers: [] },
      });
      await expect(topicService.updateTopicTitle(mockParams)).rejects.toThrow('PERMISSION_DENIED');
    });

    test('project 정보가 아예 없는 경우도 PERMISSION_DENIED 처리를 해야 한다', async () => {
      mockedFindTopicPermission.mockResolvedValue({ project: null });
      await expect(topicService.updateTopicTitle(mockParams)).rejects.toThrow('PERMISSION_DENIED');
    });

    test('권한이 있는 멤버라면 제목 수정을 실행한다', async () => {
      mockedFindTopicPermission.mockResolvedValue({
        project: { projectMembers: [{ id: 'm1' }] },
      });
      mockedUpdateTitle.mockResolvedValue({ id: 'topic-1', title: 'New Topic' });

      const result = await topicService.updateTopicTitle(mockParams);
      expect(mockedUpdateTitle).toHaveBeenCalledWith('topic-1', 'New Topic');
      expect(result.title).toBe('New Topic');
    });
  });

  describe('deleteTopic', () => {
    const topicId = 'topic-1';
    const userId = 'user-1';

    test('토픽이 없으면 TOPIC_NOT_FOUND 에러를 던져야 한다', async () => {
      mockedFindTopicPermission.mockResolvedValue(null);
      await expect(topicService.deleteTopic(topicId, userId)).rejects.toThrow('TOPIC_NOT_FOUND');
    });

    test('프로젝트 멤버가 아니면 PERMISSION_DENIED 에러를 던져야 한다', async () => {
      mockedFindTopicPermission.mockResolvedValue({
        project: { projectMembers: [] },
      });
      await expect(topicService.deleteTopic(topicId, userId)).rejects.toThrow('PERMISSION_DENIED');
    });

    test('권한이 있는 멤버라면 소프트 삭제를 실행한다', async () => {
      // Given
      mockedFindTopicPermission.mockResolvedValue({
        project: { projectMembers: [{ id: 'm1' }] },
      });
      mockedSoftDelete.mockResolvedValue({ id: 'topic-1', deletedAt: new Date() });

      // When
      const result = await topicService.deleteTopic(topicId, userId);

      // Then
      expect(mockedSoftDelete).toHaveBeenCalledWith('topic-1');
      expect(result).toHaveProperty('deletedAt');
    });
  });
});
