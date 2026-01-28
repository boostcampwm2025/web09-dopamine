import { findIssuesWithMapDataByTopicId } from '@/lib/repositories/issue.repository';
import { topicService } from '@/lib/services/topic.service';

jest.mock('@/lib/repositories/issue.repository');

const mockedFindIssuesWithMapDataByTopicId =
  findIssuesWithMapDataByTopicId as jest.MockedFunction<typeof findIssuesWithMapDataByTopicId>;

describe('topicService.getIssuesMapData', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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
