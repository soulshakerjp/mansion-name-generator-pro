import { NextRequest, NextResponse } from "next/server";
import { generateAiSuggestions } from "@/lib/ai";
import { generateMockSuggestions } from "@/lib/mock-generator";
import { GeneratorInput, GenerationResult } from "@/lib/types";
import { makeId, normalizeInput } from "@/lib/utils";
import { validateInput } from "@/lib/validation";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { input?: GeneratorInput };
    if (!body.input) {
      return NextResponse.json({ error: "入力データがありません。" }, { status: 400 });
    }

    const errors = validateInput(body.input);
    if (Object.keys(errors).length > 0) {
      return NextResponse.json({ error: "入力値に不備があります。", errors }, { status: 400 });
    }

    const normalized = normalizeInput(body.input);
    const suggestions =
      (await generateAiSuggestions(normalized).catch(() => null)) ??
      generateMockSuggestions(normalized, 10);

    const payload: GenerationResult = {
      generationId: makeId("generation"),
      createdAt: new Date().toISOString(),
      input: body.input,
      suggestions,
    };

    return NextResponse.json(payload);
  } catch {
    return NextResponse.json(
      { error: "生成処理に失敗しました。時間を置いて再度お試しください。" },
      { status: 500 },
    );
  }
}
