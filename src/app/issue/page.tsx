'use client';

import Header from '@/app/issue/_components/Header';
import TopicIssueLayout from '@/components/TopicIssueLayout';

const IssuePage = () => {
  return (
    <TopicIssueLayout header={<Header />}>
      <div>컨텐츠 영역</div>
    </TopicIssueLayout>
  );
};

export default IssuePage;
