<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('issues', function (Blueprint $row) {
            $row->decimal('estimated_hours', 8, 2)->nullable()->after('priority');
            $row->decimal('actual_hours', 8, 2)->nullable()->after('estimated_hours');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('issues', function (Blueprint $row) {
            $row->dropColumn(['estimated_hours', 'actual_hours']);
        });
    }
};
