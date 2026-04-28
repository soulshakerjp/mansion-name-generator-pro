import { NameSuggestion, NormalizedGeneratorInput } from "@/lib/types";
import {
  buildGoogleSearchUrl,
  buildKatakanaReading,
  buildTrademarkSearchUrl,
  makeId,
} from "@/lib/utils";

const schema = {
  name: "mansion_name_generator_pro",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        minItems: 10,
        maxItems: 10,
        items: {
          type: "object",
          additionalProperties: false,
          properties: {
            name: { type: "string" },
            reading: { type: "string" },
            originMeaning: { type: "string" },
            impressionTone: { type: "string" },
            residentFitComment: { type: "string" },
            shortEvaluation: { type: "string" },
          },
          required: [
            "name",
            "reading",
            "originMeaning",
            "impressionTone",
            "residentFitComment",
            "shortEvaluation",
          ],
        },
      },
    },
    required: ["suggestions"],
  },
  strict: true,
};

const languageMarkers = [
  "英語",
  "フランス語",
  "ドイツ語",
  "ラテン語",
  "イタリア語",
  "スペイン語",
  "日本語",
];

const processMarkers = ["造語", "短縮", "変形", "接続", "融合", "省略", "丸め", "反転"];

function buildPrompt(input: NormalizedGeneratorInput) {
  return `あなたは日本語ネーミングに強い命名ディレクターです。

目的:
投資用一棟アパート・マンション向けに、提案資料でそのまま説明できるレベルのネーミング候補を10案作ること。

入力条件:
- エリア: ${input.area}
- 物件タイプ: ${input.propertyTypeLabel}
- 世界観コンセプト: ${input.worldConceptLabel}
- 居住者イメージ: ${input.residentImageLabel}
- 自由キーワード: ${input.freeKeywords || "なし"}

最重要ルール:
- 10案すべて方向性を大きく変える
- 同じ語尾・同じリズム・同じ発想の焼き直しは禁止
- 先に語源設計を行い、その根拠から名前を作る
- 安っぽい量産接尾辞の連打は禁止
- 提案先に説明したとき「なぜその名前なのか」が一読で伝わること
- reading は必ず全角カタカナのみで返すこと

originMeaning の必須要件:
- 必ず「何語の何という単語か」を書く
- 必ず「その単語の直訳」を書く
- 必ず「どの部分を短縮・変形・接続・融合したか」を書く
- 必ず「なぜその語源がこの物件条件に合うか」を書く
- 必ず「造語」という語を本文内に入れる
- 曖昧な表現だけで終わらせない

10案の内部設計スロット:
1. フランス語またはイタリア語起点の上品系
2. ラテン語起点の短縮造語系
3. ドイツ語または英語起点の都市的で締まった系
4. 日本語起点の簡潔で余韻のある系
5. 英語と日本語の和洋ミックス系
6. 二語融合だが語尾を丸めたソフト造語系
7. 直球単語名ではなく意味を圧縮した抽象系
8. 居住者像を先に立てる逆順発想系
9. 自由キーワードを反映した意味接続系
10. 高級感よりも思想や設計意図が立つ説明系

出力要件:
- suggestions をちょうど10件返す
- 各案ごとに name, reading, originMeaning, impressionTone, residentFitComment, shortEvaluation を返す
- originMeaning は2〜4文で、語源・直訳・造語工程・適合理由をすべて含める
- shortEvaluation は25文字前後で短く鋭くまとめる
- 日本語中心で自然に書く
- JSON以外は一切返さない`;
}

function normalizeNameKey(name: string) {
  return name.toLowerCase().replace(/[\s・･・\-ー_]/g, "");
}

function validateAiOutput(items: Array<{
  name: string;
  reading: string;
  originMeaning: string;
}>) {
  if (items.length !== 10) return false;

  const uniqueNames = new Set(items.map((item) => normalizeNameKey(item.name)));
  if (uniqueNames.size !== 10) return false;

  const uniquePrefixes = new Set(
    items.map((item) => normalizeNameKey(item.name).slice(0, 4)).filter(Boolean),
  );
  if (uniquePrefixes.size < 7) return false;

  const mentionedLanguages = new Set<string>();

  for (const item of items) {
    if (!item.name.trim()) return false;
    if (!item.originMeaning.includes("直訳")) return false;
    if (!item.originMeaning.includes("造語")) return false;
    if (!processMarkers.some((marker) => item.originMeaning.includes(marker))) return false;

    const normalizedReading = buildKatakanaReading(item.name, item.reading);
    if (!normalizedReading || /[^ァ-ヶー・\sヴ]/.test(normalizedReading)) return false;

    languageMarkers.forEach((marker) => {
      if (item.originMeaning.includes(marker)) {
        mentionedLanguages.add(marker);
      }
    });
  }

  return mentionedLanguages.size >= 4;
}

export async function generateAiSuggestions(
  input: NormalizedGeneratorInput,
): Promise<NameSuggestion[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
      temperature: 1.05,
      messages: [
        {
          role: "system",
          content:
            "あなたは日本語ネーミングの品質管理者でもあります。出力前に10案を自己点検し、語源の言語・直訳・造語工程・適合理由の4点が揃っているか確認してください。似た語感の案は捨て、差異が明瞭な10案だけをJSONで返してください。",
        },
        {
          role: "user",
          content: buildPrompt(input),
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: schema,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI generation failed: ${text}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) return null;

  const parsed = JSON.parse(content) as {
    suggestions: Array<{
      name: string;
      reading: string;
      originMeaning: string;
      impressionTone: string;
      residentFitComment: string;
      shortEvaluation: string;
    }>;
  };

  if (!validateAiOutput(parsed.suggestions)) {
    throw new Error("AI quality validation failed");
  }

  return parsed.suggestions.map((item) => {
    const name = item.name.trim();
    return {
      id: makeId("suggestion"),
      name,
      reading: buildKatakanaReading(name, item.reading),
      originMeaning: item.originMeaning.trim(),
      impressionTone: item.impressionTone.trim(),
      residentFitComment: item.residentFitComment.trim(),
      shortEvaluation: item.shortEvaluation.trim(),
      googleSearchUrl: buildGoogleSearchUrl(name),
      trademarkSearchUrl: buildTrademarkSearchUrl(),
    };
  });
}
