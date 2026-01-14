import { notFound } from 'next/navigation';
import { getReportSummaryByIssueId } from '@/lib/services/report.service';
import ConclusionSection from './_components/conclusion/conclusion-section';
import RankingList from './_components/ranking/ranking-list';
import VoteResult from './_components/vote-result/vote-result';
import WordCloud from './_components/word-cloud/word-cloud';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

export default async function IssueSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const report = await getReportSummaryByIssueId(id);

  if (!report) notFound();

  const selectedIdeaTitle = report.selectedIdea?.content ?? '선택된 아이디어가 없습니다';
  const selectedIdeaVotes = report.selectedIdea?.voteCount ?? 0;
  const candidateCount = report.rankings.all.length;
  const memo = report.memo ?? undefined;

  const Ranking = {
    normal: report.rankings.all,
    byCategory: report.rankings.byCategory,
  };

  return (
    <div className={styles.background}>
      <div className={styles.container}>
        <ConclusionSection
          title={selectedIdeaTitle}
          votes={selectedIdeaVotes}
          candidates={candidateCount}
          memo={memo}
        />
        <div className={styles.wordCloudAndVoteBox}>
          <div className={`${styles.componentBox} ${styles.componentBoxFlex2}`}>
            <WordCloud />
          </div>
          <div className={`${styles.componentBox} ${styles.componentBoxFlex1}`}>
            <VoteResult
              participants={report.statistics.totalParticipants}
              totalVotes={report.statistics.totalVotes}
              maxCommentCount={report.statistics.maxCommentCount}
            />
          </div>
        </div>
        <RankingList
          normalRankings={Ranking.normal}
          categorizedRankings={Ranking.byCategory}
        />
      </div>
    </div>
  );
}
