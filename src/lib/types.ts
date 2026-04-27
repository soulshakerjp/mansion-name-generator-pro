export type PropertyTypeOption = "apartment" | "mansion" | "other";

export type WorldConceptOption =
  | "luxury"
  | "modern"
  | "japanese"
  | "natural"
  | "urban"
  | "friendly"
  | "other";

export type ResidentImageOption =
  | "single_worker"
  | "student"
  | "family"
  | "wealthy"
  | "senior"
  | "dinks"
  | "other";

export type GeneratorInput = {
  area: string;
  propertyType: PropertyTypeOption;
  propertyTypeOther?: string;
  worldConcept: WorldConceptOption;
  worldConceptOther?: string;
  residentImage: ResidentImageOption;
  residentImageOther?: string;
  freeKeywords?: string;
};

export type NormalizedGeneratorInput = {
  area: string;
  propertyTypeLabel: string;
  worldConceptLabel: string;
  residentImageLabel: string;
  freeKeywords: string;
};

export type NameSuggestion = {
  id: string;
  name: string;
  reading?: string;
  originMeaning: string;
  impressionTone: string;
  residentFitComment: string;
  shortEvaluation: string;
  googleSearchUrl: string;
  trademarkSearchUrl: string;
  isSaved?: boolean;
};

export type GenerationResult = {
  generationId: string;
  createdAt: string;
  input: GeneratorInput;
  suggestions: NameSuggestion[];
};

export type SavedNameRecord = {
  savedId: string;
  savedAt: string;
  input: GeneratorInput;
  selectedSuggestionId: string;
  selectedSuggestion: NameSuggestion;
  allSuggestions: NameSuggestion[];
};
