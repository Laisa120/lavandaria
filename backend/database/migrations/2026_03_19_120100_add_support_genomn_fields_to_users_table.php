<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (! Schema::hasColumn('users', 'company_id')) {
                $table->foreignId('company_id')->nullable()->after('id')->constrained('companies')->nullOnDelete();
            }

            if (! Schema::hasColumn('users', 'platform_role')) {
                $table->enum('platform_role', ['super_admin', 'support', 'client_admin', 'user'])->nullable()->after('role');
            }

            if (! Schema::hasColumn('users', 'is_blocked')) {
                $table->boolean('is_blocked')->default(false)->after('status');
            }

            if (! Schema::hasColumn('users', 'blocked_at')) {
                $table->timestamp('blocked_at')->nullable()->after('is_blocked');
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (Schema::hasColumn('users', 'company_id')) {
                $table->dropConstrainedForeignId('company_id');
            }
            if (Schema::hasColumn('users', 'platform_role')) {
                $table->dropColumn('platform_role');
            }
            if (Schema::hasColumn('users', 'is_blocked')) {
                $table->dropColumn('is_blocked');
            }
            if (Schema::hasColumn('users', 'blocked_at')) {
                $table->dropColumn('blocked_at');
            }
        });
    }
};
