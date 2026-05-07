<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Milestone extends Model
{
    use HasFactory;

    protected $fillable = [
        'project_id',
        'name',
        'description',
        'start_date',
        'due_date',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'due_date' => 'date:Y-m-d',
    ];

    protected $appends = ['progress', 'is_overdue'];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function issues(): HasMany
    {
        return $this->hasMany(Issue::class);
    }

    public function getProgressAttribute(): array
    {
        $total = $this->issues()->count();
        $completed = $this->issues()->whereIn('status', ['resolved', 'closed'])->count();
        $percentage = $total > 0 ? (int) round(($completed / $total) * 100) : 0;

        return [
            'total' => $total,
            'completed' => $completed,
            'percentage' => $percentage,
        ];
    }

    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date !== null
            && $this->due_date->isPast()
            && $this->status !== 'closed';
    }
}
