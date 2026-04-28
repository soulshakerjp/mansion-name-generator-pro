import { NameSuggestion, NormalizedGeneratorInput } from "@/lib/types";
import {
  buildGoogleSearchUrl,
  buildTrademarkSearchUrl,
  makeId,
  splitKeywords,
} from "@/lib/utils";

const conceptRoots: Record<string, { name: string; reading: string }[]> = {
  高級: [
    { name: "Aure", reading: "オーラ" },
    { name: "Luxe", reading: "リュクス" },
    { name: "Vel", reading: "ヴェル" },
    { name: "Crest", reading: "クレスト" },
    { name: "Eto", reading: "エト" },
    { name: "Noir", reading: "ノワール" },
    { name: "Serein", reading: "スラン" },
    { name: "Vale", reading: "ヴェイル" },
  ],
  モダン: [
    { name: "Axis", reading: "アクシス" },
    { name: "Nex", reading: "ネックス" },
    { name: "Grid", reading: "グリッド" },
    { name: "Forma", reading: "フォルマ" },
    { name: "Lume", reading: "ルーメ" },
    { name: "Core", reading: "コア" },
    { name: "Vela", reading: "ヴェラ" },
    { name: "Mono", reading: "モノ" },
  ],
  和風: [
    { name: "奏", reading: "ソウ" },
    { name: "紬", reading: "ツムギ" },
    { name: "雫", reading: "シズク" },
    { name: "澄", reading: "スミ" },
    { name: "凪", reading: "ナギ" },
    { name: "雅", reading: "ミヤビ" },
    { name: "灯", reading: "アカリ" },
    { name: "結", reading: "ユイ" },
  ],
  ナチュラル: [
    { name: "Leaf", reading: "リーフ" },
    { name: "Mori", reading: "モリ" },
    { name: "Nagi", reading: "ナギ" },
    { name: "Vale", reading: "ヴェイル" },
    { name: "Sora", reading: "ソラ" },
    { name: "Rill", reading: "リル" },
    { name: "Ala", reading: "アーラ" },
    { name: "Bloom", reading: "ブルーム" },
  ],
  都市型: [
    { name: "Arc", reading: "アーク" },
    { name: "Pulse", reading: "パルス" },
    { name: "Rise", reading: "ライズ" },
    { name: "Loop", reading: "ループ" },
    { name: "Frame", reading: "フレーム" },
    { name: "Line", reading: "ライン" },
    { name: "Knot", reading: "ノット" },
    { name: "Dock", reading: "ドック" },
  ],
  親しみやすい: [
    { name: "Nico", reading: "ニコ" },
    { name: "Hug", reading: "ハグ" },
    { name: "Coco", reading: "ココ" },
    { name: "Yori", reading: "ヨリ" },
    { name: "Mellow", reading: "メロウ" },
    { name: "Nook", reading: "ヌック" },
    { name: "Mina", reading: "ミナ" },
    { name: "Towa", reading: "トワ" },
  ],
};

const residentRoots: Record<string, { name: string; reading: string }[]> = {
  単身社会人: [
    { name: "One", reading: "ワン" },
    { name: "Shift", reading: "シフト" },
    { name: "Edge", reading: "エッジ" },
    { name: "Lane", reading: "レーン" },
    { name: "Base", reading: "ベース" },
    { name: "Nook", reading: "ヌック" },
    { name: "Lite", reading: "ライト" },
    { name: "Current", reading: "カレント" },
  ],
  学生: [
    { name: "Campus", reading: "キャンパス" },
    { name: "Seed", reading: "シード" },
    { name: "Step", reading: "ステップ" },
    { name: "Note", reading: "ノート" },
    { name: "Bridge", reading: "ブリッジ" },
    { name: "Route", reading: "ルート" },
    { name: "Glow", reading: "グロウ" },
    { name: "Nest", reading: "ネスト" },
  ],
  ファミリー: [
    { name: "Nest", reading: "ネスト" },
    { name: "Warm", reading: "ウォーム" },
    { name: "Garden", reading: "ガーデン" },
    { name: "Hearth", reading: "ハース" },
    { name: "Field", reading: "フィールド" },
    { name: "Bond", reading: "ボンド" },
    { name: "Harbor", reading: "ハーバー" },
    { name: "Grove", reading: "グローブ" },
  ],
  富裕層: [
    { name: "Maison", reading: "メゾン" },
    { name: "Prime", reading: "プライム" },
    { name: "Ciel", reading: "シエル" },
    { name: "Grand", reading: "グラン" },
    { name: "Crown", reading: "クラウン" },
    { name: "Aster", reading: "アスター" },
    { name: "Luxe", reading: "リュクス" },
    { name: "Prest", reading: "プレスト" },
  ],
  シニア: [
    { name: "Calm", reading: "カーム" },
    { name: "Soma", reading: "ソマ" },
    { name: "Grace", reading: "グレイス" },
    { name: "Ori", reading: "オリ" },
    { name: "Vista", reading: "ヴィスタ" },
    { name: "Serene", reading: "セリーン" },
    { name: "Knot", reading: "ノット" },
    { name: "Yu", reading: "ユウ" },
  ],
  DINKS: [
    { name: "Duo", reading: "デュオ" },
    { name: "Scene", reading: "シーン" },
    { name: "Muse", reading: "ミューズ" },
    { name: "Blend", reading: "ブレンド" },
    { name: "Alto", reading: "アルト" },
    { name: "Mode", reading: "モード" },
    { name: "Flux", reading: "フラックス" },
    { name: "Pair", reading: "ペア" },
  ],
};

const japaneseSuffixes = [
  { name: "庵", reading: "アン" },
  { name: "苑", reading: "エン" },
  { name: "邸", reading: "テイ" },
  { name: "楼", reading: "ロウ" },
  { name: "居", reading: "キョ" },
  { name: "舎", reading: "シャ" },
  { name: "荘", reading: "ソウ" },
  { name: "門", reading: "モン" },
];

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function createNamePair(index: number, input: NormalizedGeneratorInput) {
  const conceptSet = conceptRoots[input.worldConceptLabel] || conceptRoots["モダン"];
  const residentSet = residentRoots[input.residentImageLabel] || residentRoots["単身社会人"];
  const baseA = pick(conceptSet, index);
  const baseB = pick(residentSet, index + 2);
  const useJapanese = ["和風"].includes(input.worldConceptLabel);

  if (useJapanese) {
    const suffix = pick(japaneseSuffixes, index);
    return {
      name: `${baseA.name}${suffix.name}`,
      reading: `${baseA.reading}${suffix.reading}`,
    };
  }

  if (index % 3 === 0) {
    return {
      name: `${baseA.name} ${baseB.name}`,
      reading: `${baseA.reading} ${baseB.reading}`,
    };
  }

  if (index % 3 === 1) {
    return {
      name: `${baseA.name}${baseB.name}`,
      reading: `${baseA.reading}${baseB.reading}`,
    };
  }

  return {
    name: `${baseB.name} ${baseA.name}`,
    reading: `${baseB.reading} ${baseA.reading}`,
  };
}

export function generateMockSuggestions(input: NormalizedGeneratorInput, count = 10): NameSuggestion[] {
  const keywords = splitKeywords(input.freeKeywords);
  const keywordPhrase = keywords.length > 0 ? keywords.slice(0, 3).join("・") : "立地と世界観";

  return Array.from({ length: count }, (_, index) => {
    const pair = createNamePair(index, input);
    const originMeaning = `${input.area}の空気感と「${input.worldConceptLabel}」の世界観、さらに「${input.residentImageLabel}」に響く印象を起点に設計した名称です。${keywordPhrase}の要素を、直訳ではなく余韻として乗せています。`;
    const impressionTone = `${input.worldConceptLabel}を基調に、${index % 2 === 0 ? "洗練" : "温度感"}を残したトーン。ありきたりな賃貸名称より一段だけ印象を立てる設計です。`;
    const residentFitComment = `${input.residentImageLabel}が無理なく受け入れやすく、募集図面や提案資料でもコンセプト説明がしやすい名称です。`;
    const shortEvaluation =
      index % 3 === 0
        ? "提案資料に載せやすく、品も残る。"
        : index % 3 === 1
          ? "斬新さと実務安全性のバランスがよい。"
          : "既視感を避けつつ、読みやすさも確保。";

    return {
      id: makeId("suggestion"),
      name: pair.name,
      reading: pair.reading,
      originMeaning,
      impressionTone,
      residentFitComment,
      shortEvaluation,
      googleSearchUrl: buildGoogleSearchUrl(pair.name),
      trademarkSearchUrl: buildTrademarkSearchUrl(),
    };
  });
}
