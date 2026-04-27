import { NameSuggestion, NormalizedGeneratorInput } from "@/lib/types";
import {
  buildGoogleSearchUrl,
  buildTrademarkSearchUrl,
  makeId,
  splitKeywords,
} from "@/lib/utils";

const conceptRoots: Record<string, string[]> = {
  高級: ["Aure", "Luxe", "Vel", "Crest", "Eto", "Noir", "Serein", "Vale"],
  モダン: ["Axis", "Nex", "Grid", "Forma", "Lume", "Core", "Vela", "Mono"],
  和風: ["奏", "紬", "雫", "澄", "凪", "雅", "灯", "結"],
  ナチュラル: ["Leaf", "Mori", "Nagi", "Vale", "Sora", "Rill", "Ala", "Bloom"],
  都市型: ["Arc", "Pulse", "Rise", "Loop", "Frame", "Line", "Knot", "Dock"],
  親しみやすい: ["Nico", "Hug", "Coco", "Yori", "Mellow", "Nook", "Mina", "Towa"],
};

const residentRoots: Record<string, string[]> = {
  単身社会人: ["One", "Shift", "Edge", "Lane", "Base", "Nook", "Lite", "Current"],
  学生: ["Campus", "Seed", "Step", "Note", "Bridge", "Route", "Glow", "Nest"],
  ファミリー: ["Nest", "Warm", "Garden", "Hearth", "Field", "Bond", "Harbor", "Grove"],
  富裕層: ["Maison", "Prime", "Ciel", "Grand", "Crown", "Aster", "Luxe", "Prest"],
  シニア: ["Calm", "Soma", "Grace", "Ori", "Vista", "Serene", "Knot", "Yu"],
  DINKS: ["Duo", "Scene", "Muse", "Blend", "Alto", "Mode", "Flux", "Pair"],
};

const japaneseSuffixes = ["庵", "苑", "邸", "楼", "居", "舎", "荘", "門"];

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function areaHint(area: string) {
  const compact = area.replace(/[都道府県市区町村郡番地丁目\s]/g, "").slice(0, 3);
  return compact || "都心";
}

function createName(index: number, input: NormalizedGeneratorInput) {
  const conceptSet = conceptRoots[input.worldConceptLabel] || conceptRoots["モダン"];
  const residentSet = residentRoots[input.residentImageLabel] || residentRoots["単身社会人"];
  const baseA = pick(conceptSet, index);
  const baseB = pick(residentSet, index + 2);
  const hint = areaHint(input.area);
  const useJapanese = /和|雅|凪|紬|奏|雫|澄|灯|結/.test(baseA);

  if (useJapanese) {
    return `${hint}${baseA}${pick(japaneseSuffixes, index)}`;
  }

  if (index % 3 === 0) {
    return `${baseA} ${baseB}`;
  }

  if (index % 3 === 1) {
    return `${hint} ${baseA}`;
  }

  return `${baseA}${baseB}`;
}

export function generateMockSuggestions(input: NormalizedGeneratorInput, count = 10): NameSuggestion[] {
  const keywords = splitKeywords(input.freeKeywords);
  const keywordPhrase = keywords.length > 0 ? keywords.slice(0, 3).join("・") : "立地と世界観";

  return Array.from({ length: count }, (_, index) => {
    const name = createName(index, input);
    const reading = /[A-Za-z]/.test(name) ? name : undefined;
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
      name,
      reading,
      originMeaning,
      impressionTone,
      residentFitComment,
      shortEvaluation,
      googleSearchUrl: buildGoogleSearchUrl(name),
      trademarkSearchUrl: buildTrademarkSearchUrl(),
    };
  });
}
