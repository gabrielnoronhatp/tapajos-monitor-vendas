// app/api/fetchDataByBandeira/route.ts

import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const config:any = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        enableArithAbort: process.env.DB_ENABLE_ARITH_ABORT === 'true',
    }
};


const bandeiraMapping: { [key: string]: string } = {
    'Santo Remedio (AM)': 'santo remedio',
    'FARMABEM (AM)': 'farmabem',
    'Flex Farma': 'flexfarma',
    'Atacarejo (AM)': 'atacarejo',
};

function calcularSoma(array: any[], tipo: string): string {
    const soma = array.reduce((acc, item) => {
        return item.tipo === tipo ? acc + item.valor : acc;
    }, 0);
    return soma.toFixed(2).replace('.', ',');
}

function extractBandeira(loja: string): string | null {
    const match = loja.match(/-(\w+)/);
    return match ? match[1] : null;
}

export const dynamic = 'force-static'
export async function GET(req: NextRequest) {
    try {
        // Define o caminho do arquivo JSON
        const filePath = path.join('/mnt', 'realtime-app-database', 'sales_db', 'db_sales_by_hour.json');
        
        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            throw new Error('Arquivo JSON não encontrado');
        }

        // Lê o conteúdo do arquivo
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        // Retorna o conteúdo do arquivo JSON
        return NextResponse.json(data);
    } catch (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        return NextResponse.json({ error: 'Erro ao ler o arquivo JSON' }, { status: 500 });
    }
} 