import { generateRandomNickname } from '../utils/nickname';
import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';

export const issueMemberService = {
  async createUniqueNickname() {
    return generateRandomNickname();
  },
  async checkNicknameExists(issueId: string, nickname: string) {
    return issueMemberRepository.findMemberByUserId(issueId, nickname);
  },
  async updateNickname(issueId: string, userId: string, nickname: string) {
    // 닉네임 유효성 검사
    if (!nickname || nickname.trim().length === 0) {
      throw new Error('INVALID_NICKNAME');
    }

    // 닉네임 업데이트
    return issueMemberRepository.updateNickname(issueId, userId, nickname);
  },
};
