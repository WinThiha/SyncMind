<?php

namespace App\Http\Controllers;

use App\Models\Project;
use App\Models\User;
use Illuminate\Http\Request;

class ProjectMemberController extends Controller
{
    public function index(Request $request, Project $project)
    {
        if ($request->user()->cannot('view', $project)) {
            abort(403, 'Unauthorized');
        }

        return response()->json([
            'data' => $project->members()->select('users.id', 'name', 'email')->withPivot('role')->get()
        ]);
    }

    public function store(Request $request, Project $project)
    {
        if ($request->user()->cannot('manageMembers', $project)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'email' => 'required|email|exists:users,email',
            'role' => 'required|in:admin,normal'
        ]);

        $userToAdd = User::where('email', $validated['email'])->first();

        if ($project->members()->where('user_id', $userToAdd->id)->exists()) {
            return response()->json(['message' => 'User is already a member of this project.'], 422);
        }

        $project->members()->attach($userToAdd->id, ['role' => $validated['role']]);

        return response()->json([
            'message' => 'Member added successfully.',
            'data' => $userToAdd
        ], 201);
    }

    public function update(Request $request, Project $project, $userId)
    {
        if ($request->user()->cannot('manageMembers', $project)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'role' => 'required|in:admin,normal'
        ]);

        if ($project->creator_id == $userId && $validated['role'] !== 'admin') {
            return response()->json(['message' => 'Cannot change role of the project creator.'], 422);
        }

        $project->members()->updateExistingPivot($userId, ['role' => $validated['role']]);

        return response()->json(['message' => 'Member role updated successfully.']);
    }

    public function destroy(Request $request, Project $project, $userId)
    {
        if ($request->user()->cannot('manageMembers', $project)) {
            abort(403, 'Unauthorized');
        }

        if ($project->creator_id == $userId) {
            return response()->json(['message' => 'Cannot remove the project creator. Transfer ownership first.'], 422);
        }

        $project->members()->detach($userId);

        return response()->json(['message' => 'Member removed successfully.']);
    }
}
