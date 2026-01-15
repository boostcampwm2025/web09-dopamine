const ADJECTIVES = [
  '공부하는',
  '집중한',
  '생각하는',
  '졸린',
  '조용한',
  '열정적인',
  '생각중인',
  '회의중인',
  '집중중인',
  '고민중인',
  '토론중인',
  '정리중인',
  '메모중인',
  '분석중인',
  '질문중인',
];

const NOUNS = [
  '개구리',
  '고양이',
  '강아지',
  '너구리',
  '여우',
  '곰',
  '토끼',
  '수달',
  '판다',
  '다람쥐',
  '부엉이',
  '펭귄',
  '호랑이',
  '고슴도치',
  '고래',
];

export function generateRandomNickname() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];

  return `${adjective} ${noun}`;
}
