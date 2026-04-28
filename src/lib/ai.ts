import { NameSuggestion, NormalizedGeneratorInput } from "@/lib/types";
import {
  buildGoogleSearchUrl,
  buildKatakanaReading,
  buildTrademarkSearchUrl,
  makeId,
} from "@/lib/utils";

type AiSuggestion = {
  slotId: string;
  slotTheme: string;
  name: string;
  reading: string;
  primaryLanguage: string;
  primaryWord: string;
  primaryLiteral: string;
  primaryNuance: string;
  secondaryLanguage: string;
  secondaryWord: string;
  secondaryLiteral: string;
  secondaryNuance: string;
  namingMethod: string;
  wordplayProcess: string;
  fitReason: string;
  originMeaning: string;
  impressionTone: string;
  residentFitComment: string;
  shortEvaluation: string;
};

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
            slotId: { type: "string" },
            slotTheme: { type: "string" },
            name: { type: "string" },
            reading: { type: "string" },
            primaryLanguage: { type: "string" },
            primaryWord: { type: "string" },
            primaryLiteral: { type: "string" },
            primaryNuance: { type: "string" },
            secondaryLanguage: { type: "string" },
            secondaryWord: { type: "string" },
            secondaryLiteral: { type: "string" },
            secondaryNuance: { type: "string" },
            namingMethod: { type: "string" },
            wordplayProcess: { type: "string" },
            fitReason: { type: "string" },
            originMeaning: { type: "string" },
            impressionTone: { type: "string" },
            residentFitComment: { type: "string" },
            shortEvaluation: { type: "string" },
          },
          required: [
            "slotId",
            "slotTheme",
            "name",
            "reading",
            "primaryLanguage",
            "primaryWord",
            "primaryLiteral",
            "primaryNuance",
            "secondaryLanguage",
            "secondaryWord",
            "secondaryLiteral",
            "secondaryNuance",
            "namingMethod",
            "wordplayProcess",
            "fitReason",
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

const expectedSlotIds = [
  "01_french_or_italian_elegance",
  "02_latin_compact_coinage",
  "03_urban_germanic_tension",
  "04_japanese_resonance",
  "05_wayo_mix",
  "06_soft_fused_coinage",
  "07_abstract_concept",
  "08_resident_first_reverse",
  "09_keyword_connected",
  "10_concept_driven_story",
];

const languageMarkers = [
  "英語",
  "フランス語",
  "ドイツ語",
  "ラテン語",
  "イタリア語",
  "スペイン語",
  "日本語",
  "ギリシャ語",
  "ポルトガル語",
];

const processMarkers = ["短縮", "変形", "接続", "融合", "省略", "丸め", "反転", "入れ替え", "圧縮", "抽出"];

function buildPrompt(input: NormalizedGeneratorInput) {
  return `あなたは日本語ネーミングに強い命名ディレクター兼コピーライターです。

目的:
投資用一棟アパート・マンション向けに、提案資料で「なぜその名前なのか」を説明しきれるネーミング候補を10案作ってください。

入力条件:
- エリア: ${input.area}
- 物件タイプ: ${input.propertyTypeLabel}
- 世界観コンセプト: ${input.worldConceptLabel}
- 居住者イメージ: ${input.residentImageLabel}
- 自由キーワード: ${input.freeKeywords || "なし"}

絶対条件:
- 10案すべて方向性・語感・語源・説明の切り口を変える
- 同じテンプレ文の使い回しは禁止
- まず語源設計を決め、そのあとに名前を作る
- 安っぽい量産接尾辞の連打は禁止
- reading は全角カタカナのみ
- 元単語は実在語を優先し、造語にする場合も実在語のどこをもじったか必ず示す

各案の説明で必ず明記する項目:
1. 主要語源: 何語の何という単語か
2. 主要語源の直訳
3. 主要語源が持つニュアンス
4. 補助語源: 何語の何という単語か
5. 補助語源の直訳
6. 補助語源が持つニュアンス
7. 命名手法: 直結 / 短縮造語 / 和洋ミックス / 語順反転 / 音の丸め / 抽象化 など
8. 造語処理: どこを削ったか、どこを接続したか、どこをもじったか
9. 採用理由: なぜこの物件条件に合うか
10. originMeaning: 上記の内容を要約した本文。必ず文面を案ごとに変えること

originMeaning の文体ルール:
- 必ず4行構成にする
- 1行目: 「主要語源: ○○語の『△△』= 直訳: □□」
- 2行目: 「補助語源: ○○語の『△△』= 直訳: □□」
- 3行目: 「造語処理: ～～を短縮/変形/接続して『名称』にした」
- 4行目: 「採用理由: ～～だからこの条件に合う」
- 4行とも案ごとに具体語を変えること
- 「世界観を表現した」「雰囲気を出した」だけの曖昧文は禁止

10案の固定スロット:
1. slotId=01_french_or_italian_elegance / フランス語またはイタリア語起点の上品系
2. slotId=02_latin_compact_coinage / ラテン語起点の短縮造語系
3. slotId=03_urban_germanic_tension / ドイツ語または英語起点の都市的で締まった系
4. slotId=04_japanese_resonance / 日本語起点の簡潔で余韻のある系
5. slotId=05_wayo_mix / 英語または欧州語と日本語の和洋ミックス系
6. slotId=06_soft_fused_coinage / 二語融合だが語尾を丸めたソフト造語系
7. slotId=07_abstract_concept / 直球単語名ではなく意味を圧縮した抽象系
8. slotId=08_resident_first_reverse / 居住者像を先に立てる逆順発想系
9. slotId=09_keyword_connected / 自由キーワードを反映した意味接続系
10. slotId=10_concept_driven_story / 高級感より思想や設計意図が立つ説明系

出力要件:
- suggestions はちょうど10件
- slotId は上記を1回ずつ使う
- namingMethod は10案のうち最低7案で異なる語を使う
- primaryLanguage / secondaryLanguage は全体で最低4種類以上使う
- originMeaning は4行の改行入り文字列にする
- shortEvaluation は25文字前後
- JSON以外は返さない`;
}

function normalizeNameKey(name: string) {
  return name.toLowerCase().replace(/[\s・･・\-ー_]/g, "");
}

function buildStructuredOrigin(item: AiSuggestion) {
  const base = item.originMeaning?.trim();
  const normalized = base
    ? base
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const lines = [
    normalized[0] || `主要語源: ${item.primaryLanguage}の「${item.primaryWord}」= 直訳: ${item.primaryLiteral}。含意は${item.primaryNuance}。`,
    normalized[1] || `補助語源: ${item.secondaryLanguage}の「${item.secondaryWord}」= 直訳: ${item.secondaryLiteral}。含意は${item.secondaryNuance}。`,
    normalized[2] || `造語処理: ${item.wordplayProcess}。命名手法は${item.namingMethod}。`,
    normalized[3] || `採用理由: ${item.fitReason}`,
  ];

  return lines.join("\n");
}

function validateAiOutput(items: AiSuggestion[]) {
  if (items.length !== 10) return false;

  const slotIds = items.map((item) => item.slotId.trim());
  if (new Set(slotIds).size !== 10) return false;
  if (expectedSlotIds.some((slotId) => !slotIds.includes(slotId))) return false;

  const uniqueNames = new Set(items.map((item) => normalizeNameKey(item.name)));
  if (uniqueNames.size !== 10) return false;

  const uniquePrefixes = new Set(
    items.map((item) => normalizeNameKey(item.name).slice(0, 4)).filter(Boolean),
  );
  if (uniquePrefixes.size < 8) return false;

  const languageSet = new Set<string>();
  const namingMethodSet = new Set<string>();
  const originBodies = new Set<string>();

  for (const item of items) {
    if (!item.name.trim()) return false;
    if (!item.primaryWord.trim() || !item.secondaryWord.trim()) return false;
    if (!item.primaryLiteral.trim() || !item.secondaryLiteral.trim()) return false;
    if (!item.wordplayProcess.trim() || !item.fitReason.trim()) return false;

    namingMethodSet.add(item.namingMethod.trim());
    languageSet.add(item.primaryLanguage.trim());
    languageSet.add(item.secondaryLanguage.trim());

    const originMeaning = buildStructuredOrigin(item);
    const lines = originMeaning.split(/\r?\n/).filter(Boolean);
    if (lines.length < 4) return false;
    if (!lines[0].includes("主要語源:")) return false;
    if (!lines[1].includes("補助語源:")) return false;
    if (!lines[2].includes("造語処理:")) return false;
    if (!lines[3].includes("採用理由:")) return false;
    if (!originMeaning.includes("直訳:")) return false;
    if (!processMarkers.some((marker) => originMeaning.includes(marker))) return false;

    const normalizedReading = buildKatakanaReading(item.name, item.reading);
    if (!normalizedReading || /[^ァ-ヶー・\sヴ]/.test(normalizedReading)) return false;

    originBodies.add(originMeaning.replace(/\s+/g, " "));
  }

  const matchedLanguages = [...languageSet].filter((language) =>
    languageMarkers.some((marker) => language.includes(marker)),
  );

  return namingMethodSet.size >= 7 && new Set(matchedLanguages).size >= 4 && originBodies.size === 10;
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
      temperature: 1.15,
      messages: [
        {
          role: "system",
          content:
            "あなたは命名の品質管理者です。各案を出力する前に、語源の言語・元単語・直訳・ニュアンス・造語処理・採用理由が揃っているか確認してください。同じ説明文型の再利用は禁止です。10案は比較表に並べたとき、説明の観点まで違う必要があります。",
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
    suggestions: AiSuggestion[];
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
      originMeaning: buildStructuredOrigin(item),
      impressionTone: item.impressionTone.trim(),
      residentFitComment: item.residentFitComment.trim(),
      shortEvaluation: item.shortEvaluation.trim(),
      googleSearchUrl: buildGoogleSearchUrl(name),
      trademarkSearchUrl: buildTrademarkSearchUrl(),
    };
  });
}
