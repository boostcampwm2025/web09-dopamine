import { generateRandomNickname } from '../utils/nickname';

export const issueMemberService = {
  async createUniqueNickname() {
    return generateRandomNickname();
  },
};
