'use client';

import { useEffect, useState } from 'react';

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
  const [valorTotalVenda, setValorTotalVenda] = useState<number | null>(null);
  const [valorTotalDev, setValorTotalDev] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/fetchData');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const result = await response.json();
     
        setData(result);
        setValorTotalVenda(result.valor_total_venda ?? null);
        setValorTotalDev(result.valor_total_dev ?? null);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const interval = setInterval(fetchData, 10000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);


  useEffect(() => {
    const statsTimer = setInterval(() => {
      setStats({
        sales: Math.floor(Math.random() * 1000),
        returns: Math.floor(Math.random() * 1000),
      });
    }, 1000);

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
      {time
        ? time.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })
        : 'Loading...'}
    </div>

    {/* Stats */}
    <div className="flex gap-12">
      {/* Sales */}
      <div className="text-center">
        <div className="text-white text-lg md:text-1xl font-semibold">Vendas</div>
        <div className="text-white text-2xl md:text-3xl font-bold">
          {valorTotalVenda !== null && valorTotalVenda !== undefined
            ? valorTotalVenda.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : 'Loading...'}
        </div>
      </div>

      {/* Returns */}
      <div className="text-center">
        <div className="text-white text-lg md:text-1xl font-semibold">Devoluções</div>
        <div className="text-white text-2xl md:text-3xl font-bold whitespace-nowrap">
          {valorTotalDev !== null && valorTotalDev !== undefined
            ? valorTotalDev.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              })
            : 'Loading...'}
        </div>
      </div>
    </div>
  </div>
</nav>
  );
}