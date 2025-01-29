"use client";

import { Sun, Sunrise, Sunset, Moon } from "lucide-react";
import Image from "next/image";
import { flexAtcLogo, fbLogo, santoLogo, flexLogo } from "@/assets";

export function TableHeader({
  bandeira,
  onBandeiraClick,
  isExpanded,
  totals,
  currentPeriod,
  onPeriodClick,
}: {
  bandeira: string;
  onBandeiraClick: () => void;
  isExpanded: boolean;
  totals: { [key: string]: number };
  currentPeriod: string;
  onPeriodClick: (period: string) => void;
}) {
  const getImageForBandeira = (bandeira: string) => {
    switch (bandeira) {
      case "Flex Farma":
        return flexLogo;
      case "Santo Remedio (AM)":
        return santoLogo;
      case "FARMABEM (AM)":
        return fbLogo;
      case "Atacarejo (AM)":
        return flexAtcLogo;
      default:
        return flexAtcLogo; // Default image if needed
    }
  };

  const selectedImage = getImageForBandeira(bandeira);

  const getPeriodHours = (period: string) => {
    switch (period) {
      case "madrugada":
        return [
          "00:00 - 00:59",
          "01:00 - 01:59",
          "02:00 - 02:59",
          "03:00 - 03:59",
          "04:00 - 04:59",
          "05:00 - 05:59",
        ];
      case "manha":
        return [
          "06:00 - 06:59",
          "07:00 - 07:59",
          "08:00 - 08:59",
          "09:00 - 09:59",
          "10:00 - 10:59",
          "11:00 - 11:59",
        ];
      case "tarde":
        return [
          "12:00 - 12:59",
          "13:00 - 13:59",
          "14:00 - 14:59",
          "15:00 - 15:59",
          "16:00 - 16:59",
          "17:00 - 17:59",
        ];
      case "noite":
        return [
          "18:00 - 18:59",
          "19:00 - 19:59",
          "20:00 - 20:59",
          "21:00 - 21:59",
          "22:00 - 22:59",
          "23:00 - 23:59",
        ];
      default: 
        return [];
    }
  };



  return (
    <thead className="w-full ">
      <tr className="bg-gray-900">
        <th
          className="p-2 text-white border-r border-gray-700 w-[120px] cursor-pointer hover:bg-gray-700 transition-colors duration-200"
          onClick={onBandeiraClick}
        >
          <div className="relative w-full h-[100px] overflow-hidden rounded-lg flex justify-center items-center">
            <Image
              src={selectedImage}
              alt={`Imagem para ${bandeira}`}
              sizes="120px"
              priority
            />
          </div>
        </th>
        <th colSpan={6} className=" text-white border-r border-gray-700">
          <div className="flex items-center justify-around w-full">
            {["Madrugada", "Manha", "Tarde", "Noite"].map((period) => (
              <div
                key={period}
                className={`flex flex-col items-center transition-opacity duration-300 ${
                  period.toLowerCase() === currentPeriod
                    ? "opacity-100"
                    : "opacity-50"
                } hover:opacity-100`}
                onClick={() => onPeriodClick(period.toLowerCase())}
              >
                {period === "Madrugada" && (
                  <Moon className="w-5 h-5 text-blue-300 mb-1" />
                )}
                {period === "Manha" && (
                  <Sunrise className="w-5 h-5 text-yellow-300 mb-1" />
                )}
                {period === "Tarde" && (
                  <Sun className="w-5 h-5 text-yellow-500 mb-1" />
                )}
                {period === "Noite" && (
                  <Sunset className="w-5 h-5 text-orange-500 mb-1" />
                )}
                <span className="text-xs">{period}</span>
              </div>
            ))}
          </div>
        </th>
      </tr>
    </thead>
  );
}
