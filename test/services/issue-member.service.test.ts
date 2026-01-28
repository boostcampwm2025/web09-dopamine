import { issueMemberRepository } from '@/lib/repositories/issue-member.repository';
import { issueMemberService } from '@/lib/services/issue-member.service';
import { generateRandomNickname } from '@/lib/utils/nickname';

jest.mock('@/lib/repositories/issue-member.repository');
jest.mock('@/lib/utils/nickname');

const mockedRepository = issueMemberRepository as jest.Mocked<typeof issueMemberRepository>;
const mockedGenerateNickname = generateRandomNickname as jest.MockedFunction<
  typeof generateRandomNickname
>;

describe('issueMemberService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('닉네임이 존재하면 중복 체크가 true를 반환한다', async () => {
    mockedRepository.findMemberByNickname.mockResolvedValue({ id: 'member-1' } as any);

    const result = await issueMemberService.checkNicknameDuplicate('issue-1', 'nickname');

    expect(mockedRepository.findMemberByNickname).toHaveBeenCalledWith('issue-1', 'nickname');
    expect(result).toBe(true);
  });

  it('중복이 없으면 첫 닉네임을 반환한다', async () => {
    mockedGenerateNickname.mockReturnValue('nick-1');
    mockedRepository.findMemberByNickname.mockResolvedValue(null);

    const result = await issueMemberService.createUniqueNickname('issue-1');

    expect(result).toBe('nick-1');
    expect(mockedRepository.findMemberByNickname).toHaveBeenCalledTimes(1);
  });

  it('중복이면 유니크 닉네임이 나올 때까지 재시도한다', async () => {
    mockedGenerateNickname.mockReturnValueOnce('nick-1').mockReturnValueOnce('nick-2');
    mockedRepository.findMemberByNickname
      .mockResolvedValueOnce({ id: 'member-1' } as any)
      .mockResolvedValueOnce(null);

    const result = await issueMemberService.createUniqueNickname('issue-1');

    expect(result).toBe('nick-2');
    expect(mockedRepository.findMemberByNickname).toHaveBeenCalledTimes(2);
  });

  it('재시도가 많으면 랜덤 접미사를 붙여 무한 루프를 방지한다', async () => {
    mockedGenerateNickname.mockReturnValue('nick');
    mockedRepository.findMemberByNickname.mockResolvedValue({ id: 'member-1' } as any);
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.123);

    const result = await issueMemberService.createUniqueNickname('issue-1');

    expect(result).toBe('nick_123');
    expect(mockedRepository.findMemberByNickname.mock.calls.length).toBeGreaterThanOrEqual(11);

    randomSpy.mockRestore();
  });
});
