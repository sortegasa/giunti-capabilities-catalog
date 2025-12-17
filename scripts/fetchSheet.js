// scripts/fetchSheet.js

import fs from "fs";
import fetch from "node-fetch";

const SPREADSHEET_ID = "1fH6yU4VynGkNG4f3IWu5CU_FCFvJNuF2SfNFkdD0mu0";
const RANGE = "Sheet1!A1:O500";
const API_KEY = process.env.GOOGLE_API_KEY;

/**
 * Normaliza valores de plataforma:
 * SI → "yes"
 * NO → "no"
 * ? → "unknown"
 */
function normalizePlatformValue(value) {
  if (!value) return "unknown"; // por si viene vacío

  const val = value.toString().trim().toUpperCase();

  if (val === "SI") return "yes";
  if (val === "NO") return "no";
  if (val === "?" || val === "NS") return "unknown";

  return "unknown"; // fallback
}

/**
 * Normaliza el estado textual
 */
function normalizeStatus(s) {
  if (!s) return "unknown";
  s = s.toLowerCase();
  if (s.includes("confirmada")) return "confirmed";
  if (s.includes("deducida")) return "deduced";
  if (s.includes("pendiente")) return "pending";
  return s;
}

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

  const output = items.map((row) => {
    const o = {};
    headers.forEach((h, i) => (o[h] = row[i] || ""));

    return {
      id: o["ID"],
      category: o["Categoría"],
      subcategory: o["Subcategoría"],
      title: o["Título"],
      description: o["Descripción"],
      tags: o["Tags"]
        ? o["Tags"].split(",").map((t) => t.trim())
        : [],
      platforms: {
        GT: normalizePlatformValue(o["Testing"]),
        VOL: normalizePlatformValue(o["VOL"])
      },
      status: normalizeStatus(o["Estado"]),
      notes: o["Notas"] || null
    };
  });

  fs.mkdirSync("./public/data", { recursive: true });

  fs.writeFileSync(
    "./public/data/capabilities.json",
    JSON.stringify(output, null, 2)
  );

  console.log("✅ JSON normalizado generado");
}

main();
