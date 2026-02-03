import * as projectRepository from '@/lib/repositories/project.repository';
import { getProjectListForUser } from '@/lib/services/project.service';

// 1. Repository 모킹
jest.mock('@/lib/repositories/project.repository');

describe('getProjectListForUser', () => {
  // Mock 함수 타입 캐스팅
  const mockedGetProjects = projectRepository.getProjectsByUserMembership as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('사용자 ID로 프로젝트 목록을 조회하고 날짜를 ISO 문자열로 변환하여 반환한다', async () => {
    // Given
    const userId = 'user-1';
    const mockDate = new Date('2024-01-01T00:00:00.000Z');

    // Repository가 반환하는 원본 데이터 (Date 객체 포함)
    const mockRepoData = [
      {
        id: 'project-1',
        title: '테스트 프로젝트',
        description: '설명',
        ownerId: 'owner-1',
        memberCount: 3,
        createdAt: mockDate,
        updatedAt: mockDate,
        members: [],
      },
    ];

    mockedGetProjects.mockResolvedValue(mockRepoData);

    // When
    const result = await getProjectListForUser(userId);

    // Then
    // 1. Repository 호출 검증
    expect(mockedGetProjects).toHaveBeenCalledWith(userId);

    // 2. 반환값 검증 (Date -> String 변환 확인)
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      ...mockRepoData[0],
      createdAt: '2024-01-01T00:00:00.000Z', // Date 객체가 ISO string으로 변환되었는지 확인
      updatedAt: '2024-01-01T00:00:00.000Z',
    });
  });

  it('프로젝트가 없으면 빈 배열을 반환한다', async () => {
    // Given
    mockedGetProjects.mockResolvedValue([]);

    // When
    const result = await getProjectListForUser('user-1');

    // Then
    expect(result).toEqual([]);
  });

  it('Repository에서 에러 발생 시 에러를 그대로 전파한다', async () => {
    // Given
    const error = new Error('DB Connection Error');
    mockedGetProjects.mockRejectedValue(error);

    // When & Then
    // 서비스 내부에 try-catch가 없으므로 에러가 상위로 전파되는지 확인
    await expect(getProjectListForUser('user-1')).rejects.toThrow('DB Connection Error');
  });
});
