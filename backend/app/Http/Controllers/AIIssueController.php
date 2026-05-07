<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AIIssueSearchService;
use App\Services\AIIssueSuggestionService;
use App\Services\AIThreadSummarizationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AIIssueController extends Controller
{
    public function __construct(
        private AIIssueSuggestionService $suggestionService,
        private AIIssueSearchService $searchService,
        private AIThreadSummarizationService $summarizationService
    ) {}

    /**
     * Return AI-generated field suggestions for a new issue.
     *
     * POST /api/projects/{project}/ai/suggest-issue
     */
    public function suggest(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $validated = $request->validate([
            'summary' => 'required|string|max:255',
        ]);

        $suggestions = $this->suggestionService->suggest($project, $validated['summary'], $request->user());

        return response()->json(['data' => $suggestions]);
    }

    /**
     * Return issues semantically similar to the provided text.
     *
     * GET /api/projects/{project}/ai/similar-issues
     */
    public function similar(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $validated = $request->validate([
            'text' => 'required|string|max:1000',
        ]);

        $similarIssues = $this->searchService->findSimilar($project, $validated['text']);

        return response()->json(['data' => $similarIssues]);
    }

    /**
     * Return an AI-generated summary of the issue thread.
     *
     * POST /api/projects/{project}/issues/{issue_key}/ai/summarize
     */
    public function summarize(Request $request, Project $project, string $issue_key): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $issue = $this->findIssueByKey($project, $issue_key);

        $cacheKey = "issue_{$issue->id}_summary";
        $force = $request->boolean('force', false);

        if (! $force && $cached = Cache::get($cacheKey)) {
            return response()->json(['data' => $cached, 'cached' => true]);
        }

        $summary = $this->summarizationService->summarize($issue, $request->user());

        // Cache for 24 hours (can be invalidated by observers)
        Cache::put($cacheKey, $summary, now()->addDay());

        return response()->json(['data' => $summary, 'cached' => false]);
    }

    /**
     * Find an issue by project and key.
     */
    protected function findIssueByKey(Project $project, string $key): \App\Models\Issue
    {
        $parts = explode('-', $key);
        $keyNumber = end($parts);

        return $project->issues()
            ->where('key_number', $keyNumber)
            ->firstOrFail();
    }
}
