import { issueMemberRepository } from '../repositories/issue-member.repository';
import { generateRandomNickname } from '../utils/nickname';

export const issueMemberService = {
  async checkNicknameDuplicate(issueId: string, nickname: string) {
    const existingMember = await issueMemberRepository.findMemberByNickname(issueId, nickname);

    return !!existingMember; // 존재하면 true, 존재하지 않으면 false
  },

  async createUniqueNickname(issueId: string) {
    let nickname = generateRandomNickname();
    let retryCount = 0;

    while (await this.checkNicknameDuplicate(issueId, nickname)) {
      nickname = generateRandomNickname();
      retryCount++;

      // 무한 루프 방지용 안전장치. retry 횟수가 10번 이상이면 닉네임 뒤에 랜덤 숫자를 붙여서 강제 리턴
      if (retryCount > 10) {
        nickname += `_${Math.floor(Math.random() * 1000)}`;
        break;
      }
    }

    return nickname;
  },
};
