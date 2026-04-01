<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Services\AIIssueSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AIIssueController extends Controller
{
    public function __construct(private AIIssueSuggestionService $service) {}

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

        $suggestions = $this->service->suggest($project, $validated['summary']);

        return response()->json(['data' => $suggestions]);
    }
}
