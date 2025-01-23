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

export const dynamic = 'force-static'
export async function GET(req: NextRequest) {
    let pool;
    try {
        pool = await sql.connect(config);

        const result = await pool.request().query(`
            select grupo, hora, sum(valor) as valor
            from (
                select * from (
                    select ge.descricao as grupo, 'e. Total' as hora, sum(v.ValTotVenda) as valor, 'V' as tipo
                    from vendas v
                    inner join empresas e on e.idempresa=v.idempresa
                    inner join grupoempresa ge on ge.idgrupoempresa=e.idgrupoempresa
                    where v.idempresaint < 5000 and dataemi = convert(date,getdate()) and datepart(hour,horaemi) <= datepart(hour,getdate())
                    and v.cancelado=0
                    group by ge.descricao, e.idempresaint, e.nomereduzido
                    union all
                    select ge.descricao, 'e. Total' as hora, sum(v.valor)*(-1) as valor, 'D' as tipo
                    from devolucoesvendas v
                    inner join empresas e on e.idempresa=v.idempresa
                    inner join grupoempresa ge on ge.idgrupoempresa=e.idgrupoempresa
                    where e.idempresaint < 5000 and dataemi = convert(date,getdate()) and datepart(hour,horaemi) <= datepart(hour,getdate())
                    and v.cancelado=0
                    group by ge.descricao, e.idempresaint, e.nomereduzido
                ) tab1
                union all
                select * from (
                    select ge.descricao as grupo,
                        case
                            when datepart(hour, horaemi) between 0 and 5 then 'a. Madrugada' 
                            when datepart(hour, horaemi) between 6 and 11 then 'b. Manha'
                            when datepart(hour, horaemi) between 12 and 17 then 'c. Tarde'
                            when datepart(hour, horaemi) between 18 and 23 then 'd. Noite'
                        end as hora,
                        sum(v.ValTotVenda) as valor, 'V' as tipo
                    from vendas v
                    inner join empresas e on e.idempresa=v.idempresa
                    inner join grupoempresa ge on ge.idgrupoempresa=e.idgrupoempresa
                    where v.idempresaint < 5000 and dataemi = convert(date,getdate())
                    and datepart(hour,horaemi) <= datepart(hour,getdate()) and v.cancelado=0
                    group by ge.descricao,
                        case
                            when datepart(hour, horaemi) between 0 and 5 then 'a. Madrugada' 
                            when datepart(hour, horaemi) between 6 and 11 then 'b. Manha'
                            when datepart(hour, horaemi) between 12 and 17 then 'c. Tarde'
                            when datepart(hour, horaemi) between 18 and 23 then 'd. Noite'
                        end
                    union all
                    select
                        ge.descricao,
                        case
                            when datepart(hour, horaemi) between 0 and 5 then 'a. Madrugada' 
                            when datepart(hour, horaemi) between 6 and 11 then 'b. Manha'
                            when datepart(hour, horaemi) between 12 and 17 then 'c. Tarde'
                            when datepart(hour, horaemi) between 18 and 23 then 'd. Noite'
                        end as hora,
                        sum(v.valor)*(-1) as valor, 'D' as tipo
                    from devolucoesvendas v
                    inner join empresas e on e.idempresa=v.idempresa
                    inner join grupoempresa ge on ge.idgrupoempresa=e.idgrupoempresa
                    where e.idempresaint < 5000 and dataemi = convert(date,getdate())
                    and datepart(hour,horaemi) <= datepart(hour,getdate()) and v.cancelado=0
                    group by ge.descricao,
                        case
                            when datepart(hour, horaemi) between 0 and 5 then 'a. Madrugada'
                            when datepart(hour, horaemi) between 6 and 11 then 'b. Manha'
                            when datepart(hour, horaemi) between 12 and 17 then 'c. Tarde'
                            when datepart(hour, horaemi) between 18 and 23 then 'd. Noite'
                        end
                ) tab2
            ) tab group by grupo, hora order by grupo, hora
        `);

        const rows = result.recordset;

        return NextResponse.json(rows);
    } catch (err) {
        console.error('Erro ao buscar dados:', err);
        return NextResponse.json({ error: 'Erro ao buscar dados' }, { status: 500 });
    } finally {
        if (pool) {
            await pool.close();
        }
    }
} 