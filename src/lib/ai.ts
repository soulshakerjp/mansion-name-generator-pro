import { NameSuggestion, NormalizedGeneratorInput } from "@/lib/types";
import { buildGoogleSearchUrl, buildTrademarkSearchUrl, makeId } from "@/lib/utils";

const schema = {
  name: "mansion_name_generator_pro",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      suggestions: {
        type: "array",
        minItems: 8,
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

function buildPrompt(input: NormalizedGeneratorInput) {
  return `あなたは日本の不動産実務に強いネーミングディレクターです。

目的:
投資用一棟アパート・マンション向けに、提案資料でも使える品格を持ちながら、凡庸ではない物件名候補を10案作ってください。

入力条件:
- エリア: ${input.area}
- 物件タイプ: ${input.propertyTypeLabel}
- 世界観コンセプト: ${input.worldConceptLabel}
- 居住者イメージ: ${input.residentImageLabel}
- 自由キーワード: ${input.freeKeywords || "なし"}

必須ルール:
- 名前は日本の賃貸・投資用物件として違和感がないこと
- ただし、よくあるハイツ、コート、レジデンス等の凡庸な接尾辞の量産は避けること
- 由来設計を先に行い、その由来に沿った命名をすること
- 造語・準造語・和洋ミックスを許容する
- 読みにくすぎる案、痛すぎる案、安っぽい案は避けること
- 世界観コンセプトと居住者イメージが名前の響きに反映されていること
- 提案資料に載せても恥ずかしくないこと
- 各案はできるだけ被らない方向性にすること
- readingは不要なら空文字でよい

出力要件:
- suggestions を10件返す
- 各案ごとに name, reading, originMeaning, impressionTone, residentFitComment, shortEvaluation を返す
- shortEvaluation は 25文字前後の短評にする
- 日本語中心で自然に書く
- JSON以外を一切返さない`;
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
      temperature: 0.9,
      messages: [
        {
          role: "system",
          content:
            "あなたは日本の不動産実務とネーミングに精通したアシスタントです。出力は必ずJSONスキーマに厳密準拠してください。",
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
      reading?: string;
      originMeaning: string;
      impressionTone: string;
      residentFitComment: string;
      shortEvaluation: string;
    }>;
  };

  return parsed.suggestions.map((item) => ({
    id: makeId("suggestion"),
    name: item.name.trim(),
    reading: item.reading?.trim() || undefined,
    originMeaning: item.originMeaning.trim(),
    impressionTone: item.impressionTone.trim(),
    residentFitComment: item.residentFitComment.trim(),
    shortEvaluation: item.shortEvaluation.trim(),
    googleSearchUrl: buildGoogleSearchUrl(item.name.trim()),
    trademarkSearchUrl: buildTrademarkSearchUrl(),
  }));
}
