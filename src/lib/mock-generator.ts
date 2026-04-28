import { NameSuggestion, NormalizedGeneratorInput } from "@/lib/types";
import {
  buildGoogleSearchUrl,
  buildKatakanaReading,
  buildTrademarkSearchUrl,
  makeId,
  splitKeywords,
} from "@/lib/utils";

type SourceTerm = {
  language: string;
  word: string;
  meaning: string;
  stem: string;
  reading: string;
};

type JapaneseCloser = {
  stem: string;
  reading: string;
  meaning: string;
};

type BuiltName = {
  name: string;
  reading: string;
  process: string;
  sources: SourceTerm[];
  closer?: JapaneseCloser;
};

const conceptTerms: Record<string, SourceTerm[]> = {
  高級: [
    { language: "フランス語", word: "éclat", meaning: "輝き", stem: "Eclat", reading: "エクラ" },
    { language: "ラテン語", word: "aureus", meaning: "黄金の", stem: "Aure", reading: "オール" },
    { language: "イタリア語", word: "nobile", meaning: "高貴な", stem: "Nobile", reading: "ノービレ" },
    { language: "ドイツ語", word: "wert", meaning: "価値", stem: "Wert", reading: "ヴェルト" },
    { language: "フランス語", word: "luxe", meaning: "贅沢", stem: "Luxe", reading: "リュクス" },
    { language: "英語", word: "prime", meaning: "最上位", stem: "Prime", reading: "プライム" },
  ],
  モダン: [
    { language: "ラテン語", word: "novus", meaning: "新しい", stem: "Nova", reading: "ノヴァ" },
    { language: "英語", word: "axis", meaning: "軸", stem: "Axis", reading: "アクシス" },
    { language: "イタリア語", word: "forma", meaning: "形", stem: "Forma", reading: "フォルマ" },
    { language: "ドイツ語", word: "linie", meaning: "線", stem: "Linie", reading: "リーニエ" },
    { language: "フランス語", word: "cadre", meaning: "枠組み", stem: "Cadre", reading: "カードル" },
    { language: "英語", word: "frame", meaning: "骨格", stem: "Frame", reading: "フレーム" },
  ],
  和風: [
    { language: "日本語", word: "紬", meaning: "糸を紡いで織ること", stem: "紬", reading: "ツムギ" },
    { language: "日本語", word: "凪", meaning: "風がやんだ穏やかな海", stem: "凪", reading: "ナギ" },
    { language: "日本語", word: "雅", meaning: "上品で洗練されたさま", stem: "雅", reading: "ミヤビ" },
    { language: "日本語", word: "澄", meaning: "にごりなく澄むこと", stem: "澄", reading: "スミ" },
    { language: "日本語", word: "結", meaning: "つながりを結ぶこと", stem: "結", reading: "ユイ" },
    { language: "日本語", word: "奏", meaning: "調和してかなでること", stem: "奏", reading: "ソウ" },
  ],
  ナチュラル: [
    { language: "ラテン語", word: "silva", meaning: "森", stem: "Silva", reading: "シルヴァ" },
    { language: "イタリア語", word: "verde", meaning: "緑", stem: "Verde", reading: "ヴェルデ" },
    { language: "英語", word: "leaf", meaning: "葉", stem: "Leaf", reading: "リーフ" },
    { language: "フランス語", word: "aube", meaning: "夜明け", stem: "Aube", reading: "オーブ" },
    { language: "スペイン語", word: "brisa", meaning: "そよ風", stem: "Brisa", reading: "ブリーサ" },
    { language: "ドイツ語", word: "wald", meaning: "森", stem: "Wald", reading: "ヴァルト" },
  ],
  都市型: [
    { language: "ラテン語", word: "urbs", meaning: "都市", stem: "Urbis", reading: "ウルビス" },
    { language: "英語", word: "grid", meaning: "都市網・格子", stem: "Grid", reading: "グリッド" },
    { language: "フランス語", word: "arc", meaning: "弧・アーチ", stem: "Arc", reading: "アーク" },
    { language: "ドイツ語", word: "takt", meaning: "拍・規律", stem: "Takt", reading: "タクト" },
    { language: "英語", word: "pulse", meaning: "鼓動", stem: "Pulse", reading: "パルス" },
    { language: "イタリア語", word: "linea", meaning: "線", stem: "Linea", reading: "リネア" },
  ],
  親しみやすい: [
    { language: "イタリア語", word: "casa", meaning: "家", stem: "Casa", reading: "カーサ" },
    { language: "フランス語", word: "ami", meaning: "友", stem: "Ami", reading: "アミ" },
    { language: "スペイン語", word: "nido", meaning: "巣", stem: "Nido", reading: "ニド" },
    { language: "英語", word: "mellow", meaning: "やわらかな", stem: "Mellow", reading: "メロウ" },
    { language: "日本語", word: "和", meaning: "なごやかさ", stem: "和", reading: "ナゴミ" },
    { language: "ドイツ語", word: "freund", meaning: "友", stem: "Freund", reading: "フロイント" },
  ],
};

const residentTerms: Record<string, SourceTerm[]> = {
  単身社会人: [
    { language: "英語", word: "shift", meaning: "切り替え・機動", stem: "Shift", reading: "シフト" },
    { language: "英語", word: "base", meaning: "拠点", stem: "Base", reading: "ベース" },
    { language: "英語", word: "edge", meaning: "先端", stem: "Edge", reading: "エッジ" },
    { language: "ドイツ語", word: "bahn", meaning: "軌道・道筋", stem: "Bahn", reading: "バーン" },
    { language: "英語", word: "lane", meaning: "通り道", stem: "Lane", reading: "レーン" },
    { language: "ラテン語", word: "focus", meaning: "焦点", stem: "Focus", reading: "フォーカス" },
  ],
  学生: [
    { language: "英語", word: "seed", meaning: "種", stem: "Seed", reading: "シード" },
    { language: "英語", word: "note", meaning: "記録", stem: "Note", reading: "ノート" },
    { language: "英語", word: "route", meaning: "道筋", stem: "Route", reading: "ルート" },
    { language: "英語", word: "bridge", meaning: "橋渡し", stem: "Bridge", reading: "ブリッジ" },
    { language: "ラテン語", word: "origo", meaning: "起点", stem: "Origo", reading: "オリゴ" },
    { language: "ドイツ語", word: "lernen", meaning: "学ぶ", stem: "Lern", reading: "レルン" },
  ],
  ファミリー: [
    { language: "英語", word: "bond", meaning: "絆", stem: "Bond", reading: "ボンド" },
    { language: "英語", word: "harbor", meaning: "港・安心できる場所", stem: "Harbor", reading: "ハーバー" },
    { language: "英語", word: "hearth", meaning: "家庭の炉辺", stem: "Hearth", reading: "ハース" },
    { language: "スペイン語", word: "lazo", meaning: "結びつき", stem: "Lazo", reading: "ラソ" },
    { language: "日本語", word: "結", meaning: "つながり", stem: "結", reading: "ユイ" },
    { language: "イタリア語", word: "porto", meaning: "港", stem: "Porto", reading: "ポルト" },
  ],
  富裕層: [
    { language: "英語", word: "crown", meaning: "冠", stem: "Crown", reading: "クラウン" },
    { language: "フランス語", word: "ciel", meaning: "空", stem: "Ciel", reading: "シエル" },
    { language: "フランス語", word: "grand", meaning: "壮大な", stem: "Grand", reading: "グラン" },
    { language: "ラテン語", word: "regius", meaning: "王侯の", stem: "Regi", reading: "レジ" },
    { language: "イタリア語", word: "alto", meaning: "高い", stem: "Alto", reading: "アルト" },
    { language: "ドイツ語", word: "krone", meaning: "王冠", stem: "Krone", reading: "クローネ" },
  ],
  シニア: [
    { language: "英語", word: "calm", meaning: "穏やか", stem: "Calm", reading: "カーム" },
    { language: "英語", word: "grace", meaning: "品位", stem: "Grace", reading: "グレイス" },
    { language: "ラテン語", word: "vista", meaning: "眺望", stem: "Vista", reading: "ヴィスタ" },
    { language: "日本語", word: "結", meaning: "つながり", stem: "結", reading: "ユイ" },
    { language: "フランス語", word: "repos", meaning: "休息", stem: "Repos", reading: "ルポ" },
    { language: "イタリア語", word: "sereno", meaning: "晴朗な", stem: "Sereno", reading: "セレーノ" },
  ],
  DINKS: [
    { language: "イタリア語", word: "duo", meaning: "二人組", stem: "Duo", reading: "デュオ" },
    { language: "英語", word: "scene", meaning: "場面・都市の空気", stem: "Scene", reading: "シーン" },
    { language: "フランス語", word: "mode", meaning: "流儀・流行", stem: "Mode", reading: "モード" },
    { language: "英語", word: "muse", meaning: "創造の源", stem: "Muse", reading: "ミューズ" },
    { language: "ドイツ語", word: "paar", meaning: "二人", stem: "Paar", reading: "パール" },
    { language: "スペイン語", word: "ritmo", meaning: "リズム", stem: "Ritmo", reading: "リトモ" },
  ],
};

const supportTerms: SourceTerm[] = [
  { language: "フランス語", word: "clair", meaning: "明るい", stem: "Clair", reading: "クレール" },
  { language: "ドイツ語", word: "licht", meaning: "光", stem: "Licht", reading: "リヒト" },
  { language: "ラテン語", word: "origo", meaning: "起点", stem: "Origo", reading: "オリゴ" },
  { language: "イタリア語", word: "luce", meaning: "光", stem: "Luce", reading: "ルーチェ" },
  { language: "スペイン語", word: "brisa", meaning: "そよ風", stem: "Brisa", reading: "ブリーサ" },
  { language: "英語", word: "frame", meaning: "骨格", stem: "Frame", reading: "フレーム" },
  { language: "フランス語", word: "trace", meaning: "軌跡", stem: "Trace", reading: "トラース" },
  { language: "ドイツ語", word: "stern", meaning: "星", stem: "Stern", reading: "シュテルン" },
  { language: "イタリア語", word: "canto", meaning: "歌・節", stem: "Canto", reading: "カント" },
  { language: "ラテン語", word: "via", meaning: "道", stem: "Via", reading: "ヴィア" },
];

const japaneseClosers: JapaneseCloser[] = [
  { stem: "庵", reading: "アン", meaning: "静かな住まい" },
  { stem: "苑", reading: "エン", meaning: "やわらかな居住環境" },
  { stem: "邸", reading: "テイ", meaning: "私的で上質な住まい" },
  { stem: "居", reading: "キョ", meaning: "住まう場所" },
  { stem: "舎", reading: "シャ", meaning: "人が集う建物" },
];

const impressionTemplates = [
  "語感を引き締めつつ、募集図面でも説明が立つトーン。",
  "海外語感はあるが嫌味がなく、品格が先に立つ印象。",
  "造語感を残しながら、読みのストレスを抑えたトーン。",
  "尖りすぎず、企画物件としての独自性が伝わる響き。",
  "重厚さより設計思想が先に伝わる、知的なトーン。",
  "高級一辺倒に逃げず、由来の強さで印象を残すトーン。",
  "柔らかさと都市性の中間に置いた、説明しやすい響き。",
  "短く覚えやすいが、背景を語ると深みが増すトーン。",
  "言葉の由来が会話の入口になりやすい、提案向きのトーン。",
  "外国語の気配を残しつつ、日本の賃貸名として着地させたトーン。",
];

const fitTemplates = [
  "世界観と居住者像を一文で結びやすく、営業現場で説明軸がぶれにくい名称です。",
  "募集図面でも口頭提案でも扱いやすく、ターゲット像の説明がしやすい名称です。",
  "入居者の暮らし方と物件の印象設計を同時に伝えやすい名称です。",
  "品の良さを保ちながら、差別化の理由まで話せる名称です。",
  "立地の個性とターゲット像をつなげて語りやすい名称です。",
  "Web掲載でも紙資料でも読みやすく、固有名として残りやすい名称です。",
  "安直な高級感ではなく、暮らしの解像度で魅力を伝えやすい名称です。",
  "ターゲットの生活イメージに寄り添いながら、ネーミングの独自性も確保できます。",
  "語源説明を添えることで、企画意図のある物件名として見せやすい名称です。",
  "類似物件との差を、響きと由来の両面から作りやすい名称です。",
];

const evaluationTemplates = [
  "語源説明まで含めて提案しやすい。",
  "直訳と造語工程が明快で強い。",
  "語感が立ち、一覧比較で埋もれにくい。",
  "意味があり、記名性も高い。",
  "読みやすく、企画名として映える。",
  "上品だが凡庸に寄らない。",
  "響きと説明の両輪がある。",
  "差別化理由を言葉で示しやすい。",
  "造語だが無理がなく実務向き。",
  "由来の濃さで印象を残せる。",
];

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function getConceptPool(label: string) {
  return conceptTerms[label] || conceptTerms["モダン"];
}

function getResidentPool(label: string) {
  return residentTerms[label] || residentTerms["単身社会人"];
}

function softenTail(stem: string) {
  return stem.replace(/[aeiou]$/i, "");
}

function keywordHook(input: NormalizedGeneratorInput) {
  const keywords = splitKeywords(input.freeKeywords);
  return keywords[0]
    ? `自由キーワードの「${keywords[0]}」とも説明をつなげやすくしています。`
    : "入力条件全体と自然につながるように設計しています。";
}

function buildOriginMeaning(input: NormalizedGeneratorInput, built: BuiltName) {
  const primary = built.sources[0];
  const secondary = built.sources[1];
  const secondaryLine = secondary
    ? `補助語源: ${secondary.language}の「${secondary.word}」= 直訳: ${secondary.meaning}。名前に重ねたのは${secondary.meaning}という意味の芯です。`
    : built.closer
      ? `補助語源: 日本語の「${built.closer.stem}」= 直訳: ${built.closer.meaning}。外来語だけで浮かないよう、日本語の住まい語感を足しています。`
      : "補助語源: 入力条件に沿う補助語を置かず、主要語源の意味を前面に出しています。";

  return [
    `主要語源: ${primary.language}の「${primary.word}」= 直訳: ${primary.meaning}。この語の意味合いを名前の核に置いています。`,
    secondaryLine,
    `造語処理: ${built.process}ことで造語化し、表記は「${built.name}」、読みは「${built.reading}」に整えました。`,
    `採用理由: ${input.worldConceptLabel}の世界観と${input.residentImageLabel}の居住者像を同時に説明しやすく、エリア「${input.area}」での訴求にも意味づけしやすい構成です。${keywordHook(input)}`,
  ].join("\n");
}

function buildStrategies(index: number, input: NormalizedGeneratorInput): BuiltName {
  const concept = pick(getConceptPool(input.worldConceptLabel), index);
  const resident = pick(getResidentPool(input.residentImageLabel), index + 2);
  const support = pick(supportTerms, index + 4);
  const closer = pick(japaneseClosers, index);

  const strategies = [
    (): BuiltName => ({
      name: `${concept.stem}${resident.stem}`,
      reading: `${concept.reading}${resident.reading}`,
      process: `${concept.stem}と${resident.stem}をそのまま接続し、意味の軸を二語融合で立たせた`,
      sources: [concept, resident],
    }),
    (): BuiltName => ({
      name: `${softenTail(concept.stem)}${support.stem}`,
      reading: `${concept.reading}${support.reading}`,
      process: `${concept.stem}の語尾を一音丸めて${support.stem}を接続し、発音を軽く整えた`,
      sources: [concept, support],
    }),
    (): BuiltName => ({
      name: `${support.stem}${closer.stem}`,
      reading: `${support.reading}${closer.reading}`,
      process: `${support.stem}の外来語感に${closer.stem}を足し、日本語の居住名として着地させた`,
      sources: [support],
      closer,
    }),
    (): BuiltName => ({
      name: `${resident.stem}${concept.stem}`,
      reading: `${resident.reading}${concept.reading}`,
      process: `${resident.stem}を先頭に反転配置し、ターゲット像から先に印象が立つよう再構成した`,
      sources: [resident, concept],
    }),
    (): BuiltName => ({
      name: `${concept.stem} ${support.stem}`,
      reading: `${concept.reading} ${support.reading}`,
      process: `${concept.stem}と${support.stem}を分かち書きし、意味の二層構造を読み取りやすくした`,
      sources: [concept, support],
    }),
    (): BuiltName => ({
      name: `${softenTail(support.stem)}${resident.stem}`,
      reading: `${support.reading}${resident.reading}`,
      process: `${support.stem}の語尾を削って${resident.stem}へ滑らかに接続し、ソフトな造語感に寄せた`,
      sources: [support, resident],
    }),
    (): BuiltName => ({
      name: `${concept.stem}${closer.stem}`,
      reading: `${concept.reading}${closer.reading}`,
      process: `${concept.stem}に${closer.stem}を添え、外来語の輪郭を残しつつ和名として収めた`,
      sources: [concept],
      closer,
    }),
    (): BuiltName => ({
      name: `${resident.stem} ${closer.stem}`,
      reading: `${resident.reading} ${closer.reading}`,
      process: `${resident.stem}に${closer.stem}を合わせ、居住者像を起点にした余韻ある名称へ圧縮した`,
      sources: [resident],
      closer,
    }),
    (): BuiltName => ({
      name: `${support.stem}${concept.stem}${closer.stem}`,
      reading: `${support.reading}${concept.reading}${closer.reading}`,
      process: `${support.stem}を導入語に置き、${concept.stem}と${closer.stem}を段階接続して三層の造語にした`,
      sources: [support, concept],
      closer,
    }),
    (): BuiltName => ({
      name: `${concept.stem}・${resident.stem}`,
      reading: `${concept.reading}・${resident.reading}`,
      process: `${concept.stem}と${resident.stem}を中点で切り、意味の出どころを視覚的にも分けて見せた`,
      sources: [concept, resident],
    }),
  ];

  return strategies[index % strategies.length]();
}

export function generateMockSuggestions(input: NormalizedGeneratorInput, count = 10): NameSuggestion[] {
  return Array.from({ length: count }, (_, index) => {
    const built = buildStrategies(index, input);
    const name = built.name.trim();

    return {
      id: makeId("suggestion"),
      name,
      reading: buildKatakanaReading(name, built.reading),
      originMeaning: buildOriginMeaning(input, built),
      impressionTone: impressionTemplates[index % impressionTemplates.length],
      residentFitComment: fitTemplates[index % fitTemplates.length],
      shortEvaluation: evaluationTemplates[index % evaluationTemplates.length],
      googleSearchUrl: buildGoogleSearchUrl(name),
      trademarkSearchUrl: buildTrademarkSearchUrl(),
    };
  });
}
