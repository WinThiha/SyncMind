<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class IssueHistory extends Model
{
    use HasFactory;

    protected $table = 'issue_histories';

    protected $fillable = [
        'issue_id',
        'user_id',
        'field',
        'old_value',
        'new_value',
    ];

    /**
     * Get the issue that owns the history entry.
     */
    public function issue(): BelongsTo
    {
        return $this->belongsTo(Issue::class);
    }

    /**
     * Get the user who made the change.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
