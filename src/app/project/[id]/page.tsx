'use client';

import { useParams } from 'next/navigation';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();

  return (
    <div>
      <h1>프로젝트 상세</h1>
      <p>Project ID: {params.id}</p>
    </div>
  );
}
