import ConclusionSection from './_components/conclusion/conclusion-section';
import RankingList from './_components/ranking/ranking-list';
import VoteResult from './_components/vote-result/vote-result';
import WordCloud from './_components/word-cloud/word-cloud';
import styles from './page.module.css';

import {prisma} from '@/lib/prisma';

export default async function IssueSummaryPage({params}: {params: {issueId: string}}) {

  // 데이터베이스에서 리포트 정보 가져오기
  // TODO : 다른 파일로 분리
  const report = await prisma.report.findFirst({
    where: {
      issueId: params.issueId,
    },
    include: {
      issue: true,
      selectedIdea: true,
      wordClouds: true,
    },
  });

  // TODO : 찾을 수 없을 경우 띄워줄 컴포넌트 구현
  if (!report) {
    return <div>리포트를 찾을 수 없습니다.</div>;
  }


  return (
    <div className={styles.container}>
      <ConclusionSection
        title= {"선택된 아이디어"}
        votes={150}
        candidates={25}
      />
      <div className={styles.wordCloudAndVoteBox}>
        <div className={`${styles.componentBox} ${styles.componentBoxFlex2}`}>
          <WordCloud />
        </div>
        <div className={`${styles.componentBox} ${styles.componentBoxFlex1}`}>
          <VoteResult />
        </div>
      </div>
      <RankingList />
    </div>
  );
}
