<?php

namespace App\Observers;

use App\Models\Issue;
use App\Models\IssueHistory;
use Illuminate\Support\Facades\Auth;

class IssueObserver
{
    /**
     * Handle the Issue "updated" event.
     */
    public function updated(Issue $issue): void
    {
        $dirty = $issue->getDirty();
        $original = $issue->getOriginal();

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
