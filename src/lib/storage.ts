import { initialInput } from "@/lib/constants";
import { GenerationResult, GeneratorInput, NameSuggestion, SavedNameRecord } from "@/lib/types";
import { buildKatakanaReading } from "@/lib/utils";

export const STORAGE_KEY = "mansion-name-generator-pro:saved-records";
export const INPUT_DRAFT_KEY = "mansion-name-generator-pro:input-draft";
export const LAST_RESULT_KEY = "mansion-name-generator-pro:last-result";

function normalizeSuggestion(suggestion: NameSuggestion): NameSuggestion {
  return {
    ...suggestion,
    reading: buildKatakanaReading(suggestion.name, suggestion.reading),
  };
}

function normalizeRecord(record: SavedNameRecord): SavedNameRecord {
  const allSuggestions = record.allSuggestions.map(normalizeSuggestion);
  const selectedSuggestion = normalizeSuggestion(record.selectedSuggestion);

  return {
    ...record,
    selectedSuggestion,
    allSuggestions,
  };
}

function normalizeResult(result: GenerationResult): GenerationResult {
  return {
    ...result,
    suggestions: result.suggestions.map(normalizeSuggestion),
  };
}

export function getSavedRecords(): SavedNameRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedNameRecord[];
    return Array.isArray(parsed) ? parsed.map(normalizeRecord) : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: SavedNameRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.map(normalizeRecord)));
}

export function upsertSavedRecord(record: SavedNameRecord) {
  const current = getSavedRecords();
  const normalizedRecord = normalizeRecord(record);
  const filtered = current.filter(
    (item) => item.selectedSuggestion.name !== normalizedRecord.selectedSuggestion.name,
  );
  const next = [normalizedRecord, ...filtered];
  saveRecords(next);
  return next;
}

export function removeSavedRecord(savedId: string) {
  const current = getSavedRecords();
  const next = current.filter((item) => item.savedId !== savedId);
  saveRecords(next);
  return next;
}

export function getDraftInput(): GeneratorInput {
  if (typeof window === "undefined") return { ...initialInput };

  try {
    const raw = window.localStorage.getItem(INPUT_DRAFT_KEY);
    if (!raw) return { ...initialInput };
    const parsed = JSON.parse(raw) as Partial<GeneratorInput>;
    return {
      ...initialInput,
      ...parsed,
    };
  } catch {
    return { ...initialInput };
  }
}

export function saveDraftInput(input: GeneratorInput) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(INPUT_DRAFT_KEY, JSON.stringify(input));
}

export function getLastResult(): GenerationResult | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(LAST_RESULT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GenerationResult;
    return parsed && Array.isArray(parsed.suggestions) ? normalizeResult(parsed) : null;
  } catch {
    return null;
  }
}

export function saveLastResult(result: GenerationResult | null) {
  if (typeof window === "undefined") return;

  if (!result) {
    window.localStorage.removeItem(LAST_RESULT_KEY);
    return;
  }

  window.localStorage.setItem(LAST_RESULT_KEY, JSON.stringify(normalizeResult(result)));
}
