<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Project;
use App\Services\AIIssueSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IssuesGlobalController extends Controller
{
    public function __construct(
        private AIIssueSearchService $searchService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $projectIds = $user->projects()->pluck('projects.id');

        $query = Issue::query()
            ->with(['assignee', 'creator', 'project:id,name,key'])
            ->withCount('comments')
            ->whereIn('project_id', $projectIds);

        if ($request->filled('project_id')) {
            $query->where('project_id', $request->input('project_id'));
        }

        if ($request->filled('status') && $request->input('status') !== 'all') {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $query->where('priority', $request->input('priority'));
        }

        if ($request->filled('type') && $request->input('type') !== 'all') {
            $query->where('issue_type', $request->input('type'));
        }

        if ($request->filled('due_date_start') && $request->filled('due_date_end')) {
            $query->whereBetween('due_date', [
                $request->input('due_date_start'),
                $request->input('due_date_end'),
            ]);
        } elseif ($request->filled('due_date_start')) {
            $query->whereDate('due_date', '>=', $request->input('due_date_start'));
        } elseif ($request->filled('due_date_end')) {
            $query->whereDate('due_date', '<=', $request->input('due_date_end'));
        } elseif ($request->input('due_date') === 'overdue') {
            $query->whereNotIn('status', ['resolved', 'closed'])
                  ->whereDate('due_date', '<', now()->toDateString());
        }

        if ($request->filled('assignee') && $request->input('assignee') !== 'all') {
            if ($request->input('assignee') === 'unassigned') {
                $query->whereNull('assignee_id');
            } elseif ($request->input('assignee') === 'me') {
                $query->where('assignee_id', $user->id);
            } else {
                $query->where('assignee_id', $request->input('assignee'));
            }
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('summary', 'ilike', "%{$search}%")
                  ->orWhereRaw("key_number::text = ?", [$search]);
            });
        }

        if ($request->filled('high_priority') && $request->boolean('high_priority')) {
            $query->whereIn('priority', ['high', 'critical']);
        }

        $paginated = $query
            ->orderByDesc('updated_at')
            ->paginate(10);

        return response()->json([
            'data' => collect($paginated->items())->map(fn (Issue $issue) => $this->formatIssue($issue)),
            'meta' => [
                'current_page' => $paginated->currentPage(),
                'last_page'    => $paginated->lastPage(),
                'total'        => $paginated->total(),
                'per_page'     => $paginated->perPage(),
            ],
        ]);
    }

    public function summary(Request $request): JsonResponse
    {
        $user = $request->user();
        $projectId = $request->input('project_id');

        $projectIds = $user->projects()->pluck('projects.id');
        $today = now()->toDateString();
        $completedStatuses = ['resolved', 'closed'];

        $baseQuery = Issue::query()
            ->whereIn('project_id', $projectIds);

        if ($projectId) {
            $baseQuery->where('project_id', $projectId);
            $projectName = Project::where('id', $projectId)->value('name');
        } else {
            $projectName = 'All projects';
        }

        $assignedToMe = (clone $baseQuery)
            ->where('assignee_id', $user->id)
            ->whereNotIn('status', $completedStatuses)
            ->count();

        $overdue = (clone $baseQuery)
            ->where('assignee_id', $user->id)
            ->whereNotIn('status', $completedStatuses)
            ->whereDate('due_date', '<', $today)
            ->count();

        $highPriority = (clone $baseQuery)
            ->whereNotIn('status', $completedStatuses)
            ->whereIn('priority', ['high', 'critical'])
            ->count();

        $unassigned = (clone $baseQuery)
            ->whereNull('assignee_id')
            ->whereNotIn('status', $completedStatuses)
            ->count();

        return response()->json([
            'data' => [
                'assigned_to_me' => $assignedToMe,
                'overdue' => $overdue,
                'high_priority' => $highPriority,
                'unassigned' => $unassigned,
                'project_name' => $projectName,
            ],
        ]);
    }

    public function similar(Request $request, AIIssueSearchService $searchService): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => 'required|integer|exists:projects,id',
            'text' => 'required|string|max:1000',
        ]);

        $project = Project::findOrFail($validated['project_id']);

        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $filters = [];
        if ($request->filled('status') && $request->input('status') !== 'all') {
            $filters['status'] = $request->input('status');
        }
        if ($request->filled('priority') && $request->input('priority') !== 'all') {
            $filters['priority'] = $request->input('priority');
        }
        if ($request->filled('type') && $request->input('type') !== 'all') {
            $filters['issue_type'] = $request->input('type');
        }
        if ($request->filled('due_date_start')) {
            $filters['due_date_start'] = $request->input('due_date_start');
        }
        if ($request->filled('due_date_end')) {
            $filters['due_date_end'] = $request->input('due_date_end');
        }

        $similarIssues = $this->searchService->findSimilar($project, $validated['text'], 10, $filters);

        return response()->json([
            'data' => $similarIssues->map(fn ($issue) => [
                'id' => $issue->id,
                'project_id' => $issue->project_id,
                'key' => $issue->key,
                'full_key' => $issue->key,
                'summary' => $issue->summary,
                'description' => $issue->description ?? null,
                'status' => $issue->status,
                'priority' => $issue->priority,
                'issue_type' => $issue->issue_type ?? null,
                'due_date' => $issue->due_date ?? null,
                'updated_at' => $issue->updated_at?->toIso8601String() ?? null,
                'comments_count' => $issue->comments_count ?? 0,
                'similarity' => $issue->similarity,
                'project_name' => $issue->project?->name ?? null,
                'project_key' => $issue->project?->key ?? null,
                'assignee_id' => $issue->assignee_id ?? null,
                'assignee' => $issue->assignee ? [
                    'id' => $issue->assignee->id,
                    'name' => $issue->assignee->name,
                    'email' => $issue->assignee->email,
                ] : null,
            ]),
        ]);
    }

    protected function formatIssue(Issue $issue): array
    {
        $data = $issue->toArray();
        $data['key'] = $issue->full_key;
        $data['project_name'] = $issue->project?->name;
        $data['project_key'] = $issue->project?->key;
        $data['assignee_id'] = $issue->assignee_id;

        return $data;
    }
}