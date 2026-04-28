import {
  propertyTypeOptions,
  residentImageOptions,
  trademarkSearchBaseUrl,
  worldConceptOptions,
} from "@/lib/constants";
import { GeneratorInput, NormalizedGeneratorInput } from "@/lib/types";

const romanReadingMap: Record<string, string> = {
  aure: "オーラ",
  luxe: "リュクス",
  vel: "ヴェル",
  crest: "クレスト",
  eto: "エト",
  noir: "ノワール",
  serein: "スラン",
  vale: "ヴェイル",
  axis: "アクシス",
  nex: "ネックス",
  grid: "グリッド",
  forma: "フォルマ",
  lume: "ルーメ",
  core: "コア",
  vela: "ヴェラ",
  mono: "モノ",
  leaf: "リーフ",
  mori: "モリ",
  nagi: "ナギ",
  sora: "ソラ",
  rill: "リル",
  ala: "アーラ",
  bloom: "ブルーム",
  arc: "アーク",
  pulse: "パルス",
  rise: "ライズ",
  loop: "ループ",
  frame: "フレーム",
  line: "ライン",
  knot: "ノット",
  dock: "ドック",
  nico: "ニコ",
  hug: "ハグ",
  coco: "ココ",
  yori: "ヨリ",
  mellow: "メロウ",
  nook: "ヌック",
  mina: "ミナ",
  towa: "トワ",
  one: "ワン",
  shift: "シフト",
  edge: "エッジ",
  lane: "レーン",
  base: "ベース",
  lite: "ライト",
  current: "カレント",
  campus: "キャンパス",
  seed: "シード",
  step: "ステップ",
  note: "ノート",
  bridge: "ブリッジ",
  route: "ルート",
  glow: "グロウ",
  nest: "ネスト",
  warm: "ウォーム",
  garden: "ガーデン",
  hearth: "ハース",
  field: "フィールド",
  bond: "ボンド",
  harbor: "ハーバー",
  grove: "グローブ",
  maison: "メゾン",
  prime: "プライム",
  ciel: "シエル",
  grand: "グラン",
  crown: "クラウン",
  aster: "アスター",
  prest: "プレスト",
  calm: "カーム",
  soma: "ソマ",
  grace: "グレイス",
  ori: "オリ",
  vista: "ヴィスタ",
  serene: "セリーン",
  yu: "ユウ",
  duo: "デュオ",
  scene: "シーン",
  muse: "ミューズ",
  blend: "ブレンド",
  alto: "アルト",
  mode: "モード",
  flux: "フラックス",
  pair: "ペア",
};

const japaneseReadingMap: Record<string, string> = {
  奏: "ソウ",
  紬: "ツムギ",
  雫: "シズク",
  澄: "スミ",
  凪: "ナギ",
  雅: "ミヤビ",
  灯: "アカリ",
  結: "ユイ",
  庵: "アン",
  苑: "エン",
  邸: "テイ",
  楼: "ロウ",
  居: "キョ",
  舎: "シャ",
  荘: "ソウ",
  門: "モン",
};

const romanKeys = Object.keys(romanReadingMap).sort((a, b) => b.length - a.length);

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function makeId(prefix = "id") {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getLabelByValue<T extends string>(
  options: { value: T; label: string }[],
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function normalizeInput(input: GeneratorInput): NormalizedGeneratorInput {
  const propertyTypeLabel =
    input.propertyType === "other"
      ? input.propertyTypeOther?.trim() || "その他"
      : getLabelByValue(propertyTypeOptions, input.propertyType);

  const worldConceptLabel =
    input.worldConcept === "other"
      ? input.worldConceptOther?.trim() || "その他"
      : getLabelByValue(worldConceptOptions, input.worldConcept);

  const residentImageLabel =
    input.residentImage === "other"
      ? input.residentImageOther?.trim() || "その他"
      : getLabelByValue(residentImageOptions, input.residentImage);

  return {
    area: input.area.trim(),
    propertyTypeLabel,
    worldConceptLabel,
    residentImageLabel,
    freeKeywords: input.freeKeywords?.trim() || "",
  };
}

export function buildGoogleSearchUrl(name: string) {
  return `https://www.google.com/search?q=${encodeURIComponent(`${name} マンション`)}`;
}

export function buildTrademarkSearchUrl() {
  return trademarkSearchBaseUrl;
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function splitKeywords(value?: string) {
  return (value || "")
    .split(/[、,\n]/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

function hiraganaToKatakana(text: string) {
  return text.replace(/[ぁ-ゖ]/g, (char) => String.fromCharCode(char.charCodeAt(0) + 0x60));
}

function basicRomanToKatakana(input: string) {
  const lower = input.toLowerCase();
  let rest = lower;
  let result = "";

  while (rest.length > 0) {
    const matchedKey = romanKeys.find((key) => rest.startsWith(key));
    if (matchedKey) {
      result += romanReadingMap[matchedKey];
      rest = rest.slice(matchedKey.length);
      continue;
    }

    const one = rest[0];
    result += one === "-" ? "ー" : one === " " ? " " : "";
    rest = rest.slice(1);
  }

  return result;
}

function replaceJapaneseCharacters(text: string) {
  return Array.from(text)
    .map((char) => japaneseReadingMap[char] ?? char)
    .join("");
}

function keepKatakanaOnly(text: string) {
  return text
    .replace(/[^ァ-ヶー・ヴ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeReadingCandidate(text: string) {
  const converted = hiraganaToKatakana(text)
    .replace(/[A-Za-z][A-Za-z' -]*/g, (token) => basicRomanToKatakana(token));
  const replaced = replaceJapaneseCharacters(converted);
  return keepKatakanaOnly(replaced);
}

export function buildKatakanaReading(name: string, reading?: string) {
  const normalizedReading = normalizeReadingCandidate((reading || "").trim());
  if (normalizedReading) return normalizedReading;

  const normalizedName = normalizeReadingCandidate(name);
  if (normalizedName) return normalizedName;

  return "ヨミカタナシ";
}
