<?php

namespace App\Services;

use App\Models\Issue;
use App\Models\Project;
use App\Models\ProjectIssueCounter;
use Illuminate\Support\Facades\DB;

class IssueService
{
    /**
     * Create a new issue with a sequential key.
     */
    public function createIssue(Project $project, array $data): Issue
    {
        return DB::transaction(function () use ($project, $data) {
            // Get or create the counter and lock the row
            $counter = ProjectIssueCounter::firstOrCreate(
                ['project_id' => $project->id],
                ['last_number' => 0]
            );

            // Re-fetch with lock to ensure atomicity
            $counter = ProjectIssueCounter::where('project_id', $project->id)
                ->lockForUpdate()
                ->first();

            $counter->last_number += 1;
            $counter->save();

            $data['project_id'] = $project->id;
            $data['key_number'] = $counter->last_number;

            return Issue::create($data);
        });
    }
}
