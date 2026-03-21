<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE empresas MODIFY logo LONGTEXT NULL');
        DB::statement('ALTER TABLE empresas MODIFY landing_banner_image LONGTEXT NULL');
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();
        if ($driver === 'sqlite') {
            return;
        }

        DB::statement('ALTER TABLE empresas MODIFY logo TEXT NULL');
        DB::statement('ALTER TABLE empresas MODIFY landing_banner_image TEXT NULL');
    }
};
