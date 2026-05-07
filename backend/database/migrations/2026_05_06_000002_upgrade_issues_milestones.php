<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add new columns to issues
        Schema::table('issues', function (Blueprint $table) {
            $table->date('due_date')->nullable()->after('milestone');
            $table->foreignId('milestone_id')->nullable()->after('due_date')
                ->constrained('milestones')->nullOnDelete();
        });

        // Migrate data: project milestones JSON → milestones table → issue FK
        $projects = DB::table('projects')->whereNotNull('milestones')->get();

        foreach ($projects as $project) {
            $milestoneNames = json_decode($project->milestones, true) ?? [];

            foreach ($milestoneNames as $name) {
                if (empty(trim($name))) {
                    continue;
                }

                $milestoneId = DB::table('milestones')->insertGetId([
                    'project_id' => $project->id,
                    'name' => $name,
                    'status' => 'open',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                DB::table('issues')
                    ->where('project_id', $project->id)
                    ->where('milestone', $name)
                    ->update(['milestone_id' => $milestoneId]);
            }
        }

        // Drop old string columns
        Schema::table('issues', function (Blueprint $table) {
            $table->dropColumn('milestone');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('milestones');
        });
    }

    public function down(): void
    {
        // Restore old string columns
        Schema::table('issues', function (Blueprint $table) {
            $table->string('milestone')->nullable()->after('category');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->json('milestones')->nullable();
        });

        // Restore string data from FK relationships
        $milestones = DB::table('milestones')->get()->keyBy('id');

        DB::table('issues')->whereNotNull('milestone_id')->each(function ($issue) use ($milestones) {
            $milestone = $milestones->get($issue->milestone_id);
            if ($milestone) {
                DB::table('issues')
                    ->where('id', $issue->id)
                    ->update(['milestone' => $milestone->name]);
            }
        });

        // Restore projects.milestones JSON
        $projectMilestones = DB::table('milestones')
            ->select('project_id', DB::raw('json_agg(name ORDER BY id) as names'))
            ->groupBy('project_id')
            ->get();

        foreach ($projectMilestones as $row) {
            DB::table('projects')
                ->where('id', $row->project_id)
                ->update(['milestones' => $row->names]);
        }

        Schema::table('issues', function (Blueprint $table) {
            $table->dropForeign(['milestone_id']);
            $table->dropColumn(['milestone_id', 'due_date']);
        });

        Schema::dropIfExists('milestones');
    }
};
