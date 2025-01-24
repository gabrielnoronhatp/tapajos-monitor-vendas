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
        
        
        const filePath = path.join('/mnt', 'realtime-app-database', 'sales_db', 'db_sales_by_hour.json');
        
        // Verifica se o arquivo existe
        if (!fs.existsSync(filePath)) {
            throw new Error('Arquivo JSON não encontrado');
        }

        // Lê o conteúdo do arquivo
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const rows = JSON.parse(fileContent);

        // Organizar dados por período
        const madrugada = rows.filter((item: any) => item.hora >= 0 && item.hora < 6);
        const manha = rows.filter((item: any) => item.hora >= 6 && item.hora < 12);
        const tarde = rows.filter((item: any) => item.hora >= 12 && item.hora < 18);
        const noite = rows.filter((item: any) => item.hora >= 18 && item.hora <= 23);

        const venda_total = calcularSoma(rows, 'V');
        const devolucao_total = calcularSoma(rows, 'D');

        const resultData = {
            madrugada,
            manha,
            tarde,
            noite,
            venda_total,
            devolucao_total,
        };

        return NextResponse.json(resultData);
    } catch (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        return NextResponse.json({ error: 'Erro ao ler o arquivo JSON' }, { status: 500 });
    }
}