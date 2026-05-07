<?php

namespace App\Http\Controllers;

use App\Mail\ProjectInvitationMail;
use App\Models\Project;
use App\Models\ProjectInvitation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;

class ProjectInvitationController extends Controller
{
    public function index(Request $request, Project $project)
    {
        if ($request->user()->cannot('manageInvitations', $project)) {
            abort(403, 'Unauthorized');
        }

        $invitations = ProjectInvitation::where('project_id', $project->id)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->with('inviter:id,name')
            ->get(['id', 'email', 'role', 'position', 'invited_by', 'expires_at', 'created_at']);

        return response()->json(['data' => $invitations]);
    }

    public function store(Request $request, Project $project)
    {
        if ($request->user()->cannot('manageInvitations', $project)) {
            abort(403, 'Unauthorized');
        }

        $validated = $request->validate([
            'email' => 'required|email',
            'role' => 'required|in:admin,normal',
            'position' => 'nullable|string|max:255',
        ]);

        $existing = ProjectInvitation::where('project_id', $project->id)
            ->where('email', $validated['email'])
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->first();

        if ($existing) {
            return response()->json([
                'message' => 'An invitation is already pending for this email.',
            ], 409);
        }

        $invitation = ProjectInvitation::create([
            'project_id' => $project->id,
            'email' => $validated['email'],
            'role' => $validated['role'],
            'position' => $validated['position'] ?? null,
            'token' => bin2hex(random_bytes(32)),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(7),
        ]);

        $invitation->load('inviter:id,name', 'project:id,name');

        Mail::to($invitation->email)->queue(new ProjectInvitationMail($invitation));

        return response()->json([
            'message' => 'Invitation sent successfully.',
            'data' => $invitation,
            'type' => 'invited',
        ]);
    }

    public function destroy(Request $request, Project $project, ProjectInvitation $invitation)
    {
        if ($request->user()->cannot('manageInvitations', $project)) {
            abort(403, 'Unauthorized');
        }

        if ($invitation->project_id !== $project->id) {
            abort(404);
        }

        if (! is_null($invitation->accepted_at)) {
            return response()->json(['message' => 'Cannot cancel an already accepted invitation.'], 422);
        }

        $invitation->delete();

        return response()->json(['message' => 'Invitation cancelled successfully.']);
    }
}
