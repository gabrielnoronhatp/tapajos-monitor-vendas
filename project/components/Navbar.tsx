'use client';

import { set } from 'date-fns';
import { useEffect, useState } from 'react';

type Stats = {
  sales: number;
  returns: number;
};

export function Navbar() {
  const [time, setTime] = useState(new Date());
  const [stats, setStats] = useState<Stats>({
    sales: 0,
    returns: 0,
  });

  const [currentPage, setCurrentPage] = useState(0);
 
  

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [vendaTotal, setVendaTotal] = useState<number | null>(null);
  const [devolucoes, setDevolucoes] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/fetchData');
        if (!response.ok) {
          throw new Error('Erro ao buscar dados');
        }
        const result = await response.json();
        console.log('result',result)
        setData(result);
        setVendaTotal(result.venda_total)
        setDevolucoes(result.devolucao_total)
      } catch (err:any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
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
        sales: Math.floor(Math.random() * 10000),
        returns: Math.floor(Math.random() * 1000),
      });
    }, 5000);

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
          {time.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </div>

        {/* Stats */}
        <div className="flex gap-12">
          {/* Sales */}
          <div className="text-center">
            <div className="text-white text-lg font-semibold">Vendas</div>
            <div className="text-white text-xl font-bold">
            {vendaTotal}
            </div>
          </div>

          {/* Returns */}
          <div className="text-center">
            <div className="text-white text-lg font-semibold">Devoluções</div>
            <div className="text-white text-xl font-bold">
               {devolucoes}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}