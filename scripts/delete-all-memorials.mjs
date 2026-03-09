/**
 * Script per eliminare TUTTI i memoriali da Supabase.
 *
 * ⚠️  ATTENZIONE: questa operazione è IRREVERSIBILE.
 *     Elimina: foto dallo storage, commenti, candele, like e memoriali.
 *
 * Prerequisiti:
 *   1. Copia la Service Role Key dal pannello Supabase:
 *      Project Settings → API → service_role (secret)
 *   2. Incollala nella variabile SUPABASE_SERVICE_ROLE_KEY qui sotto,
 *      oppure impostala come variabile d'ambiente prima di eseguire lo script.
 *
 * Esecuzione:
 *   node scripts/delete-all-memorials.mjs
 */

import { createClient } from "@supabase/supabase-js";

// ─── Configurazione ───────────────────────────────────────────────────────────
const SUPABASE_URL = "https://fnyixkpyoujrvlaxxmkt.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? "INCOLLA_QUI_LA_SERVICE_ROLE_KEY";
// ─────────────────────────────────────────────────────────────────────────────

if (SUPABASE_SERVICE_ROLE_KEY === "INCOLLA_QUI_LA_SERVICE_ROLE_KEY") {
  console.error(
    "❌  Service Role Key mancante.\n" +
      "   Impostala in SUPABASE_SERVICE_ROLE_KEY o modificala direttamente nello script."
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────

function log(msg) {
  console.log(`[${new Date().toISOString()}] ${msg}`);
}

async function deleteTable(tableName) {
  log(`Eliminazione tabella "${tableName}"…`);
  const { error, count } = await supabase
    .from(tableName)
    .delete({ count: "exact" })
    .neq("id", "00000000-0000-0000-0000-000000000000"); // condizione always-true

  if (error) {
    throw new Error(`Errore su "${tableName}": ${error.message}`);
  }
  log(`  ✓ ${count ?? "?"} righe eliminate da "${tableName}".`);
}

async function deleteAllPhotos() {
  log('Recupero foto dal bucket "memorial-photos"…');

  const { data: files, error: listError } = await supabase.storage
    .from("memorial-photos")
    .list("", { limit: 1000 });

  if (listError) {
    throw new Error(`Errore nel listare lo storage: ${listError.message}`);
  }

  if (!files || files.length === 0) {
    log("  ✓ Nessuna foto trovata nello storage.");
    return;
  }

  const paths = files.map((f) => f.name);
  log(`  Trovate ${paths.length} foto. Eliminazione in corso…`);

  const { error: removeError } = await supabase.storage
    .from("memorial-photos")
    .remove(paths);

  if (removeError) {
    throw new Error(`Errore nell'eliminazione foto: ${removeError.message}`);
  }

  log(`  ✓ ${paths.length} foto eliminate dallo storage.`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=".repeat(55));
  console.log("  DELETE ALL MEMORIALS — Pethernity");
  console.log("=".repeat(55));

  try {
    // 1. Elimina le foto dallo storage
    await deleteAllPhotos();

    // 2. Elimina le tabelle figlie prima (FK constraints)
    await deleteTable("comments");
    await deleteTable("candles");
    await deleteTable("likes");

    // 3. Elimina i memoriali
    await deleteTable("memorials");

    console.log("\n✅  Tutti i memoriali e i dati correlati sono stati eliminati.\n");
  } catch (err) {
    console.error("\n❌  Errore:", err.message);
    process.exit(1);
  }
}

main();
