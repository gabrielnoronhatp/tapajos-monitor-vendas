import fs from 'fs';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';    
const chokidar = require('chokidar');

function calcularSoma(array: any[], tipo: string): string {
    const soma = array.reduce((acc, item) => {
        return item.tipo === tipo ? acc + parseFloat(item.valor) : acc;
    }, 0);
    return soma.toFixed(2).replace('.', ',');
}

let cachedData: any = null;
const filePath = path.join('/mnt', 'realtime-app-database', 'sales_db', 'db_sales_by_hour.json');

const watcher = chokidar.watch(filePath);
watcher.on('change', () => {
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        cachedData = JSON.parse(fileContent);
        console.log('Arquivo atualizado, cache recarregado.');
    } catch (err) {
        console.error('Erro ao atualizar o cache:', err);
    }
});

// Endpoint para leitura
export async function GET(req: NextRequest) {
    try {
        if (!cachedData) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            cachedData = JSON.parse(fileContent);
        }
      

        const madrugada = cachedData.filter((item: any) => item.hora >= 0 && item.hora < 6);
        const manha = cachedData.filter((item: any) => item.hora >= 6 && item.hora < 12);
        const tarde = cachedData.filter((item: any) => item.hora >= 12 && item.hora < 18);
        const noite = cachedData.filter((item: any) => item.hora >= 18 && item.hora <= 23);

        const parseNumber = (value: string) => {
            if (!value) return 0;
            return parseFloat(value.replace(',', '.')); // Substitui vírgula por ponto para conversão correta
        };
        
        const valor_total_venda = cachedData.filter((item:any) => item.valor_total_venda)
        const valor_total_dev = cachedData.filter((item:any) => item.valor_total_dev)
          
        

        const resultData = {
            madrugada,
            manha,
            tarde,
            noite,
            valor_total_venda,
            valor_total_dev,
        };

        const response = NextResponse.json(resultData);
        response.headers.set('Cache-Control', 'no-store');
        return response;
    } catch (err) {
        console.error('Erro ao processar a requisição:', err);
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
    }
}