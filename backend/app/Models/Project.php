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
        'versions',
        'creator_id',
    ];

    protected $casts = [
        'issue_types' => 'array',
        'categories' => 'array',
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
            ->withPivot('role', 'position')
            ->withTimestamps();
    }

    public function issues()
    {
        return $this->hasMany(Issue::class);
    }

    public function milestones()
    {
        return $this->hasMany(Milestone::class);
    }

    public function wikiPages()
    {
        return $this->hasMany(WikiPage::class);
    }
}
