<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Issue;
use App\Models\IssueHistory;
use App\Models\Project;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    private const COMPLETED_STATUSES = ['resolved', 'closed'];
    private const MY_WORK_LIMIT = 6;
    private const UPCOMING_LIMIT = 5;
    private const PROJECT_HEALTH_LIMIT = 6;
    private const ACTIVITY_LIMIT = 8;

    public function show(Request $request): JsonResponse
    {
        $user = $request->user();
        $projectIds = $user->projects()->pluck('projects.id');
        $today = CarbonImmutable::today();
        $dueSoonEnd = $today->addDays(7);

        $assignedOpenIssues = Issue::query()
            ->whereIn('project_id', $projectIds)
            ->where('assignee_id', $user->id)
            ->whereNotIn('status', self::COMPLETED_STATUSES);

        return response()->json([
            'data' => [
                'summary' => [
                    'active_projects' => $projectIds->count(),
                    'my_open_issues' => (clone $assignedOpenIssues)->count(),
                    'due_soon' => (clone $assignedOpenIssues)
                        ->whereBetween('due_date', [$today->toDateString(), $dueSoonEnd->toDateString()])
                        ->count(),
                    'overdue' => (clone $assignedOpenIssues)
                        ->whereDate('due_date', '<', $today->toDateString())
                        ->count(),
                ],
                'my_work' => $this->myWork($projectIds, $user->id),
                'upcoming' => $this->upcoming($projectIds, $user->id, $today, $dueSoonEnd),
                'project_health' => $this->projectHealth($projectIds, $today),
                'recent_activity' => $this->recentActivity($projectIds),
            ],
        ]);
    }

    private function myWork($projectIds, int $userId): array
    {
        return Issue::query()
            ->with('project:id,name,key')
            ->whereIn('project_id', $projectIds)
            ->where('assignee_id', $userId)
            ->whereNotIn('status', self::COMPLETED_STATUSES)
            ->orderByRaw('due_date is null, due_date asc')
            ->orderByDesc('updated_at')
            ->limit(self::MY_WORK_LIMIT)
            ->get()
            ->map(fn (Issue $issue) => $this->issuePreview($issue))
            ->all();
    }

    private function upcoming($projectIds, int $userId, CarbonImmutable $today, CarbonImmutable $dueSoonEnd): array
    {
        return Issue::query()
            ->with('project:id,name,key')
            ->whereIn('project_id', $projectIds)
            ->where('assignee_id', $userId)
            ->whereNotIn('status', self::COMPLETED_STATUSES)
            ->whereBetween('due_date', [$today->toDateString(), $dueSoonEnd->toDateString()])
            ->orderBy('due_date')
            ->orderByDesc('updated_at')
            ->limit(self::UPCOMING_LIMIT)
            ->get()
            ->map(fn (Issue $issue) => $this->issuePreview($issue))
            ->all();
    }

    private function projectHealth($projectIds, CarbonImmutable $today): array
    {
        return Project::query()
            ->whereIn('id', $projectIds)
            ->withCount([
                'members',
                'issues',
                'issues as completed_issues_count' => fn ($query) => $query->whereIn('status', self::COMPLETED_STATUSES),
                'issues as overdue_issues_count' => fn ($query) => $query
                    ->whereNotIn('status', self::COMPLETED_STATUSES)
                    ->whereDate('due_date', '<', $today->toDateString()),
            ])
            ->orderByDesc('updated_at')
            ->limit(self::PROJECT_HEALTH_LIMIT)
            ->get()
            ->map(function (Project $project) {
                $issueCount = (int) $project->issues_count;
                $progress = $issueCount > 0
                    ? (int) round(((int) $project->completed_issues_count / $issueCount) * 100)
                    : 0;

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'key' => $project->key,
                    'members_count' => (int) $project->members_count,
                    'issues_count' => $issueCount,
                    'overdue_issues_count' => (int) $project->overdue_issues_count,
                    'progress' => $progress,
                    'updated_at' => $project->updated_at?->toJSON(),
                ];
            })
            ->all();
    }

    private function recentActivity($projectIds): array
    {
        $comments = Comment::query()
            ->with(['user:id,name', 'issue.project:id,name,key'])
            ->whereHas('issue', fn ($query) => $query->whereIn('project_id', $projectIds))
            ->latest()
            ->limit(self::ACTIVITY_LIMIT)
            ->get()
            ->map(function (Comment $comment) {
                return [
                    'type' => 'comment',
                    'actor' => $comment->user?->name,
                    'issue_key' => $comment->issue?->full_key,
                    'issue_summary' => $comment->issue?->summary,
                    'project_id' => $comment->issue?->project_id,
                    'project_name' => $comment->issue?->project?->name,
                    'created_at' => $comment->created_at?->toJSON(),
                    'text' => trim(($comment->user?->name ?? 'Someone').' commented on '.$comment->issue?->full_key),
                ];
            });

        $history = IssueHistory::query()
            ->with(['user:id,name', 'issue.project:id,name,key'])
            ->whereHas('issue', fn ($query) => $query->whereIn('project_id', $projectIds))
            ->latest()
            ->limit(self::ACTIVITY_LIMIT)
            ->get()
            ->map(function (IssueHistory $entry) {
                return [
                    'type' => 'history',
                    'actor' => $entry->user?->name,
                    'issue_key' => $entry->issue?->full_key,
                    'issue_summary' => $entry->issue?->summary,
                    'project_id' => $entry->issue?->project_id,
                    'project_name' => $entry->issue?->project?->name,
                    'created_at' => $entry->created_at?->toJSON(),
                    'field' => $entry->field,
                    'old_value' => $entry->old_value,
                    'new_value' => $entry->new_value,
                    'text' => trim(($entry->user?->name ?? 'Someone').' changed '.$entry->field.' on '.$entry->issue?->full_key),
                ];
            });

        return $comments
            ->concat($history)
            ->sortByDesc('created_at')
            ->take(self::ACTIVITY_LIMIT)
            ->values()
            ->all();
    }

    private function issuePreview(Issue $issue): array
    {
        return [
            'id' => $issue->id,
            'project_id' => $issue->project_id,
            'project_name' => $issue->project?->name,
            'project_key' => $issue->project?->key,
            'key' => $issue->full_key,
            'summary' => $issue->summary,
            'status' => $issue->status,
            'priority' => $issue->priority,
            'due_date' => $issue->due_date?->toDateString(),
            'updated_at' => $issue->updated_at?->toJSON(),
        ];
    }
}
