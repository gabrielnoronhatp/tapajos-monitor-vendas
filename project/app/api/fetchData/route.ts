import fs from "fs";
import path from "path";
import { NextRequest, NextResponse } from "next/server";
const chokidar = require("chokidar");

let cachedData: any = null;
const filePath = path.join(
  "/mnt",
  "realtime-app-database",
  "sales_db",
  "db_sales_by_hour.json"
);

const watcher = chokidar.watch(filePath);


watcher.on("change", () => {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    cachedData = JSON.parse(fileContent);
    console.log("Arquivo atualizado, cache recarregado.");
  } catch (err) {
    console.error("Erro ao atualizar o cache:", err);
  }
});



export async function GET(req: NextRequest) {
  try {
  
    const fileContent = fs.readFileSync(filePath, "utf8");
    cachedData = JSON.parse(fileContent);

    const madrugada = cachedData.filter(
      (item: any) => item.hora >= 0 && item.hora < 6
    );
    const manha = cachedData.filter(
      (item: any) => item.hora >= 6 && item.hora < 12
    );
    const tarde = cachedData.filter(
      (item: any) => item.hora >= 12 && item.hora < 18
    );
    const noite = cachedData.filter(
      (item: any) => item.hora >= 18 && item.hora <= 23
    );

    const valor_total_venda = cachedData[0]?.valor_total_venda || "0";
    const valor_total_dev = cachedData[0]?.valor_total_dev || "0";

    const resultData = {
      madrugada,
      manha,
      tarde,
      noite,
      valor_total_venda,
      valor_total_dev,
    };

    const response = NextResponse.json(resultData);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (err) {
    console.error("Erro ao processar a requisição:", err);
    const response = NextResponse.json({ error: "Erro interno" }, { status: 500 });
    response.headers.set("X-Refresh-Page", "true");
    return response;
  }
}
