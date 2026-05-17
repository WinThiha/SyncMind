<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Project;
use App\Services\AIMilestoneService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class AIMilestoneController extends Controller
{
    public function __construct(private AIMilestoneService $milestoneAI) {}

    /**
     * POST /api/projects/{project}/milestones/{milestone}/ai/summarize
     */
    public function summarize(Request $request, Project $project, Milestone $milestone): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $force = $request->boolean('force', false);
        $cacheKey = "milestone_{$milestone->id}_summary";

        if (! $force && $cached = Cache::get($cacheKey)) {
            return response()->json(['data' => $cached, 'cached' => true]);
        }

        $result = $this->milestoneAI->summarize($milestone, $request->user());
        Cache::put($cacheKey, $result, now()->addMinutes(30));

        return response()->json(['data' => $result, 'cached' => false]);
    }

    /**
     * POST /api/projects/{project}/milestones/{milestone}/ai/risk-analysis
     */
    public function riskAnalysis(Request $request, Project $project, Milestone $milestone): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $force = $request->boolean('force', false);
        $cacheKey = "milestone_{$milestone->id}_risk";

        if (! $force && $cached = Cache::get($cacheKey)) {
            return response()->json(['data' => $cached, 'cached' => true]);
        }

        $result = $this->milestoneAI->analyzeRisk($milestone, $request->user());
        Cache::put($cacheKey, $result, now()->addMinutes(30));

        return response()->json(['data' => $result, 'cached' => false]);
    }

    /**
     * POST /api/projects/{project}/milestones/{milestone}/ai/suggest-dates
     */
    public function suggestDates(Request $request, Project $project, Milestone $milestone): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $validated = $request->validate([
            'context' => 'nullable|string|max:500',
        ]);

        $result = $this->milestoneAI->suggestDates($milestone, $validated['context'] ?? '');

        return response()->json(['data' => $result]);
    }

    /**
     * POST /api/projects/{project}/milestones/{milestone}/ai/suggest-issues
     */
    public function suggestIssues(Request $request, Project $project, Milestone $milestone): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $validated = $request->validate([
            'limit' => 'nullable|integer|min:1|max:20',
        ]);

        $result = $this->milestoneAI->suggestIssues($milestone, $validated['limit'] ?? 10);

        return response()->json(['data' => $result]);
    }

    /**
     * POST /api/projects/{project}/ai/suggest-milestone-dates
     * For new milestones that do not have an ID yet.
     */
    public function suggestDatesForNew(Request $request, Project $project): JsonResponse
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'context' => 'nullable|string|max:500',
        ]);

        $result = $this->milestoneAI->suggestDatesForProject(
            $project,
            $validated['name'],
            $validated['description'] ?? '',
            $validated['context'] ?? ''
        );

        return response()->json(['data' => $result]);
    }
}
