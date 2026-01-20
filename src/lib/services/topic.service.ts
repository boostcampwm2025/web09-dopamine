import { findIssuesWithMapDataByTopicId } from '../repositories/issue.repository';

export const topicService = {
  async getIssuesMapData(topicId: string) {
    const data = await findIssuesWithMapDataByTopicId(topicId);

    // issues와 nodes를 분리하여 반환
    return {
      issues: data.issues.map((issue) => ({
        id: issue.id,
        title: issue.title,
        status: issue.status,
        createdAt: issue.createdAt,
        updatedAt: issue.updatedAt,
      })),
      nodes: data.issues
        .filter((issue) => issue.issueNode)
        .map((issue) => ({
          id: issue.issueNode!.id,
          issueId: issue.id,
          positionX: issue.issueNode!.positionX,
          positionY: issue.issueNode!.positionY,
        })),
      connections: data.connections,
    };
  },
};
