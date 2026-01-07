import ConclusionSection from './_components/conclusion/conclusion-section';
import RankingList from './_components/ranking/ranking-list';
import VoteResult from './_components/vote-result/vote-result';
import WordCloud from './_components/word-cloud/word-cloud';
import styles from './page.module.css';

export default function IssueSummaryPage() {
  return (
    <div className={styles.container}>
      <ConclusionSection
        title="선택된 아이디어"
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
