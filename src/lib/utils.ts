import {
  propertyTypeOptions,
  residentImageOptions,
  trademarkSearchBaseUrl,
  worldConceptOptions,
} from "@/lib/constants";
import { GeneratorInput, NormalizedGeneratorInput } from "@/lib/types";

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
