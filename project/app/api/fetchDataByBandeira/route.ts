// app/api/fetchDataByBandeira/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';

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

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const bandeira = searchParams.get('bandeira');

    if (!bandeira) {
        return NextResponse.json({ error: 'Bandeira is required' }, { status: 400 });
    }

    let pool;
    try {
        pool = await sql.connect(config);
        console.log('Connected to the database');

        const result = await pool.request().query(`
            SELECT e.idempresaint, e.nomereduzido AS loja, DATEPART(hour, horaemi) AS hora, SUM(v.ValTotVenda) AS valor, 'V' AS tipo
            FROM vendas v
            INNER JOIN empresas e ON e.idempresa = v.idempresa
            WHERE v.idempresaint < 5000
            AND dataemi = CONVERT(date, GETDATE())
            AND DATEPART(hour, horaemi) <= DATEPART(hour, GETDATE())
            AND v.cancelado = 0
            GROUP BY e.idempresaint, e.nomereduzido, DATEPART(hour, horaemi)
            UNION ALL
            SELECT e.idempresaint, e.nomereduzido AS loja, DATEPART(hour, horaemi) AS hora, SUM(v.valor) * (-1) AS valor, 'D' AS tipo
            FROM devolucoesvendas v
            INNER JOIN empresas e ON e.idempresa = v.idempresa
            WHERE e.idempresaint < 5000
            AND dataemi = CONVERT(date, GETDATE())
            AND DATEPART(hour, horaemi) <= DATEPART(hour, GETDATE())
            AND v.cancelado = 0
            GROUP BY e.idempresaint, e.nomereduzido, DATEPART(hour, horaemi)
        `);

        console.log('Query executed successfully');

        const rows = result.recordset;
        console.log('Fetched rows:', rows);

        // Filter rows based on extracted bandeira
        const filteredRows = rows.filter(item => {
            const extractedBandeira = extractBandeira(item.loja);
            console.log(`Loja: ${item.loja}, Extracted Bandeira: ${extractedBandeira}`);
            return extractedBandeira && bandeiraMapping[extractedBandeira] === bandeira;
        });

        console.log('Filtered rows:', filteredRows);

        const madrugada = filteredRows.filter(item => item.hora >= 0 && item.hora < 5);
        const manha = filteredRows.filter(item => item.hora >= 5 && item.hora < 13);
        const tarde = filteredRows.filter(item => item.hora >= 13 && item.hora < 18);
        const noite = filteredRows.filter(item => item.hora >= 18 && item.hora <= 23);

        const venda_total = calcularSoma(filteredRows, 'V');
        const devolucao_total = calcularSoma(filteredRows, 'D');

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
        console.error('Erro ao buscar dados:', err);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    } finally {
        if (pool) {
            await pool.close();
            console.log('Database connection closed');
        }
    }
} 