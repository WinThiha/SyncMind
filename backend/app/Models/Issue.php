<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Issue extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'project_id',
        'key_number',
        'summary',
        'description',
        'status',
        'priority',
        'issue_type',
        'estimated_hours',
        'actual_hours',
        'assignee_id',
        'creator_id',
        'category',
        'milestone_id',
        'due_date',
        'version',
        'embedding',
    ];

    protected $casts = [
        'estimated_hours' => 'float',
        'actual_hours'    => 'float',
        'due_date'        => 'date:Y-m-d',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function milestone(): BelongsTo
    {
        return $this->belongsTo(Milestone::class);
    }

    /**
     * Get the user that created the issue.
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    /**
     * Get the user assigned to the issue.
     */
    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    /**
     * Get the comments for the issue.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    /**
     * Get the history for the issue.
     */
    public function history(): HasMany
    {
        return $this->hasMany(IssueHistory::class);
    }

    /**
     * Get the full issue key (e.g., PROJ-1).
     */
    public function getFullKeyAttribute(): string
    {
        return ($this->project->key ?? 'UNK') . '-' . $this->key_number;
    }
}
