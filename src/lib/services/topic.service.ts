import { getServerSession } from 'next-auth';
import { authOptions } from '../auth';
import { findIssuesWithMapDataByTopicId } from '../repositories/issue.repository';
import {
  findTopicWithPermissionData,
  softDeleteTopic,
  updateTopicTitle,
} from '../repositories/topic.repository';

interface UpdateTopicTitleProps {
  topicId: string;
  title: string;
  userId: string;
}

export const topicService = {
  async checkTopicAccess(topicId: string, userId: string): Promise<void> {
    const topic = await findTopicWithPermissionData(topicId, userId);

    if (!topic) {
      throw new Error('TOPIC_NOT_FOUND');
    }

    const projectMembers = topic.project?.projectMembers || [];
    const isProjectMember = projectMembers.length > 0;

    if (!isProjectMember) {
      throw new Error('PERMISSION_DENIED');
    }
  },

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

  async updateTopicTitle({ topicId, title, userId }: UpdateTopicTitleProps) {
    await this.checkTopicAccess(topicId, userId);
    return await updateTopicTitle(topicId, title);
  },

  async deleteTopic(topicId: string) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      throw new Error('UNAUTHORIZED');
    }

    const userId = session.user.id;

    const topic = await findTopicWithPermissionData(topicId, userId);

    if (!topic) {
      throw new Error('TOPIC_NOT_FOUND');
    }

    const projectMembers = topic.project?.projectMembers || [];
    const isProjectMember = projectMembers.length > 0;

    if (!isProjectMember) {
      throw new Error('PERMISSION_DENIED');
    }

    return await softDeleteTopic(topicId);
  },
};
