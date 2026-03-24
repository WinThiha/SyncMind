'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import CreateIssueForm from '@/components/issues/CreateIssueForm';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';

export default function NewIssuePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <motion.button 
          whileHover={{ x: -4 }}
          onClick={() => router.back()} 
          className="p-2 hover:bg-foreground/5 rounded-full transition-colors text-foreground/40 hover:text-foreground"
        >
          <ChevronLeft size={24} />
        </motion.button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Issue</h1>
          <p className="text-foreground/60 text-sm mt-1">Add a new task, bug, or story to your project.</p>
        </div>
      </div>

      <CreateIssueForm 
        projectId={id} 
        onSuccess={() => router.push(`/projects/${id}/issues`)}
        onCancel={() => router.back()}
      />
    </div>
  );
}
