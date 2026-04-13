<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProjectIssueCounter extends Model
{
    use HasFactory;

    protected $primaryKey = 'project_id';
    public $incrementing = false;

    protected $fillable = [
        'project_id',
        'last_number',
    ];

    /**
     * Get the project that owns the counter.
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}
