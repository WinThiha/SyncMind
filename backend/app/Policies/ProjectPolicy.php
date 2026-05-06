<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;

class ProjectPolicy
{
    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can view the model.
     */
    public function view(User $user, Project $project): bool
    {
        return $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return true;
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Project $project): bool
    {
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Project $project): bool
    {
        return $project->creator_id === $user->id;
    }

    /**
     * Determine whether the user can restore the model.
     */
    public function restore(User $user, Project $project): bool
    {
        return $project->creator_id === $user->id;
    }

    /**
     * Determine whether the user can permanently delete the model.
     */
    public function forceDelete(User $user, Project $project): bool
    {
        return $project->creator_id === $user->id;
    }

    /**
     * Determine whether the user can manage members of the model.
     */
    public function manageMembers(User $user, Project $project): bool
    {
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    /**
     * Determine whether the user can manage invitations for the project.
     */
    public function manageInvitations(User $user, Project $project): bool
    {
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }
}
