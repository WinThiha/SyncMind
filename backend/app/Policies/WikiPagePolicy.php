<?php

namespace App\Policies;

use App\Models\Project;
use App\Models\User;
use App\Models\WikiPage;

class WikiPagePolicy
{
    public function viewAny(User $user, Project $project): bool
    {
        return $project->members()->where('user_id', $user->id)->exists();
    }

    public function view(User $user, WikiPage $wikiPage): bool
    {
        return $wikiPage->project->members()->where('user_id', $user->id)->exists();
    }

    public function create(User $user, Project $project): bool
    {
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    public function update(User $user, WikiPage $wikiPage): bool
    {
        $project = $wikiPage->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }

    public function delete(User $user, WikiPage $wikiPage): bool
    {
        $project = $wikiPage->project;
        $member = $project->members()->where('user_id', $user->id)->first();

        return $member && ($member->pivot->role === 'admin' || $project->creator_id === $user->id);
    }
}
