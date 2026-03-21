<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Empresa extends Model
{
    use HasFactory;

    protected $fillable = [
        'logo',
        'landing_banner_image',
        'about_story',
        'about_mission',
        'about_vision',
        'about_team_json',
        'nome',
        'nome_comercial',
        'nif',
        'tipo_empresa',
        'pais',
        'provincia',
        'municipio',
        'endereco_completo',
        'codigo_postal',
        'telefone',
        'email',
        'website',
        'regime_iva',
        'taxa_iva_padrao',
        'moeda',
        'serie_fatura',
        'numero_inicial_fatura',
        'taxa_retencao',
        'banco',
        'numero_conta',
        'iban',
        'modelo_fatura',
        'formato_numero_fatura',
        'permitir_venda_credito',
        'dias_vencimento_padrao',
        'permitir_desconto_global',
        'nome_impressora',
        'tipo_conexao_impressora',
        'ip_impressora',
        'impressao_automatica',
        'download_pdf_automatico',
    ];

    protected $casts = [
        'taxa_iva_padrao' => 'float',
        'taxa_retencao' => 'float',
        'permitir_venda_credito' => 'boolean',
        'permitir_desconto_global' => 'boolean',
        'impressao_automatica' => 'boolean',
        'download_pdf_automatico' => 'boolean',
        'about_team_json' => 'array',
    ];
}
