"use client";

import { useEffect, useState } from "react";
import "@/styles/globals.css";
import { TableHeader } from "./TableHeader";
import Image from "next/image";
import { flexAtcLogo, flexLogo, santoLogo } from "@/assets";
import { fbLogo } from "@/assets";

type StoreData = {
  idempresaint: number;
  loja: string;
  hora: number;
  valor: number;
  tipo: string;
  grupo: string;
};

type BandeiraData = {
  grupo: string;
  hora: string;
  valor: number;
};

const bandeiras = [
  "Santo Remedio (AM)",
  "FARMABEM (AM)",
  "Atacarejo (AM)",
  "Flex Farma",
];
const ITEMS_PER_BANDEIRA = 8;

export function TableData() {
  const [data, setData] = useState<any[]>([]);
  const [bandeiraData, setBandeiraData] = useState<BandeiraData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filteredData, setFilteredData] = useState<{
    [key: string]: StoreData[];
  }>({});
  const [viewByStore, setViewByStore] = useState<Set<string>>(new Set());
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch("/api/fetchData", {
          method: "GET",
          headers: {
            "Cache-Control": "no-store",
          },
        });

        const result = await response.json();

        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    const intervalId = setInterval(fetchData, 12000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    async function fetchDataByBandeira() {
      try {
        const response = await fetch("/api/fetchDataByBandeira", {
          method: "GET",
          headers: {
            "Cache-Control": "no-store",
          },
        });
        if (!response.ok) {
          throw new Error("Erro ao buscar dados por bandeira");
        }
        const result = await response.json();

        setBandeiraData(result);
      } catch (err) {
        console.error(err);
      }
    }

    fetchDataByBandeira();
    const intervalId = setInterval(fetchDataByBandeira, 12000); // 12 seconds

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const dataByBandeira: { [key: string]: StoreData[] } = {};

    const periods = ["madrugada", "manha", "tarde", "noite"];

    periods.forEach((period: any) => {
      const periodData = data[period] || [];

      periodData.forEach((item: StoreData) => {
        const bandeira = item.grupo;

        if (!dataByBandeira[bandeira]) {
          dataByBandeira[bandeira] = [];
        }

        dataByBandeira[bandeira].push(item);
      });
    });

    setFilteredData(dataByBandeira);
  }, [data]);

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768); // Define como "mobile" se a largura for menor ou igual a 768px
    };

    handleResize(); // Executa ao montar o componente
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const calculateTotalByPeriod = (stores: StoreData[], period: string) => {
    const periodHours = getPeriodHours(period);
    return stores
      .filter((store) => periodHours.includes(store.hora))
      .reduce((total, store) => total + store.valor, 0);
  };

  const getPeriodHours = (period: string) => {
    switch (period) {
      case "madrugada":
        return Array.from({ length: 6 }, (_, i) => i);
      case "manha":
        return Array.from({ length: 6 }, (_, i) => i + 6);
      case "tarde":
        return Array.from({ length: 6 }, (_, i) => i + 12);
      case "noite":
        return Array.from({ length: 6 }, (_, i) => i + 18);
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
    if (currentHour >= 18 && currentHour < 24) return "noite";
    return "noite";
  };

  const handlePeriodClick = (period: string) => {
    setSelectedPeriod(period);
  };

  const currentPeriod = selectedPeriod || getCurrentPeriod();

  const formatCurrency = (value: string) => {
    const numberValue = parseFloat(value);
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(numberValue);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {bandeiras.map((bandeira) => {
        const stores = filteredData[bandeira] || [];
        const totals = {
          madrugada: calculateTotalByPeriod(stores, "madrugada"),
          manha: calculateTotalByPeriod(stores, "manha"),
          tarde: calculateTotalByPeriod(stores, "tarde"),
          noite: calculateTotalByPeriod(stores, "noite"),
        };

        const bandeiraTotals = bandeiraData.filter(
          (item) => item.grupo === bandeira
        );

        const totalPorBandeira = bandeiraTotals
          .filter((item: any) => item.hora === "e. Total")
          .reduce((acc: any, item: any) => acc + parseFloat(item.valor), 0);

        const bandeiraImageMap: { [key: string]: any } = {
          "FARMABEM (AM)": fbLogo,
          "Atacarejo (AM)": flexAtcLogo,
          "Flex Farma": flexLogo,
          "Santo Remedio (AM)": santoLogo,
        };

        const getImageForBandeira = (bandeira: string) => {
          const imageName = bandeiraImageMap[bandeira];
          if (!imageName) {
            console.warn(`Imagem não encontrada para a bandeira: ${bandeira}`);
            return "../assets/default-logo.png";
          }
          return imageName;
        };

        if (isMobile) {
          return (
            <div key={bandeira} className="mb-4 text-center">
              {/* center image  */}
              <div className="flex justify-center items-center ">
                <Image
                  src={getImageForBandeira(bandeira)}
                  width={200}
                  height={200}
                  alt={`Imagem para ${bandeira}`}
                />
              </div>
              <div className="text-white font-bold">{bandeira}</div>
              <div className="text-2xl text-gray-200 font-bold">
                Total: {formatCurrency(totalPorBandeira.toString())}
              </div>
            </div>
          );
        }
        return (
          <div key={bandeira} className="flex justify-between items-start mb-8">
            <table className="w-full">
              <TableHeader
                bandeira={bandeira}
                onBandeiraClick={() => toggleView(bandeira)}
                isExpanded={viewByStore.has(bandeira)}
                totals={totals}
                currentPeriod={currentPeriod}
                onPeriodClick={handlePeriodClick}
              />
              {viewByStore.has(bandeira) ? (
                <>
                  <thead>
                    <tr>
                      <th className="p-4 text-white border-r border-gray-700">
                        Loja
                      </th>
                      {getPeriodHours(currentPeriod).map((hour, index) => (
                        <th
                          key={hour}
                          className="p-4 text-white border-r border-gray-700 text-center"
                        >
                          {`${hour}:00 - ${hour}:59`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="transition-all duration-500">
                    {Array.from(
                      new Map(
                        stores.map((store) => [store.idempresaint, store.loja])
                      ).values()
                    )
                      .slice(0, 10)
                      .map((loja) => {
                        const storeEntries = stores.filter(
                          (store) => store.loja === loja
                        );

                        const currentPeriodHours =
                          getPeriodHours(currentPeriod);

                        return (
                          <tr
                            key={storeEntries[0].idempresaint}
                            className="border-b border-gray-700 hover:bg-gray-900"
                          >
                            <td className="p-4 text-white border-r border-gray-700">
                              {loja}
                            </td>
                            {currentPeriodHours.map((hourRange) => {
                              const store = storeEntries.find(
                                (s) => s.hora === hourRange
                              );
                              const value = store ? store.valor : 0;

                              return (
                                <td
                                  key={`${loja}-${hourRange}`}
                                  className="p-4 text-white border-r border-gray-700 text-center"
                                >
                                  {value}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                  </tbody>
                </>
              ) : (
                <tr>
                  <td className="p-3 mt-4 table-head"></td>
                  {["a. Madrugada", "b. Manha", "c. Tarde", "d. Noite"].map(
                    (period) => {
                      const periodTotal =
                        bandeiraTotals.find((item) => item.hora === period)
                          ?.valor || 0;
                      return (
                        <td
                          key={period}
                          className="p-2 text-white border-r border-gray-700 text-center  font-bold  table-head   text-2xl"
                          style={{ paddingRight: "3%", borderRight: "none" }}
                        >
                          
                          {formatCurrency(periodTotal.toString())}
                        </td>
                      );
                    }
                  )}
                </tr>
              )}
            </table>

            <div
              className="ml-5 text-white text-xl "
              style={{ marginTop: "8%" }}
            >
              Total :
              <br />
              <span>{formatCurrency(totalPorBandeira.toString())}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
