<?php

namespace App\Http\Controllers;

use App\Models\Issue;
use App\Models\Project;
use App\Services\IssueService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class IssueController extends Controller
{
    use AuthorizesRequests;

    protected $issueService;

    public function __construct(IssueService $issueService)
    {
        $this->issueService = $issueService;
    }

    /**
     * Display a listing of the resource for a project.
     */
    public function index(Project $project): JsonResponse
    {
        $this->authorize('viewAny', [Issue::class, $project]);

        $issues = $project->issues()
            ->with(['assignee', 'creator'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $issues->map(function ($issue) {
                return $this->formatIssue($issue);
            })
        ]);
    }

    /**
     * Store a newly created resource in storage for a project.
     */
    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Issue::class, $project]);

        $validated = $request->validate([
            'summary' => 'required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'nullable|string|max:50',
            'priority' => 'nullable|string|max:50',
            'issue_type' => 'required|string|max:50',
            'estimated_hours' => 'nullable|numeric|min:0|max:9999',
            'actual_hours' => 'nullable|numeric|min:0|max:9999',
            'assignee_id' => 'nullable|exists:users,id',
            'category'     => 'nullable|string|max:255',
            'milestone_id' => 'nullable|integer|exists:milestones,id',
            'due_date'     => 'nullable|date',
            'version'      => 'nullable|string|max:255',
        ]);

        $validated['creator_id'] = Auth::id();
        $validated['status'] = $validated['status'] ?? 'open';
        $validated['priority'] = $validated['priority'] ?? 'normal';

        $issue = $this->issueService->createIssue($project, $validated);

        return response()->json([
            'data' => $this->formatIssue($issue)
        ], 201);
    }

    /**
     * Display the specified issue.
     */
    public function show(Project $project, string $key): JsonResponse
    {
        $issue = $this->findIssueByKey($project, $key);
        
        $this->authorize('view', $issue);

        $issue->load(['assignee', 'creator', 'comments.user', 'history.user']);

        return response()->json([
            'data' => $this->formatIssue($issue)
        ]);
    }

    /**
     * Update the specified issue.
     */
    public function update(Request $request, Project $project, string $key): JsonResponse
    {
        $issue = $this->findIssueByKey($project, $key);

        $this->authorize('update', $issue);

        $validated = $request->validate([
            'summary' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'status' => 'sometimes|required|string|max:50',
            'priority' => 'sometimes|required|string|max:50',
            'issue_type' => 'sometimes|required|string|max:50',
            'estimated_hours' => 'nullable|numeric|min:0|max:9999',
            'actual_hours' => 'nullable|numeric|min:0|max:9999',
            'assignee_id' => 'nullable|exists:users,id',
            'category'     => 'nullable|string|max:255',
            'milestone_id' => 'nullable|integer|exists:milestones,id',
            'due_date'     => 'nullable|date',
            'version'      => 'nullable|string|max:255',
        ]);

        $issue->update($validated);

        return response()->json([
            'data' => $this->formatIssue($issue->fresh(['assignee', 'creator']))
        ]);
    }

    /**
     * Soft-delete the specified issue.
     */
    public function destroy(Project $project, string $key): JsonResponse
    {
        $issue = $this->findIssueByKey($project, $key);

        $this->authorize('delete', $issue);

        $issue->delete();

        return response()->json(null, 204);
    }

    /**
     * Find an issue by project and key (e.g., PROJ-1).
     */
    protected function findIssueByKey(Project $project, string $key): Issue
    {
        // Key is like PROJ-1, where PROJ is project key and 1 is key_number
        $parts = explode('-', $key);
        $keyNumber = end($parts);

        return $project->issues()
            ->where('key_number', $keyNumber)
            ->firstOrFail();
    }

    /**
     * Helper to format an issue with its key.
     */
    protected function formatIssue(Issue $issue): array
    {
        $data = $issue->toArray();
        $data['key'] = $issue->full_key;
        return $data;
    }
}
