// Client-side PDF text extraction via pdf.js. Browser-only.
import * as pdfjsLib from "pdfjs-dist";
// Vite worker import — bundled properly for the browser build.
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?worker";

let workerInstalled = false;
function ensureWorker() {
  if (workerInstalled) return;
  (pdfjsLib.GlobalWorkerOptions as { workerPort?: Worker }).workerPort = new PdfWorker();
  workerInstalled = true;
}

export const PDF_MAX_PAGES = 15;
// Generous outer cap — Tier 1 uses ≤45k, Tier 2 map-reduce handles the rest.
export const PDF_MAX_CHARS = 300000;

export type PdfExtractResult = {
  text: string;
  pages: string[];
  pagesRead: number;
  totalPages: number;
  truncated: boolean;
};

/**
 * Tier 0 — strip repeated running headers/footers and standalone page counters.
 * Any line that appears verbatim (ignoring trailing page numbers) on more than
 * ~60% of pages is treated as boilerplate and removed. In addition, any
 * standalone line that is only a "Page X of Y" counter is removed regardless
 * of frequency.
 */
export function cleanBoilerplate(pages: string[]): string {
  const isPageCounter = (s: string) =>
    /^\s*page\s+\d+\s*(of\s*\d+)?\s*$/i.test(s.trim());

  if (pages.length < 3) {
    return pages
      .map((p) => p.split("\n").filter((l) => !isPageCounter(l)).join("\n"))
      .join("\n\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  const norm = (s: string) =>
    s.trim().replace(/\s+/g, " ").replace(/\s*\d{1,4}(\s*\/\s*\d{1,4})?\s*$/, "").toLowerCase();
  const freq = new Map<string, number>();
  const perPageLines = pages.map((p) =>
    p.split(/\n/).map((l) => l.trim()).filter(Boolean),
  );
  for (const lines of perPageLines) {
    const seen = new Set<string>();
    for (const l of lines) {
      const k = norm(l);
      if (!k || k.length < 4) continue;
      if (seen.has(k)) continue;
      seen.add(k);
      freq.set(k, (freq.get(k) ?? 0) + 1);
    }
  }
  const threshold = Math.max(3, Math.ceil(pages.length * 0.6));
  const boiler = new Set<string>();
  for (const [k, n] of freq) if (n >= threshold) boiler.add(k);

  const cleanedPages = perPageLines.map((lines) =>
    lines.filter((l) => !boiler.has(norm(l)) && !isPageCounter(l)).join("\n"),
  );
  return cleanedPages.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

export async function extractPdfText(
  file: File,
  onProgress?: (pct: number) => void,
): Promise<PdfExtractResult> {
  ensureWorker();
  const buf = await file.arrayBuffer();
  const doc = await pdfjsLib.getDocument({ data: buf }).promise;
  const totalPages = doc.numPages;
  const pagesToRead = Math.min(totalPages, PDF_MAX_PAGES);
  const pages: string[] = [];

  for (let i = 1; i <= pagesToRead; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    // Preserve line structure: pdf.js emits `hasEOL` on text items at visual
    // line breaks. Joining everything with spaces (the previous behaviour)
    // collapsed each page into a single line, which defeated the Tier 0
    // header/footer dedup below — so the textarea and the AI both saw the
    // noisy repeated boilerplate. Rebuilding lines here fixes both at once.
    let line = "";
    const lines: string[] = [];
    for (const it of content.items) {
      const item = it as { str?: string; hasEOL?: boolean };
      const s = item.str ?? "";
      if (s) line += (line && !line.endsWith(" ") ? " " : "") + s;
      if (item.hasEOL) {
        const trimmed = line.replace(/\s{2,}/g, " ").trim();
        if (trimmed) lines.push(trimmed);
        line = "";
      }
    }
    const tail = line.replace(/\s{2,}/g, " ").trim();
    if (tail) lines.push(tail);
    pages.push(lines.join("\n"));
    onProgress?.(Math.round((i / pagesToRead) * 100));
  }


  let text = cleanBoilerplate(pages).replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
  let truncated = false;
  if (text.length > PDF_MAX_CHARS) {
    text = text.slice(0, PDF_MAX_CHARS);
    truncated = true;
  }
  return { text, pages, pagesRead: pagesToRead, totalPages, truncated };
}
