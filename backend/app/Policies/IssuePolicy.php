<?php

namespace App\Policies;

use App\Models\Issue;
use App\Models\Project;
use App\Models\User;

class IssuePolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user, Project $project): bool
    {
        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Issue $issue): bool
    {
        return $issue->project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user, Project $project): bool
    {
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Issue $issue): bool
    {
        $project = $issue->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        // Admin or project creator can always update
        if ($member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id)) {
            return true;
        }

        // Assigned user can also update (even if they are a normal member)
        return $issue->assignee_id === $user->id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Issue $issue): bool
    {
        $project = $issue->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Issue $issue): bool
    {
        $project = $issue->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Issue $issue): bool
    {
        $project = $issue->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    /**
     * Determine whether the user can add a comment to the issue.
     */
    public function addComment(User $user, Issue $issue): bool
    {
        return $issue->project->members()->where('user_id', $user->id)->exists();
    }
}
