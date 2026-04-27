import { PropertyTypeOption, ResidentImageOption, WorldConceptOption } from "@/lib/types";

export const propertyTypeOptions: { value: PropertyTypeOption; label: string }[] = [
  { value: "apartment", label: "アパート" },
  { value: "mansion", label: "マンション" },
  { value: "other", label: "その他" },
];

export const worldConceptOptions: { value: WorldConceptOption; label: string }[] = [
  { value: "luxury", label: "高級" },
  { value: "modern", label: "モダン" },
  { value: "japanese", label: "和風" },
  { value: "natural", label: "ナチュラル" },
  { value: "urban", label: "都市型" },
  { value: "friendly", label: "親しみやすい" },
  { value: "other", label: "その他" },
];

export const residentImageOptions: { value: ResidentImageOption; label: string }[] = [
  { value: "single_worker", label: "単身社会人" },
  { value: "student", label: "学生" },
  { value: "family", label: "ファミリー" },
  { value: "wealthy", label: "富裕層" },
  { value: "senior", label: "シニア" },
  { value: "dinks", label: "DINKS" },
  { value: "other", label: "その他" },
];

export const initialInput = {
  area: "",
  propertyType: "apartment",
  propertyTypeOther: "",
  worldConcept: "modern",
  worldConceptOther: "",
  residentImage: "single_worker",
  residentImageOther: "",
  freeKeywords: "",
} as const;

export const trademarkSearchBaseUrl = "https://www.j-platpat.inpit.go.jp/";
