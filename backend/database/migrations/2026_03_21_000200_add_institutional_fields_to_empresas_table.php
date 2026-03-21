<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->text('about_story')->nullable()->after('landing_banner_image');
            $table->text('about_mission')->nullable()->after('about_story');
            $table->text('about_vision')->nullable()->after('about_mission');
            $table->json('about_team_json')->nullable()->after('about_vision');
        });
    }

    public function down(): void
    {
        Schema::table('empresas', function (Blueprint $table) {
            $table->dropColumn(['about_story', 'about_mission', 'about_vision', 'about_team_json']);
        });
    }
};
