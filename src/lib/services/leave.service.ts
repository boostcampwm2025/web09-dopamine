import { LeaveRepository } from '../repositories/leave.repository';

export const LeaveService = {
  async leaveProject(projectId: string, userId: string) {
    const project = await LeaveRepository.getProjectOwnerId(projectId);

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    if (project.ownerId === userId) {
      throw new Error('PROJECT_OWNER_CANNOT_LEAVE');
    }

    const updatedCount = await LeaveRepository.leaveProject(projectId, userId);

    if (updatedCount === 0) {
      throw new Error('PROJECT_MEMBER_NOT_FOUND');
    }

    return { projectId };
  },
};
