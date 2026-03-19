<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $company = Company::query()->firstOrCreate(
            ['name' => 'LavaSys Demo'],
            [
                'email' => 'contato@lavasys.com',
                'status' => 'active',
                'license_type' => 'annual',
                'license_expiry_date' => now()->addYear()->toDateString(),
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'admin@lavasys.com'],
            [
                'company_id' => $company->id,
                'name' => 'Administrador',
                'password' => 'admin123',
                'role' => 'admin',
                'platform_role' => 'client_admin',
                'status' => 'active',
            ]
        );

        User::query()->updateOrCreate(
            ['email' => 'superadmin@genomn.local'],
            [
                'company_id' => $company->id,
                'name' => 'Super Admin GenOmn',
                'password' => 'superadmin123',
                'role' => 'admin',
                'platform_role' => 'super_admin',
                'status' => 'active',
            ]
        );
    }
}
