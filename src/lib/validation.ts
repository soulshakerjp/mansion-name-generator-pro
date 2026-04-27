import { GeneratorInput } from "@/lib/types";

export type ValidationErrors = Partial<Record<keyof GeneratorInput, string>>;

const MAX_LENGTHS = {
  area: 100,
  propertyTypeOther: 50,
  worldConceptOther: 50,
  residentImageOther: 50,
  freeKeywords: 200,
} as const;

export function validateInput(input: GeneratorInput): ValidationErrors {
  const errors: ValidationErrors = {};

  if (!input.area.trim()) {
    errors.area = "エリアは必須です。";
  } else if (input.area.trim().length > MAX_LENGTHS.area) {
    errors.area = `エリアは${MAX_LENGTHS.area}文字以内で入力してください。`;
  }

  if (input.propertyType === "other") {
    if (!input.propertyTypeOther?.trim()) {
      errors.propertyTypeOther = "物件タイプ（自由入力）は必須です。";
    } else if (input.propertyTypeOther.trim().length > MAX_LENGTHS.propertyTypeOther) {
      errors.propertyTypeOther = `物件タイプ（自由入力）は${MAX_LENGTHS.propertyTypeOther}文字以内で入力してください。`;
    }
  }

  if (input.worldConcept === "other") {
    if (!input.worldConceptOther?.trim()) {
      errors.worldConceptOther = "世界観コンセプト（自由入力）は必須です。";
    } else if (input.worldConceptOther.trim().length > MAX_LENGTHS.worldConceptOther) {
      errors.worldConceptOther = `世界観コンセプト（自由入力）は${MAX_LENGTHS.worldConceptOther}文字以内で入力してください。`;
    }
  }

  if (input.residentImage === "other") {
    if (!input.residentImageOther?.trim()) {
      errors.residentImageOther = "居住者イメージ（自由入力）は必須です。";
    } else if (input.residentImageOther.trim().length > MAX_LENGTHS.residentImageOther) {
      errors.residentImageOther = `居住者イメージ（自由入力）は${MAX_LENGTHS.residentImageOther}文字以内で入力してください。`;
    }
  }

  if ((input.freeKeywords || "").trim().length > MAX_LENGTHS.freeKeywords) {
    errors.freeKeywords = `自由キーワードは${MAX_LENGTHS.freeKeywords}文字以内で入力してください。`;
  }

  return errors;
}
