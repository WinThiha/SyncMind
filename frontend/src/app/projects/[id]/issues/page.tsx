'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function IssueListPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();

  useEffect(() => {
    params.then(({ id }) => router.push(`/issues?project_id=${id}`));
  }, [params, router]);

  return null;
}
