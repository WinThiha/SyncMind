<?php

namespace App\Observers;

use App\Models\User;

class UserObserver
{
    /**
     * Handle the User "updated" event.
     */
    public function updated(User $user): void
    {
        if ($user->wasChanged('email')) {
            // Delete all associated social accounts if email changes (Unlinking Logic FR-010)
            $user->socialAccounts()->delete();
        }
    }
}
