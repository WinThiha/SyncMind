<?php

namespace App\Http\Controllers;

use App\Models\Milestone;
use App\Models\Project;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MilestoneController extends Controller
{
    use AuthorizesRequests;

    public function index(Project $project): JsonResponse
    {
        $this->authorize('viewAny', [Milestone::class, $project]);

        $milestones = $project->milestones()->orderBy('due_date')->get();

        return response()->json(['data' => $milestones]);
    }

    public function store(Request $request, Project $project): JsonResponse
    {
        $this->authorize('create', [Milestone::class, $project]);

        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'nullable|date',
            'due_date'    => 'nullable|date|after_or_equal:start_date',
            'status'      => 'nullable|string|in:open,in_progress,closed',
        ]);

        $milestone = $project->milestones()->create($validated);

        return response()->json(['data' => $milestone->fresh()], 201);
    }

    public function show(Project $project, Milestone $milestone): JsonResponse
    {
        $this->authorize('view', $milestone);

        $milestone->load(['issues.assignee', 'issues.creator']);

        return response()->json(['data' => $milestone]);
    }

    public function update(Request $request, Project $project, Milestone $milestone): JsonResponse
    {
        $this->authorize('update', $milestone);

        $validated = $request->validate([
            'name'        => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'start_date'  => 'nullable|date',
            'due_date'    => 'nullable|date|after_or_equal:start_date',
            'status'      => 'nullable|string|in:open,in_progress,closed',
        ]);

        $milestone->update($validated);

        return response()->json(['data' => $milestone->fresh()]);
    }

    public function destroy(Project $project, Milestone $milestone): JsonResponse
    {
        $this->authorize('delete', $milestone);

        $milestone->delete();

        return response()->json(null, 204);
    }
}
