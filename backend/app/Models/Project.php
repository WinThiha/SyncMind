<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'key',
        'icon',
        'issue_types',
        'categories',
        'milestones',
        'versions',
        'creator_id',
    ];

    protected $casts = [
        'issue_types' => 'array',
        'categories' => 'array',
        'milestones' => 'array',
        'versions' => 'array',
    ];

    public function getRouteKeyName()
    {
        return 'id';
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'creator_id');
    }

    public function members()
    {
        return $this->belongsToMany(User::class, 'project_members')
                    ->withPivot('role')
                    ->withTimestamps();
    }

    public function issues()
    {
        return $this->hasMany(Issue::class);
    }
}
