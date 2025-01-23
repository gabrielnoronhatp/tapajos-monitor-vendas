'use client';

import { useEffect, useState } from 'react';
export const dynamic = 'force-static'
type Stats = {
  sales: number;
  returns: number;
};

export function Navbar() {
  const [time, setTime] = useState<Date | null>(null);
  const [stats, setStats] = useState<Stats>({
    sales: 0,
    returns: 0,
  });

  const [currentPage, setCurrentPage] = useState(0);
 
  

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendaTotal, setVendaTotal] = useState(null);
  const [devolucoes, setDevolucoes] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/fetchData');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const result = await response.json();
        console.log('result', result);
        setData(result);
        setVendaTotal(result.venda_total);
        setDevolucoes(result.devolucao_total);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Simulating real-time stats updates
  useEffect(() => {
    const statsTimer = setInterval(() => {
      setStats({
        sales: Math.floor(Math.random() * 1000),
        returns: Math.floor(Math.random() * 1000),
      });
    }, 30000);

    return () => clearInterval(statsTimer);
  }, []);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <nav className="w-full bg-[#32959a] p-4">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-4">
        {/* Date */}
        <div className="text-white text-lg font-semibold">
          Manaus, {formattedDate}
        </div>

        {/* Time */}
        <div className="text-white text-4xl font-bold">
          {time ? time.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }) : 'Loading...'}
        </div>

        {/* Stats */}
        <div className="flex gap-12">
          {/* Sales */}
          <div className="text-center">
            <div className="text-white text-1xl font-semibold">Vendas</div>
            
            <div className="text-white text-3xl font-bold">
              {vendaTotal !== null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(vendaTotal)) : 'Loading...'}
            </div>
          </div>

          {/* Returns */}
          <div className="text-center">
            <div className="text-white text-1xl font-semibold">Devoluções</div>
            <div className="text-white text-3xl font-bold">
              {devolucoes !== null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(devolucoes)) : 'Loading...'}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}