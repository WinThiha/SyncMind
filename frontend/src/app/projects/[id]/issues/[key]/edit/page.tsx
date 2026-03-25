'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import EditIssueForm from '@/components/issues/EditIssueForm';

export default function EditIssuePage() {
  const params = useParams();
  const id = params.id as string;
  const key = params.key as string;

  return (
    <EditIssueForm projectId={id} issueKey={key} />
  );
}
