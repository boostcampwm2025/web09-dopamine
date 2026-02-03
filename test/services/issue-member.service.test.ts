import { issueMemberService } from '@/lib/services/issue-member.service';
import { generateRandomNickname } from '@/lib/utils/nickname';

jest.mock('@/lib/utils/nickname');

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
});
