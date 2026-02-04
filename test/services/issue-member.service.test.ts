import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { generateRandomNickname } from '@/lib/utils/nickname';

jest.mock('@/lib/utils/nickname');
jest.mock('@/lib/repositories/issue-member.repository');

const mockedGenerateNickname = generateRandomNickname as jest.MockedFunction<
  typeof generateRandomNickname
>;

describe('issueMemberService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('랜덤 닉네임을 생성하여 반환한다', async () => {
    mockedGenerateNickname.mockReturnValue('nick-1');

    const result = await issueMemberService.createUniqueNickname();

    expect(result).toBe('nick-1');
    expect(mockedGenerateNickname).toHaveBeenCalledTimes(1);
  });

  it('유저 ID로 닉네임 존재 여부를 확인한다', async () => {
    (issueMemberRepository.findMemberByUserId as jest.Mock).mockResolvedValue({
      nickname: 'Test User',
    });

    const result = await issueMemberService.checkNicknameExists('issue-1', 'user-1');

    expect(result).toEqual({ nickname: 'Test User' });
    expect(issueMemberRepository.findMemberByUserId).toHaveBeenCalledWith('issue-1', 'user-1');
  });
});
