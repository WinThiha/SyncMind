<?php

namespace App\Policies;

use App\Models\Milestone;
use App\Models\Project;
use App\Models\User;

class MilestonePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, Milestone $milestone): bool
    {
        return $milestone->project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Project $project): bool
    {
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    public function update(User $user, Milestone $milestone): bool
    {
        $project = $milestone->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    public function delete(User $user, Milestone $milestone): bool
    {
        $project = $milestone->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }
}
