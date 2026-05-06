<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreProjectRequest;
use App\Models\Project;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ProjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $projects = $request->user()->projects()
            ->select('projects.*')
            ->withPivot('role')
            ->get();

        return response()->json([
            'data' => $projects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreProjectRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $project = Project::create([
                ...$request->validated(),
                'creator_id' => $request->user()->id,
            ]);

            $project->members()->attach($request->user()->id, ['role' => 'admin']);

            return response()->json([
                'message' => 'Project created successfully.',
                'data' => $project->load('creator'),
            ], 201);
        });
    }

    /**
     * Display the specified resource.
     */
    public function show(Request $request, Project $project)
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403, 'Unauthorized access to this project.');
        }

        return response()->json([
            'data' => $project->load('creator', 'members'),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(\App\Http\Requests\UpdateProjectRequest $request, Project $project)
    {
        if ($request->user()->cannot('update', $project)) {
            abort(403, 'Unauthorized access to update this project.');
        }

        $project->update($request->validated());

        return response()->json([
            'message' => 'Project updated successfully.',
            'data' => $project,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, Project $project)
    {
        if ($request->user()->cannot('delete', $project)) {
            abort(403, 'Only the project creator can delete the project.');
        }

        $project->delete();

        return response()->json([
            'message' => 'Project deleted successfully.',
        ]);
    }

    /**
     * Transfer ownership of the project.
     */
    public function transferOwnership(Request $request, Project $project)
    {
        if ($request->user()->cannot('delete', $project)) {
            abort(403, 'Only the project creator can transfer ownership.');
        }

        $validated = $request->validate([
            'new_creator_id' => 'required|exists:users,id',
        ]);

        $newCreatorId = $validated['new_creator_id'];

        $member = $project->members()->where('user_id', $newCreatorId)->first();

        if (! $member || $member->pivot->role !== 'admin') {
            return response()->json(['message' => 'New owner must be an existing admin of the project.'], 422);
        }

        $project->update(['creator_id' => $newCreatorId]);

        return response()->json([
            'message' => 'Project ownership transferred successfully.',
        ]);
    }
}
