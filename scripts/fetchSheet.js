// scripts/fetchSheet.js

import fs from "fs";
import fetch from "node-fetch";

const SPREADSHEET_ID = "TU_SPREADSHEET_ID_AQUI"; 
const RANGE = "Sheet1!A1:O500";
const API_KEY = process.env.GOOGLE_API_KEY;

async function main() {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(
    RANGE
  )}?key=${API_KEY}`;

  console.log("Fetching Google Sheet…");

  const res = await fetch(url);
  const data = await res.json();

  if (!data.values) {
    console.error("❌ ERROR leyendo la hoja", data);
    process.exit(1);
  }

  const rows = data.values;
  const headers = rows[0];
  const items = rows.slice(1);

  const json = items.map((row) => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i] || "";
    });
    return obj;
  });

  const outputPath = "./public/data/capabilities.json";

  fs.mkdirSync("./public/data", { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(json, null, 2));

  console.log("✅ capabilities.json generado en:", outputPath);
}

main();
