import { createServerFn } from "@tanstack/react-start";
import { generateText } from "ai";
import { z } from "zod";

const InputSchema = z.object({
  // Tier 1 raises the practical cap to ~45k; hard limit keeps a safety margin.
  text: z.string().min(1).max(60000),
  industry: z.string().min(1).max(60),
  lang: z.enum(["en", "pl"]),
});

const ChunkInputSchema = z.object({
  text: z.string().min(1).max(12000),
  industry: z.string().min(1).max(60),
  lang: z.enum(["en", "pl"]),
});

const OutputSchema = z.object({
  tldr: z.string(),
  definition: z.string(),
  risk: z.string(),
  steps: z.array(z.string()).min(2).max(6),
});


export type AnalyzeReportResult = z.infer<typeof OutputSchema>;

const SYSTEM_PROMPT =
  "You are an ESG regulatory copilot for European SMEs. Given a fragment of a report and an industry context, respond ONLY in JSON with four fields: tldr (a 2-sentence plain-language executive summary specific to THIS document/topic, giving a punchy top-line takeaway plus the practical business stake for an SME in the given industry — do NOT simply repeat the definition, do NOT quote or paste raw fragments of the source text), definition (a plain language explanation of the actual topic, three to four sentences), risk (a materiality risk assessment specific to the given industry, three to four sentences), and steps (an array of three to four short actionable next steps). Every field must be written entirely and only in the requested language (pl or en) — never mix languages, never leave verbatim source-language fragments. Do not include any text outside the JSON object.";


function extractJson(text: string): unknown {
  if (!text || !text.trim()) throw new Error("empty model response");
  let trimmed = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("no json object");
  let slice = trimmed.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    slice = slice
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1F\x7F]/g, " ");
    return JSON.parse(slice);
  }
}

export const analyzeReport = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }): Promise<AnalyzeReportResult> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { createLovableGateway } = await import("./ai-gateway.server");
    const gateway = createLovableGateway(apiKey);

    const userPrompt = `Language: ${data.lang}\nIndustry context: ${data.industry}\n\nReport fragment:\n"""\n${data.text}\n"""\n\nReturn ONLY a JSON object with keys: tldr (string, 2 sentences, in ${data.lang}), definition (string), risk (string), steps (array of 3-4 strings). Do not include any verbatim fragment of the report text in tldr.`;

    const result = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 700,
      providerOptions: {
        lovable: { response_format: { type: "json_object" } },
      },
    });

    const parsed = OutputSchema.parse(extractJson(result.text));
    return parsed;
  });

/**
 * Map-pass summarizer. Extracts 3–6 relevant bullets from one chunk of a large
 * document. Cheap, plain-text output — reduced later by analyzeReport.
 */
export const summarizeChunk = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => ChunkInputSchema.parse(data))
  .handler(async ({ data }): Promise<{ bullets: string }> => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

    const { createLovableGateway } = await import("./ai-gateway.server");
    const gateway = createLovableGateway(apiKey);

    const prompt = `Language: ${data.lang}\nIndustry: ${data.industry}\n\nExtract only the concrete facts, figures, obligations, thresholds, dates and requirements from the excerpt below that are relevant to an SME in the ${data.industry} sector. Return 3-6 short bullet points, each starting with "- ". No headings, no commentary, no preface. Respond entirely in ${data.lang}.\n\nExcerpt:\n"""\n${data.text}\n"""`;

    const result = await generateText({
      model: gateway("google/gemini-2.5-flash"),
      prompt,
      maxOutputTokens: 320,
    });
    return { bullets: (result.text || "").trim() };
  });


