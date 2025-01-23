// app/api/fetchData/route.ts

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

function calcularSoma(array: any[], tipo: string): string {
    const soma = array.reduce((acc, item) => {
        return item.tipo === tipo ? acc + item.valor : acc;
    }, 0);
    return soma.toFixed(2).replace('.', ',');
}

export const dynamic = 'force-static'
export async function GET(req: NextRequest) {
    let pool;
    try {
        pool = await sql.connect(config);

        const result = await pool.request().query(`
         select
	ge.descricao as grupo,
    e.idempresaint,
    e.nomereduzido as loja,
    datepart(hour, horaemi) as hora,
    sum(v.ValTotVenda) as valor,
    'V' as tipo
    from vendas v
    inner join empresas e on e.idempresa=v.idempresa
    inner join grupoempresa ge on ge.idgrupoempresa=e.idgrupoempresa
    where v.idempresaint < 5000
    and dataemi = convert(date,getdate())
    and datepart(hour,horaemi) <= datepart(hour,getdate())
    and v.cancelado=0
    group by
    ge.descricao,
    e.idempresaint,
    e.nomereduzido,
    datepart(hour, horaemi)
    union all
    select
    ge.descricao,
    e.idempresaint,
    e.nomereduzido as loja,
    datepart(hour, horaemi) as hora,
    sum(v.valor)*(-1) as valor,
    'D' as tipo
    from devolucoesvendas v
    inner join empresas e on e.idempresa=v.idempresa
    inner join grupoempresa ge on ge.idgrupoempresa=e.idgrupoempresa
    where e.idempresaint < 5000
    and dataemi = convert(date,getdate())
    and datepart(hour,horaemi) <= datepart(hour,getdate())
    and v.cancelado=0
    group by
    ge.descricao,
    e.idempresaint,
    e.nomereduzido,
    datepart(hour, horaemi)
        `);

        const rows = result.recordset;

        // Organizar dados por período
        const madrugada = rows.filter(item => item.hora >= 0 && item.hora < 6);
        const manha = rows.filter(item => item.hora >= 6 && item.hora < 12);
        const tarde = rows.filter(item => item.hora >= 12 && item.hora < 18);
        const noite = rows.filter(item => item.hora >= 18 && item.hora <= 23);

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
        console.error('Erro ao buscar dados:', err);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
}