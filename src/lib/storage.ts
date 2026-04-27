import { SavedNameRecord } from "@/lib/types";

export const STORAGE_KEY = "mansion-name-generator-pro:saved-records";

export function getSavedRecords(): SavedNameRecord[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedNameRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRecords(records: SavedNameRecord[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function upsertSavedRecord(record: SavedNameRecord) {
  const current = getSavedRecords();
  const filtered = current.filter(
    (item) => item.selectedSuggestion.name !== record.selectedSuggestion.name,
  );
  const next = [record, ...filtered];
  saveRecords(next);
  return next;
}

export function removeSavedRecord(savedId: string) {
  const current = getSavedRecords();
  const next = current.filter((item) => item.savedId !== savedId);
  saveRecords(next);
  return next;
}
