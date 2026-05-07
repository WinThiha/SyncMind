<?php

namespace App\Http\Controllers;

use App\Models\ProjectInvitation;
use Illuminate\Http\Request;

class ProjectInvitationAcceptController extends Controller
{
    public function show(string $token)
    {
        $invitation = ProjectInvitation::where('token', $token)
            ->with('project:id,name', 'inviter:id,name')
            ->first();

        if (! $invitation) {
            abort(404, 'Invitation not found.');
        }

        if (! $invitation->isPending()) {
            return response()->json([
                'message' => 'This invitation has expired or has already been accepted.',
            ], 410);
        }

        return response()->json([
            'data' => [
                'project_id' => $invitation->project_id,
                'project_name' => $invitation->project->name,
                'role' => $invitation->role,
                'position' => $invitation->position,
                'inviter_name' => $invitation->inviter?->name,
                'expires_at' => $invitation->expires_at,
            ],
        ]);
    }

    public function accept(Request $request, string $token)
    {
        $invitation = ProjectInvitation::where('token', $token)->first();

        if (! $invitation) {
            abort(404, 'Invitation not found.');
        }

        if (! $invitation->isPending()) {
            return response()->json([
                'message' => 'This invitation has expired or has already been accepted.',
            ], 410);
        }

        $user = $request->user();
        $project = $invitation->project;

        if ($project->members()->where('user_id', $user->id)->exists()) {
            $invitation->update(['accepted_at' => now()]);

            return response()->json([
                'message' => 'You are already a member of this project.',
                'project_id' => $project->id,
            ]);
        }

        $project->members()->attach($user->id, [
            'role' => $invitation->role,
            'position' => $invitation->position,
        ]);
        $invitation->update(['accepted_at' => now()]);

        return response()->json([
            'message' => 'You have successfully joined the project.',
            'project_id' => $project->id,
        ]);
    }
}
