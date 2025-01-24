import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function calcularSoma(array: any[], tipo: string): string {
    const soma = array.reduce((acc, item) => {
        return item.tipo === tipo ? acc + parseFloat(item.valor) : acc;
    }, 0);
    return soma.toFixed(2).replace('.', ',');
}

export async function GET(req: NextRequest) {
    try {
        // Caminho absoluto para o arquivo JSON
        const filePath = path.join('/mnt', 'realtime-app-database', 'sales_db', 'db_sales_by_period.json');

        // Lê o conteúdo do arquivo de forma síncrona
        const fileContent = fs.readFileSync(filePath, 'utf8');

        // Converte o conteúdo para um objeto JSON
        const rows = JSON.parse(fileContent);

        // Organizar dados por período
      

        // Retorna os dados organizados
        const response = NextResponse.json(rows);
        response.headers.set('Cache-Control', 'no-store'); // Desabilita cache para garantir atualizações

        return response;
        
    } catch (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        return NextResponse.json({ error: 'Erro ao ler o arquivo JSON' }, { status: 500 });
    }
}
