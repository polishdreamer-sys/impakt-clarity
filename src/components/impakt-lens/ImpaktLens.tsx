import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { analyzeReport, summarizeChunk, type AnalyzeReportResult } from "@/lib/analyze-report.functions";
import { runTieredAnalysis, type PipelineProgress } from "@/lib/analysis-pipeline";
import {
  Leaf,
  Sparkles,
  Loader2,
  ArrowRight,
  Languages,
  FileText,
  Search,
  Github,
  Download,
  ShieldAlert,
  Gauge,
  UploadCloud,
  X,
  CheckCircle2,
  Zap,
} from "lucide-react";
import {
  t,
  generateMockResponse,
  hasKnownTerm,
  SUGGESTED_CHIPS,
  COMPLEXITY_SCORE,
  type Lang,
  type Industry,
  type Level,
  type MockResponse,
} from "./translations";


type Mode = "analyze" | "search";

type Query = { mode: Mode; input: string; industry: Industry; uploadedFilename: string | null };

function renderInline(text: string) {
  // Convert **bold** to <strong>
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      );
    }
    return <span key={i}>{p}</span>;
  });
}

function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-2 text-[15px] leading-relaxed text-muted-foreground">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        // numbered list "1. ..."
        const num = line.match(/^(\d+)\.\s+(.*)$/);
        if (num) {
          return (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {num[1]}
              </span>
              <p>{renderInline(num[2])}</p>
            </div>
          );
        }
        if (line.startsWith("• ")) {
          return (
            <div key={i} className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <p>{renderInline(line.slice(2))}</p>
            </div>
          );
        }
        return <p key={i}>{renderInline(line)}</p>;
      })}
    </div>
  );
}

/* --------- Radial complexity gauge --------- */
function ComplexityGauge({ value, label, sublabel }: { value: number; label: string; sublabel: string }) {
  const size = 132;
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 800;
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - p, 3);
      setAnimated(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <defs>
            <linearGradient id="gauge-grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="var(--primary)" />
              <stop offset="100%" stopColor="var(--primary-glow)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="url(#gauge-grad)"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke-dashoffset 200ms linear" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold tabular-nums text-foreground">
            {Math.round(animated)}
            <span className="text-sm text-muted-foreground">%</span>
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {sublabel}
          </span>
        </div>
      </div>
      <div className="mt-2 text-xs font-semibold text-foreground">{label}</div>
    </div>
  );
}

/* --------- Risk badge --------- */
function RiskBadge({ risk, label, levelText }: { risk: Level; label: string; levelText: string }) {
  const tone =
    risk === "high"
      ? "from-primary/15 to-primary/5 text-primary ring-primary/30"
      : risk === "medium"
        ? "from-[color:var(--warning)]/25 to-[color:var(--warning)]/10 text-foreground ring-[color:var(--warning)]/40"
        : "from-[color:var(--success)]/20 to-[color:var(--success)]/5 text-foreground ring-[color:var(--success)]/40";
  const dot =
    risk === "high" ? "var(--primary)" : risk === "medium" ? "var(--warning)" : "var(--success)";
  return (
    <div className={`flex flex-col items-start gap-2 rounded-xl bg-gradient-to-br p-4 ring-1 ${tone}`}>
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: dot }} />
        <span className="text-lg font-semibold tracking-tight text-foreground">{levelText}</span>
      </div>
    </div>
  );
}

/* --------- Strip markdown for PDF plain text --------- */
function stripMd(md: string) {
  return md.replace(/\*\*(.+?)\*\*/g, "$1");
}

function downloadPdfBriefing(_args: {
  lang: Lang;
  response: MockResponse;
  industryLabel: string;
  L: typeof t.en | typeof t.pl;
}) {
  window.print();
}




export function ImpaktLens() {
  const [lang, setLang] = useState<Lang>("en");
  const [mode, setMode] = useState<Mode>("analyze");
  const [industry, setIndustry] = useState<Industry>("manufacturing");
  const [textInput, setTextInput] = useState("");
  const [termInput, setTermInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<Query | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveResult, setLiveResult] = useState<AnalyzeReportResult | null>(null);
  const [source, setSource] = useState<"live" | "mock" | null>(null);
  const [analysisFailed, setAnalysisFailed] = useState<string | null>(null);
  const [pipelineProgress, setPipelineProgress] = useState<PipelineProgress | null>(null);
  const [partialInfo, setPartialInfo] = useState<{ used: number; total: number } | null>(null);
  const runAnalyze = useServerFn(analyzeReport);
  const runSummarize = useServerFn(summarizeChunk);
  const reqIdRef = useRef(0);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadDone, setUploadDone] = useState(false);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  // Inline notice for scanned PDFs / image uploads (no fake extraction).
  const [pdfNotice, setPdfNotice] = useState<string | null>(null);
  const [pdfTruncated, setPdfTruncated] = useState(false);

  // Interactive Next-Steps checklist state.
  // Reset on genuinely new analyses (query change), NOT on language toggle —
  // a lang toggle re-fetches the same content translated, so checked indices
  // should carry over by position.
  const [checked, setChecked] = useState<Set<number>>(new Set());
  useEffect(() => {
    setChecked(new Set());
  }, [query]);

  // Re-fetch live AI result when language toggles so definition/risk/steps
  // match the UI language. Mock results already retranslate reactively.
  const langRef = useRef(lang);
  useEffect(() => {
    const prevLang = langRef.current;
    langRef.current = lang;
    if (prevLang === lang) return;
    if (source !== "live" || !query) return;
    const rid = ++reqIdRef.current;
    setLoading(true);
    setPipelineProgress(null);
    runTieredAnalysis({
      text: query.input,
      industryKey: query.industry,
      industryLabel: t[lang].industries[query.industry],
      lang,
      analyze: runAnalyze,
      summarize: runSummarize,
      onProgress: (p) => {
        if (rid === reqIdRef.current) setPipelineProgress(p);
      },
    })
      .then(({ result, usedChunks, totalChunks }) => {
        if (rid !== reqIdRef.current) return;
        setLiveResult(result);
        if (usedChunks != null && totalChunks != null && usedChunks < totalChunks) {
          setPartialInfo({ used: usedChunks, total: totalChunks });
        } else {
          setPartialInfo(null);
        }
      })
      .catch(() => {
        // Keep previous-language live result rather than fall back to mock.
      })
      .finally(() => {
        if (rid === reqIdRef.current) {
          setLoading(false);
          setPipelineProgress(null);
        }
      });
  }, [lang, source, query, runAnalyze, runSummarize]);



  const handleFile = async (file: File) => {
    setUploadedFile({ name: file.name, size: file.size });
    setUploadProgress(0);
    setUploadDone(false);
    setPdfNotice(null);
    setPdfTruncated(false);

    const isPdf = file.type === "application/pdf" || /\.pdf$/i.test(file.name);
    const isImage = file.type.startsWith("image/") || /\.(png|jpe?g|webp|gif)$/i.test(file.name);

    if (isImage) {
      // Honest handling: no OCR in this build.
      setUploadBusy(false);
      setUploadDone(true);
      setUploadProgress(100);
      setPdfNotice(t[lang].imageNoOcr);
      setTextInput("");
      return;
    }

    if (!isPdf) {
      setUploadBusy(false);
      setUploadDone(true);
      setUploadProgress(100);
      setPdfNotice(t[lang].imageNoOcr);
      return;
    }

    setUploadBusy(true);
    try {
      const { extractPdfText } = await import("@/lib/pdf-extract");
      const result = await extractPdfText(file, (pct) => setUploadProgress(pct));
      if (result.text.length < 200) {
        setTextInput("");
        setPdfNotice(t[lang].pdfScannedNoText);
      } else {
        setTextInput(result.text);
        setPdfTruncated(result.truncated);
      }
      setUploadProgress(100);
      setUploadDone(true);
    } catch {
      setPdfNotice(t[lang].pdfScannedNoText);
      setUploadDone(true);
      setUploadProgress(100);
    } finally {
      setUploadBusy(false);
    }
  };

  const clearUpload = () => {
    setUploadedFile(null);
    setUploadProgress(0);
    setUploadDone(false);
    setUploadBusy(false);
    setPdfNotice(null);
    setPdfTruncated(false);
  };


  const L = t[lang];

  const currentInput = mode === "analyze" ? textInput : termInput;

  const handleSubmit = async () => {
    if (!currentInput.trim()) {
      setError(L.requiredInput);
      return;
    }
    setError(null);
    setLoading(true);
    setQuery(null);
    setLiveResult(null);
    setSource(null);
    setAnalysisFailed(null);
    setPartialInfo(null);
    setPipelineProgress(null);

    const rid = ++reqIdRef.current;
    const nextQuery: Query = {
      mode,
      input: currentInput,
      industry,
      uploadedFilename: mode === "analyze" ? uploadedFile?.name ?? null : null,
    };

    // Primary path: tiered live AI pipeline (single-call → map-reduce with
    // optional relevance pre-filter). Falls back to mock only when the input
    // clearly matches a known scenario — otherwise shows an honest message
    // rather than guessing a wrong topic.
    try {
      const { result, usedChunks, totalChunks } = await runTieredAnalysis({
        text: currentInput,
        industryKey: industry,
        industryLabel: L.industries[industry],
        lang,
        analyze: runAnalyze,
        summarize: runSummarize,
        onProgress: (p) => {
          if (rid === reqIdRef.current) setPipelineProgress(p);
        },
      });
      if (rid !== reqIdRef.current) return;
      setLiveResult(result);
      setSource("live");
      if (usedChunks != null && totalChunks != null && usedChunks < totalChunks) {
        setPartialInfo({ used: usedChunks, total: totalChunks });
      }
    } catch {
      if (rid !== reqIdRef.current) return;
      if (mode === "search" || hasKnownTerm(currentInput)) {
        setSource("mock");
      } else {
        setAnalysisFailed(L.honestFail);
      }
    } finally {
      if (rid === reqIdRef.current) {
        setQuery(nextQuery);
        setLoading(false);
        setPipelineProgress(null);
      }
    }
  };


  // Reactive: response is re-derived whenever language, query, or industry changes,
  // so toggling PL/EN instantly re-translates the visible briefing.
  const response = useMemo(() => {
    if (!query) return null;
    const base = generateMockResponse({ lang, mode: query.mode, input: query.input, industry: query.industry });
    if (source === "live" && liveResult) {
      return {
        ...base,
        tldr: liveResult.tldr || base.tldr,
        definition: liveResult.definition,
        impact: liveResult.risk,
        steps: liveResult.steps
          .map((s, i) => `${i + 1}. ${s.replace(/^\s*\d+\.\s*/, "")}`)
          .join("\n"),
      };
    }

    return base;
  }, [lang, query, liveResult, source]);

  const sectionCards = useMemo(() => {
    if (!response) return [];
    return [
      { key: "definition", title: L.sections.definition, body: response.definition, icon: Sparkles, tone: "primary" as const },
      { key: "impact", title: L.sections.impact, body: response.impact, icon: Search, tone: "warning" as const },
      { key: "steps", title: L.sections.steps, body: response.steps, icon: ArrowRight, tone: "success" as const },
    ];
  }, [response, L]);

  // Parse the "steps" markdown into individual checklist items (drops leading "N. ").
  const checklistItems = useMemo(() => {
    if (!response) return [] as string[];
    return response.steps
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => /^\d+\.\s+/.test(l))
      .map((l) => l.replace(/^\d+\.\s+/, ""));
  }, [response]);

  // If the re-translated response yields a different number of steps than what
  // the current checked-state was built against, positions can no longer be
  // matched — reset to all-unchecked. Same count preserves checked indices.
  const prevStepCountRef = useRef<number>(0);
  useEffect(() => {
    const count = checklistItems.length;
    if (count !== prevStepCountRef.current) {
      if (prevStepCountRef.current !== 0 && count !== prevStepCountRef.current) {
        setChecked(new Set());
      }
      prevStepCountRef.current = count;
    }
  }, [checklistItems.length]);

  const toggleCheck = (idx: number) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const checklistProgress =
    checklistItems.length === 0 ? 0 : Math.round((checked.size / checklistItems.length) * 100);

  const levelClass = (lvl: Level) =>
    lvl === "high"
      ? "bg-primary/10 text-primary ring-primary/20"
      : lvl === "medium"
        ? "bg-[color:var(--warning)]/20 text-foreground ring-[color:var(--warning)]/30"
        : "bg-[color:var(--success)]/15 text-foreground ring-[color:var(--success)]/25";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <Leaf className="h-5 w-5 text-emerald-600" strokeWidth={2.25} />
            </div>
            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-semibold tracking-tight">{L.brand}</span>
                <span className="hidden rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary ring-1 ring-primary/20 sm:inline-flex">
                  {L.builtBy}
                </span>
              </div>
              <div className="hidden text-xs text-muted-foreground sm:block">{L.tagline}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground md:inline-flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[oklch(var(--success))]" style={{ background: "var(--success)" }} />
              {L.openSource}
            </span>
            <button
              type="button"
              onClick={() => setLang(lang === "en" ? "pl" : "en")}
              className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-semibold shadow-[var(--shadow-soft)] transition-all hover:border-primary/40 hover:bg-primary/5"
              aria-label="Toggle language"
            >
              <Languages className="h-4 w-4 text-primary" />
              <span className="tabular-nums">{lang === "en" ? "EN" : "PL"}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground group-hover:text-foreground">{L.langLabel}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        {/* Hero */}
        <section className="mb-10 max-w-3xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            {lang === "en" ? "AI Regulatory Copilot for EU SMEs" : "Kopilot Regulacyjny AI dla MŚP w UE"}
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {lang === "en" ? (
              <>
                Decode ESG jargon into <span className="text-primary">plain business action.</span>
              </>
            ) : (
              <>
                Przełóż żargon ESG na <span className="text-primary">konkretne działania.</span>
              </>
            )}
          </h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
            {lang === "en"
              ? "Paste a regulatory paragraph or search a term. Get a plain-language explanation, a materiality risk read for your sector, and a next-step checklist — in seconds."
              : "Wklej fragment regulacji lub wyszukaj pojęcie. W kilka sekund otrzymasz wyjaśnienie po ludzku, ocenę ryzyka istotności dla Twojego sektora i listę kolejnych kroków."}
          </p>
        </section>

        {/* Workspace */}
        <section className="grid gap-6 lg:grid-cols-5">
          {/* Left: input */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-6">
              {/* Tabs */}
              <div className="mb-5 inline-flex rounded-full bg-secondary p-1 text-sm font-medium">
                <button
                  onClick={() => setMode("analyze")}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 transition-all ${
                    mode === "analyze"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  {L.tabAnalyze}
                </button>
                <button
                  onClick={() => setMode("search")}
                  className={`flex items-center gap-2 rounded-full px-4 py-1.5 transition-all ${
                    mode === "search"
                      ? "bg-card text-foreground shadow-sm ring-1 ring-border"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Search className="h-4 w-4" />
                  {L.tabSearch}
                </button>
              </div>

              {/* Mode content */}
              {mode === "analyze" ? (
                <div className="space-y-3">
                  {/* Drag & drop upload zone */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      const f = e.dataTransfer.files?.[0];
                      if (f) handleFile(f);
                    }}
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-all ${
                      dragActive
                        ? "border-primary bg-primary/10 scale-[1.01]"
                        : "border-border bg-secondary/40 hover:border-primary/50 hover:bg-primary/5"
                    }`}
                  >
                    {!uploadedFile ? (
                      <>
                        <label className="flex cursor-pointer flex-col items-center gap-2">
                          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
                            <UploadCloud className="h-5 w-5 text-primary" />
                          </span>
                          <span className="text-sm font-semibold text-foreground">{L.uploadTitle}</span>
                          <span className="text-[11px] text-muted-foreground">{L.uploadHint}</span>
                          <input
                            type="file"
                            accept=".pdf,image/png,image/jpeg"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFile(f);
                            }}
                          />
                        </label>
                      </>
                    ) : (
                      <div className="w-full text-left">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/20">
                            <FileText className="h-4 w-4 text-primary" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-semibold text-foreground">{uploadedFile.name}</div>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                              <span>{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                              <span>·</span>
                              <span className="inline-flex items-center gap-1">
                                {uploadDone ? (
                                  <>
                                    <CheckCircle2 className="h-3 w-3 text-[color:var(--success)]" style={{ color: "var(--success)" }} />
                                    {L.uploadReady}
                                  </>
                                ) : (
                                  <>
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    {L.uploadProcessing}
                                  </>
                                )}
                              </span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={clearUpload}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            aria-label={L.uploadRemove}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                          <div
                            className="h-full rounded-full transition-all duration-200"
                            style={{
                              width: `${uploadProgress}%`,
                              background: "var(--gradient-primary)",
                            }}
                          />
                        </div>
                        {pdfNotice && (
                          <div className="mt-2 rounded-md border border-border bg-secondary/60 px-3 py-2 text-[11px] leading-snug text-muted-foreground">
                            {pdfNotice}
                          </div>
                        )}
                        {pdfTruncated && !pdfNotice && (
                          <div className="mt-2 text-[11px] text-muted-foreground">
                            {L.pdfTruncated}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    <span>{L.uploadOrDivider}</span>
                    <span className="h-px flex-1 bg-border" />
                  </div>

                  <label className="block text-sm font-semibold text-foreground">{L.inputTextTitle}</label>
                  <p className="text-xs text-muted-foreground">{L.inputTextHint}</p>
                  <textarea
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder={L.inputTextPlaceholder}
                    rows={7}
                    className="mt-1 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm leading-relaxed text-foreground shadow-inner outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-foreground">{L.inputTermTitle}</label>
                  <p className="text-xs text-muted-foreground">{L.inputTermHint}</p>
                  <input
                    value={termInput}
                    onChange={(e) => setTermInput(e.target.value)}
                    placeholder={L.inputTermPlaceholder}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  />
                  <div className="pt-2">
                    <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <Sparkles className="h-3 w-3 text-primary" />
                      {L.suggested}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {SUGGESTED_CHIPS[lang].map((p) => {
                        const active = termInput === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setTermInput(p)}
                            className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${
                              active
                                ? "border-primary/50 bg-primary/10 text-primary shadow-sm"
                                : "border-border bg-secondary/60 text-secondary-foreground hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/10 hover:text-foreground"
                            }`}
                          >
                            {p}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Industry */}
              <div className="mt-5 space-y-2">
                <label className="block text-sm font-semibold text-foreground">{L.industryLabel}</label>
                <div className="relative">
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value as Industry)}
                    className="w-full appearance-none rounded-xl border border-border bg-background px-4 py-2.5 pr-10 text-sm font-medium text-foreground outline-none transition-colors focus:border-primary/60 focus:ring-2 focus:ring-primary/20"
                  >
                    {(Object.keys(L.industries) as Industry[]).map((k) => (
                      <option key={k} value={k}>
                        {L.industries[k]}
                      </option>
                    ))}
                  </select>
                  <ArrowRight className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-muted-foreground" />
                </div>
              </div>

              {error && (
                <p className="mt-3 text-xs font-medium text-[color:var(--destructive)]">{error}</p>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-all hover:brightness-105 hover:shadow-[var(--shadow-elevated)] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
                style={{ backgroundImage: "var(--gradient-primary)" }}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {L.loading}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    {mode === "analyze" ? L.analyze : L.explain}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right: response */}
          <div className="lg:col-span-3">
            <div id="print-briefing" className="min-h-[540px] rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] sm:p-7">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                  </span>
                  <span className="text-sm font-semibold tracking-tight">{L.aiBriefing}</span>
                  {source && (
                    <span
                      className={
                        source === "live"
                          ? "inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary"
                          : "inline-flex items-center gap-1 rounded-full border border-border bg-secondary/60 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground"
                      }
                    >
                      <span
                        className={
                          "h-1.5 w-1.5 rounded-full " +
                          (source === "live" ? "bg-primary animate-pulse" : "bg-muted-foreground/60")
                        }
                      />
                      {source === "live" ? L.liveBadge : L.demoBadge}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!loading && response && (
                    <button
                      type="button"
                      onClick={() =>
                        downloadPdfBriefing({
                          lang,
                          response,
                          industryLabel: L.industries[query!.industry],
                          L,
                        })
                      }
                      className="no-print group inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm transition-all hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground hover:shadow-[var(--shadow-elevated)]"
                    >
                      <Download className="h-3.5 w-3.5" />
                      {L.downloadPdf}
                    </button>
                  )}
                </div>
              </div>

              {!loading && response && (
                <div className="mb-5 animate-in fade-in slide-in-from-top-2 duration-500">
                  <div className="mb-3 rounded-xl border border-border bg-secondary/40 px-4 py-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      {L.contextFor}
                    </span>
                    <div className="mt-0.5 truncate text-sm font-semibold text-foreground">
                      {query!.uploadedFilename
                        ? `${L.uploadedLabel(query!.uploadedFilename)} · ${L.industries[query!.industry]}`
                        : `${response.matchedTerm} · ${L.industries[query!.industry]}`}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="flex items-center justify-center rounded-xl border border-border bg-background/60 p-4">
                      <ComplexityGauge
                        value={COMPLEXITY_SCORE[response.complexity]}
                        label={L.complexityLabel}
                        sublabel={L.complexityLevels[response.complexity]}
                      />
                    </div>
                    <div className="sm:col-span-2 grid gap-3">
                      <RiskBadge
                        risk={response.risk}
                        label={L.riskLabel}
                        levelText={L.riskLevels[response.risk]}
                      />
                      <div className="flex items-center gap-3 rounded-xl border border-border bg-background/60 p-4">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                          <Gauge className="h-4 w-4 text-primary" />
                        </span>
                        <div className="min-w-0">
                          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            {L.industryLabel}
                          </div>
                          <div className="truncate text-sm font-semibold text-foreground">
                            {L.industries[query!.industry]}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {response && partialInfo && (
                <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-3 py-2 text-xs text-amber-800">
                  {L.partialNote(partialInfo.used, partialInfo.total)}
                </div>
              )}


              {loading && (
                <div className="space-y-4">
                  {pipelineProgress && pipelineProgress.total > 1 && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                      <div className="mb-2 flex items-center justify-between text-xs font-semibold text-primary">
                        <span>
                          {pipelineProgress.phase === "reduce"
                            ? L.reduceLoading
                            : L.mapLoading(pipelineProgress.done, pipelineProgress.total)}
                        </span>
                        <span>
                          {Math.round((pipelineProgress.done / Math.max(1, pipelineProgress.total)) * 100)}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-primary/15">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-300"
                          style={{
                            width: `${Math.round((pipelineProgress.done / Math.max(1, pipelineProgress.total)) * 100)}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="animate-pulse rounded-xl border border-border/70 bg-secondary/40 p-5">
                      <div className="mb-3 h-3 w-1/3 rounded bg-border" />
                      <div className="space-y-2">
                        <div className="h-2.5 w-full rounded bg-border/80" />
                        <div className="h-2.5 w-11/12 rounded bg-border/70" />
                        <div className="h-2.5 w-9/12 rounded bg-border/60" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!loading && !response && analysisFailed && (
                <div className="flex h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-primary/40 bg-primary/5 px-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{L.empty.title}</h3>
                  <p className="mt-2 max-w-md text-sm text-muted-foreground">{analysisFailed}</p>
                </div>
              )}

              {!loading && !response && !analysisFailed && (
                <div className="flex h-[420px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 text-center">
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Leaf className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground">{L.empty.title}</h3>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">{L.empty.body}</p>
                </div>
              )}


              {!loading && response && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {/* TL;DR Executive Summary */}
                  <article
                    className="relative overflow-hidden rounded-xl border border-primary/30 p-5"
                    style={{ background: "linear-gradient(135deg, oklch(0.97 0.05 60), oklch(0.99 0.02 80))" }}
                  >
                    <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/15 blur-2xl" />
                    <header className="relative mb-2 flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 ring-1 ring-primary/25">
                        <Zap className="h-4 w-4 text-primary" />
                      </span>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                        {L.tldrLabel}
                      </div>
                    </header>
                    <p className="relative text-[15px] leading-relaxed text-foreground">
                      {response.tldr}
                    </p>
                  </article>

                  {sectionCards.map((s, idx) => {
                    const Icon = s.icon;
                    const toneClass =
                      s.tone === "primary"
                        ? "bg-primary/10 text-primary"
                        : s.tone === "warning"
                          ? "bg-[color:var(--warning)]/15 text-[color:var(--foreground)]"
                          : "bg-[color:var(--success)]/15 text-[color:var(--foreground)]";
                    const isSteps = s.key === "steps";
                    return (
                      <article
                        key={s.key}
                        className="rounded-xl border border-border bg-background/60 p-5 transition-shadow hover:shadow-[var(--shadow-soft)]"
                      >
                        <header className="mb-3 flex items-center gap-3">
                          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${toneClass}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <div className="flex-1">
                            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                              {L.section} {idx + 1}
                            </div>
                            <h4 className="text-[15px] font-semibold text-foreground">{s.title}</h4>
                          </div>
                          {isSteps && (
                            <div className="hidden shrink-0 text-right sm:block">
                              <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                {L.progressLabel}
                              </div>
                              <div className="text-sm font-semibold tabular-nums text-primary">
                                {checked.size}/{checklistItems.length} · {checklistProgress}%
                              </div>
                            </div>
                          )}
                        </header>
                        {isSteps ? (
                          <>
                            <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-border">
                              <div
                                className="h-full rounded-full transition-all duration-500 ease-out"
                                style={{
                                  width: `${checklistProgress}%`,
                                  background: "var(--gradient-primary)",
                                }}
                              />
                            </div>
                            <ul className="space-y-2">
                              {checklistItems.map((item, i) => {
                                const isChecked = checked.has(i);
                                return (
                                  <li key={i}>
                                    <button
                                      type="button"
                                      onClick={() => toggleCheck(i)}
                                      className={`flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-all ${
                                        isChecked
                                          ? "border-primary/30 bg-primary/5"
                                          : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
                                      }`}
                                    >
                                      <span
                                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                                          isChecked
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-background"
                                        }`}
                                      >
                                        {isChecked && <CheckCircle2 className="h-3.5 w-3.5" strokeWidth={3} />}
                                      </span>
                                      <span
                                        className={`flex-1 text-[15px] leading-relaxed ${
                                          isChecked
                                            ? "text-muted-foreground line-through decoration-primary/50"
                                            : "text-foreground"
                                        }`}
                                      >
                                        {renderInline(item)}
                                      </span>
                                    </button>
                                  </li>
                                );
                              })}
                            </ul>
                            {checklistProgress === 100 && (
                              <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm font-medium text-primary animate-in fade-in duration-500">
                                <CheckCircle2 className="h-4 w-4" />
                                {lang === "en"
                                  ? "All steps complete — you're compliance-ready."
                                  : "Wszystkie kroki ukończone — jesteś gotowy na compliance."}
                              </div>
                            )}
                          </>
                        ) : (
                          <MarkdownBlock text={s.body} />
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-12">
          <div
            className="relative overflow-hidden rounded-3xl border border-primary/30 p-8 sm:p-10"
            style={{ backgroundImage: "var(--gradient-primary)" }}
          >
            <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-white/15 blur-3xl" />
            <div className="absolute -bottom-16 -left-10 h-60 w-60 rounded-full bg-black/10 blur-3xl" />
            <div className="relative flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div className="max-w-xl">
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white/90 ring-1 ring-white/20">
                  <Sparkles className="h-3.5 w-3.5" />
                  Impakt.ai
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">{L.ctaTitle}</h2>
                <p className="mt-2 text-[15px] leading-relaxed text-white/85">{L.ctaBody}</p>
              </div>
              <a
                href={L.ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-lg transition-transform hover:-translate-y-0.5"
              >
                {L.ctaBtn}
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </section>

        <footer className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            <span>{L.brand} — {L.footer}</span>
          </div>
          <div className="flex items-center gap-3">
            <a href="#" className="inline-flex items-center gap-1.5 hover:text-foreground">
              <Github className="h-3.5 w-3.5" /> Open source
            </a>
            <span aria-hidden>·</span>
            <span>© 2026 Impakt.ai</span>
          </div>
        </footer>
      </main>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-briefing, #print-briefing * {
            visibility: visible !important;
          }
          #print-briefing {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
            color: black !important;
          }
          .no-print, button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}