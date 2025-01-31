"use client";

import { useEffect, useState } from "react";

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
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [valorTotalVenda, setValorTotalVenda] = useState<number | null>(null);
  const [valorTotalDev, setValorTotalDev] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/fetchData");
        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }
        const result = await response.json();

        setData(result);
        setValorTotalVenda(parseFloat(result.valor_total_venda) ?? null);
        setValorTotalDev(parseFloat(result.valor_total_dev) ?? null);
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

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    };

    checkMobile(); 

    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <nav className="w-full bg-[#32959a] p-3">
      <div
        className={`max-w-5xl mx-auto flex ${
          isMobile ? "flex-col" : "flex-row"
        } items-center justify-between gap-3 `}
      >
        {/* Date */}
        <div className="text-white text-lg font-semibold">
          Manaus, {formattedDate}
            {/* Time */}
            <div className="text-white text-3xl md:text-4xl font-bold text-center justify-center items-center flex">
            {time
              ? time.toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })
              : "00:00:00"}
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col md:flex-row gap-4 md:gap-10">
          {/* Sales */}
          <div className="text-center">
            <div className="text-white text-lg md:text-xl font-semibold">
              Vendas
            </div>
            <div
              className="text-white text-4xl md:text-5xl font-bold"
              style={{ fontSize: isMobile ? "32px" : "50px" }}
            >
              {valorTotalVenda !== null && valorTotalVenda !== undefined
                ? valorTotalVenda.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "R$ 12000000"}
            </div>
          </div>

          {/* Returns */}
          <div className="text-center">
            <div className="text-white text-lg md:text-xl font-semibold">
              Devoluções
            </div>
            <div
              className="text-white text-3xl mt-2 font-bold whitespace-nowrap"
              style={{ fontSize: isMobile ? "32px" : "45px" }}
            >
              {valorTotalDev !== null && valorTotalDev !== undefined
                ? valorTotalDev.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })
                : "Loading... "}
            </div>
          </div>
        
        </div>
      </div>
    </nav>
  );
}
