"use client";

import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { TableHeader } from "./TableHeader";

type StoreData = {
  idempresaint: number;
  loja: string;
  hora: number;
  valor: number;
  tipo: string;
  grupo: string;
};

const bandeiras = [
  "Santo Remedio (AM)",
  "FARMABEM (AM)",
  "Atacarejo (AM)",
  "Flex Farma",
];
const ITEMS_PER_BANDEIRA = 8;

export function TableData() {
  const [data, setData] = useState<StoreData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<{
    [key: string]: StoreData[];
  }>({});
  const [viewByStore, setViewByStore] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/fetchData");
        if (!response.ok) {
          throw new Error("Erro ao buscar dados");
        }
        const result = await response.json();
        setData(
          result.madrugada.concat(result.manha, result.tarde, result.noite)
        ); // Combine todos os períodos
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    const dataByBandeira: { [key: string]: StoreData[] } = {};

    bandeiras.forEach((bandeira) => {
      dataByBandeira[bandeira] = data.filter((item) => item.grupo === bandeira);
    });

    setFilteredData(dataByBandeira);
  }, [data]);

  const calculateTotalByPeriod = (stores: StoreData[], period: string) => {
    const periodHours = getPeriodHours(period);
    return stores
      .filter((store) => periodHours.includes(store.hora))
      .reduce((total, store) => total + store.valor, 0);
  };

  const getPeriodHours = (period: string) => {
    switch (period) {
      case "madrugada":
        return Array.from({ length: 6 }, (_, i) => i); // 0 to 5
      case "manha":
        return Array.from({ length: 6 }, (_, i) => i + 6); // 6 to 11
      case "tarde":
        return Array.from({ length: 6 }, (_, i) => i + 12); // 12 to 17
      case "noite":
        return Array.from({ length: 6 }, (_, i) => i + 18); // 18 to 23
      default:
        return [];
    }
  };

  const toggleView = (bandeira: string) => {
    setViewByStore((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(bandeira)) {
        newSet.delete(bandeira);
      } else {
        newSet.add(bandeira);
      }
      return newSet;
    });
  };

  const getCurrentPeriod = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 6) return "madrugada";
    if (currentHour >= 6 && currentHour < 12) return "manha";
    if (currentHour >= 12 && currentHour < 18) return "tarde";
    return "noite";
  };

  const currentPeriod = getCurrentPeriod();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {bandeiras.map((bandeira) => {
        const stores = filteredData[bandeira] || [];
        const limitedStores = stores.slice(0, ITEMS_PER_BANDEIRA);
        const totals = {
          madrugada: calculateTotalByPeriod(stores, "madrugada"),
          manha: calculateTotalByPeriod(stores, "manha"),
          tarde: calculateTotalByPeriod(stores, "tarde"),
          noite: calculateTotalByPeriod(stores, "noite"),
        };

        return (
          <div key={bandeira} className="flex justify-between items-start mb-8">
            <table className="w-full">
              <TableHeader
                bandeira={bandeira}
                onBandeiraClick={() => toggleView(bandeira)}
                isExpanded={viewByStore.has(bandeira)}
                totals={totals}
                currentPeriod={currentPeriod}
              />
              <tbody className="transition-all duration-500">
                {viewByStore.has(bandeira) ? (
                  limitedStores.map((store) => (
                    <tr
                      key={store.idempresaint}
                      className="border-b border-gray-700 hover:bg-gray-900"
                    >
                      <td className="p-4 text-white border-r border-gray-700">
                        {store.loja}
                      </td>
                      {getPeriodHours(currentPeriod).map((hour) => (
                        <td
                          key={hour}
                          className="p-4 text-white border-r border-gray-700 text-center"
                        >
                          {new Intl.NumberFormat("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          }).format(store.hora === hour ? store.valor : 0)}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-3 mt-4 table-head"></td>
                    {["madrugada", "manha", "tarde", "noite"].map((period) => (
                      <td
                        key={period}
                        className="p-4 text-white border-r border-gray-700 text-center table-head"
                      >
                        {new Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(totals[period])}
                      </td>
                    ))}
                  </tr>
                )}
              </tbody>
            </table>
            <div className="ml-10 text-white text-xl">
              Valor total por bandeira
              <br />
              <span>{new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(totals[currentPeriod])}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
