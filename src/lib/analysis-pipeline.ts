/**
 * Tiered analysis pipeline for large regulatory documents.
 * Tier 1: single call when cleaned text ≤ TIER1_MAX chars.
 * Tier 2: map-reduce chunk summaries → single reduce call.
 * Tier 3: cheap keyword relevance pre-filter for very large docs.
 * Falls back to caller-supplied mock if the whole live path fails.
 */
import type { AnalyzeReportResult } from "./analyze-report.functions";

export const TIER1_MAX = 45000;
export const CHUNK_SIZE = 8000;
export const TIER3_TRIGGER = 100000;
export const TIER3_TOP_CHUNKS = 8;
export const TIER2_TOTAL_BUDGET_MS = 25000;
export const TIER2_PER_CHUNK_TIMEOUT_MS = 12000;
export const TIER1_TIMEOUT_MS = 15000;
export const CONCURRENCY = 3;

export type Lang = "en" | "pl";
export type PipelineProgress = {
  phase: "single" | "map" | "reduce";
  done: number;
  total: number;
};

export type PipelineResult = {
  result: AnalyzeReportResult;
  usedChunks?: number;
  totalChunks?: number;
};

export type AnalyzeCall = (args: {
  data: { text: string; industry: string; lang: Lang };
}) => Promise<AnalyzeReportResult>;

export type SummarizeCall = (args: {
  data: { text: string; industry: string; lang: Lang };
}) => Promise<{ bullets: string }>;

function withTimeout<T>(p: Promise<T>, ms: number, tag = "timeout"): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = window.setTimeout(() => reject(new Error(tag)), ms);
    p.then((v) => {
      window.clearTimeout(t);
      resolve(v);
    }).catch((e) => {
      window.clearTimeout(t);
      reject(e);
    });
  });
}

/** Chunk text at paragraph boundaries when possible, never mid-sentence. */
export function chunkText(text: string, size = CHUNK_SIZE): string[] {
  if (text.length <= size) return [text];
  const chunks: string[] = [];
  const paras = text.split(/\n{2,}/);
  let cur = "";
  for (const p of paras) {
    if ((cur + "\n\n" + p).length <= size) {
      cur = cur ? cur + "\n\n" + p : p;
      continue;
    }
    if (cur) chunks.push(cur);
    if (p.length <= size) {
      cur = p;
    } else {
      // Split oversized paragraph at sentence boundaries.
      const sentences = p.split(/(?<=[.!?])\s+/);
      let buf = "";
      for (const s of sentences) {
        if ((buf + " " + s).length <= size) {
          buf = buf ? buf + " " + s : s;
        } else {
          if (buf) chunks.push(buf);
          buf = s.length <= size ? s : s.slice(0, size);
        }
      }
      cur = buf;
    }
  }
  if (cur) chunks.push(cur);
  return chunks;
}

const ESG_KEYWORDS = [
  "emission",
  "carbon",
  "co2",
  "co₂",
  "ghg",
  "scope",
  "energy",
  "water",
  "pollution",
  "biodiversity",
  "waste",
  "circular",
  "supply chain",
  "workforce",
  "human rights",
  "diversity",
  "governance",
  "board",
  "audit",
  "materiality",
  "esrs",
  "csrd",
  "taxonomy",
  "disclosure",
  "target",
  "risk",
  "emisje",
  "energia",
  "woda",
  "odpady",
  "łańcuch",
  "istotność",
  "ładu",
  "ujawnienia",
  "różnorodność",
];

const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  manufacturing: ["supply chain", "energy intensity", "scope 3", "supplier", "raw material", "łańcuch", "produkcja", "dostawc"],
  retail: ["product", "consumer", "supplier code", "packaging", "produkt", "opakow"],
  services: ["workforce", "training", "travel", "gender pay", "pracown", "szkolen"],
  tech: ["cloud", "data center", "compute", "ai ", "renewable", "chmur", "obliczen"],
};

function scoreChunk(chunk: string, industryKey: string): number {
  const lower = chunk.toLowerCase();
  let score = 0;
  for (const kw of ESG_KEYWORDS) {
    if (lower.includes(kw)) score += 1;
  }
  const indKws = INDUSTRY_KEYWORDS[industryKey] ?? [];
  for (const kw of indKws) {
    if (lower.includes(kw)) score += 3;
  }
  // Penalise likely ToC / boilerplate.
  if (/\btable of contents\b|spis treści/i.test(chunk)) score -= 10;
  if (/\bappendix\b|załącznik/i.test(chunk)) score -= 2;
  return score;
}

async function runWithConcurrency<T, R>(
  items: T[],
  worker: (item: T, index: number) => Promise<R>,
  concurrency: number,
  shouldStop: () => boolean,
): Promise<Array<R | null>> {
  const out: Array<R | null> = new Array(items.length).fill(null);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      if (shouldStop()) return;
      const idx = cursor++;
      try {
        out[idx] = await worker(items[idx], idx);
      } catch {
        out[idx] = null;
      }
    }
  });
  await Promise.all(runners);
  return out;
}

export async function runTieredAnalysis(args: {
  text: string;
  industryKey: string;
  industryLabel: string;
  lang: Lang;
  analyze: AnalyzeCall;
  summarize: SummarizeCall;
  onProgress?: (p: PipelineProgress) => void;
}): Promise<PipelineResult> {
  const { text, industryKey, industryLabel, lang, analyze, summarize, onProgress } = args;

  // Tier 1: single call.
  if (text.length <= TIER1_MAX) {
    onProgress?.({ phase: "single", done: 0, total: 1 });
    const result = await withTimeout(
      analyze({ data: { text, industry: industryLabel, lang } }),
      TIER1_TIMEOUT_MS,
      "tier1-timeout",
    );
    onProgress?.({ phase: "single", done: 1, total: 1 });
    return { result };
  }

  // Tier 2 (+ optional Tier 3 pre-filter).
  let chunks = chunkText(text);
  const totalChunks = chunks.length;

  if (text.length > TIER3_TRIGGER && chunks.length > TIER3_TOP_CHUNKS) {
    const scored = chunks
      .map((c, i) => ({ i, c, s: scoreChunk(c, industryKey) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, TIER3_TOP_CHUNKS)
      .sort((a, b) => a.i - b.i)
      .map((x) => x.c);
    chunks = scored;
  }

  const startedAt = performance.now();
  const shouldStop = () => performance.now() - startedAt > TIER2_TOTAL_BUDGET_MS;
  let completed = 0;
  onProgress?.({ phase: "map", done: 0, total: chunks.length });

  const summaries = await runWithConcurrency(
    chunks,
    async (chunk) => {
      const { bullets } = await withTimeout(
        summarize({ data: { text: chunk, industry: industryLabel, lang } }),
        TIER2_PER_CHUNK_TIMEOUT_MS,
        "chunk-timeout",
      );
      completed++;
      onProgress?.({ phase: "map", done: completed, total: chunks.length });
      return bullets;
    },
    CONCURRENCY,
    shouldStop,
  );

  const usable = summaries.filter((s): s is string => !!s && s.trim().length > 0);
  if (usable.length === 0) throw new Error("no-usable-chunks");

  const reduceText = usable
    .map((s, i) => `Section ${i + 1}:\n${s}`)
    .join("\n\n")
    .slice(0, TIER1_MAX);

  onProgress?.({ phase: "reduce", done: 0, total: 1 });
  const result = await withTimeout(
    analyze({ data: { text: reduceText, industry: industryLabel, lang } }),
    TIER1_TIMEOUT_MS,
    "reduce-timeout",
  );
  onProgress?.({ phase: "reduce", done: 1, total: 1 });

  return { result, usedChunks: usable.length, totalChunks };
}
