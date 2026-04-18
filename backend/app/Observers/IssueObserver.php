<?php

namespace App\Observers;

use App\Models\Issue;
use App\Models\IssueHistory;
use App\Jobs\GenerateIssueEmbeddingJob;
use Illuminate\Support\Facades\Auth;

class IssueObserver
{
    /**
     * Handle the Issue "created" event.
     */
    public function created(Issue $issue): void
    {
        GenerateIssueEmbeddingJob::dispatch($issue);
    }

    /**
     * Handle the Issue "updated" event.
     */
    public function updated(Issue $issue): void
    {
        // Invalidate AI thread summary cache
        \Illuminate\Support\Facades\Cache::forget("issue_{$issue->id}_summary");

        $dirty = $issue->getDirty();
        $original = $issue->getOriginal();

        // Dispatch embedding job if summary or description changed
        if (array_intersect(['summary', 'description'], array_keys($dirty))) {
            GenerateIssueEmbeddingJob::dispatch($issue);
        }

        foreach ($dirty as $field => $newValue) {
            // Skip fields we don't want to track
            if (in_array($field, ['updated_at', 'created_at', 'deleted_at'])) {
                continue;
            }

            $oldValue = $original[$field] ?? null;

            IssueHistory::create([
                'issue_id' => $issue->id,
                'user_id' => Auth::id() ?? $issue->creator_id, // Fallback if no auth user
                'field' => $field,
                'old_value' => is_array($oldValue) ? json_encode($oldValue) : (string) $oldValue,
                'new_value' => is_array($newValue) ? json_encode($newValue) : (string) $newValue,
            ]);
        }
    }
}
