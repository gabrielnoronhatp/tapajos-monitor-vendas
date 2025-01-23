// app/api/fetchData/route.ts

import { NextRequest, NextResponse } from 'next/server';
import sql from 'mssql';
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


export const dynamic = 'force-static'
export async function GET(req: NextRequest) {
    try {
        const filePath = path.join('/mnt', 'realtime-app-database', 'sales_db.json');
        
        if (!fs.existsSync(filePath)) {
            throw new Error('Arquivo JSON não encontrado');
        }

        const fileContent = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(fileContent);

        return NextResponse.json(data);
    } catch (err) {
        console.error('Erro ao ler o arquivo JSON:', err);
        return NextResponse.json({ error: 'Erro ao ler o arquivo JSON' }, { status: 500 });
    }
}