<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AIIssueSuggestionService;
use App\Services\AIIssueSearchService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIIssueController extends Controller
{
    public function __construct(
        private AIIssueSuggestionService $suggestionService,
        private AIIssueSearchService $searchService
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

        $suggestions = $this->suggestionService->suggest($project, $validated['summary']);

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
}
