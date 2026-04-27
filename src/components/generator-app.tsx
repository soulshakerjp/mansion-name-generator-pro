"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { FormField } from "@/components/form-field";
import { OptionCards } from "@/components/option-cards";
import { ResultCard } from "@/components/result-card";
import {
  initialInput,
  propertyTypeOptions,
  residentImageOptions,
  worldConceptOptions,
} from "@/lib/constants";
import { getSavedRecords, removeSavedRecord, upsertSavedRecord } from "@/lib/storage";
import { GeneratorInput, GenerationResult, SavedNameRecord } from "@/lib/types";
import { cn, formatDateTime, makeId, normalizeInput } from "@/lib/utils";
import { validateInput, ValidationErrors } from "@/lib/validation";

export function GeneratorApp() {
  const [input, setInput] = useState<GeneratorInput>({ ...initialInput });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [savedRecords, setSavedRecords] = useState<SavedNameRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setSavedRecords(getSavedRecords());
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const savedNames = useMemo(
    () => new Set(savedRecords.map((record) => record.selectedSuggestion.name)),
    [savedRecords],
  );

  function updateField<K extends keyof GeneratorInput>(key: K, value: GeneratorInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validateInput(input);
    setErrors(nextErrors);
    setApiError(null);

    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      });

      const data = (await response.json()) as GenerationResult | { error?: string };

      if (!response.ok || !("suggestions" in data)) {
        throw new Error(data && "error" in data ? data.error : "生成に失敗しました。");
      }

      setResult(data);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : "生成に失敗しました。");
    } finally {
      setLoading(false);
    }
  }

  function handleSave(suggestionId: string) {
    if (!result) return;
    const selectedSuggestion = result.suggestions.find((item) => item.id === suggestionId);
    if (!selectedSuggestion) return;

    const record: SavedNameRecord = {
      savedId: makeId("saved"),
      savedAt: new Date().toISOString(),
      input: result.input,
      selectedSuggestionId: selectedSuggestion.id,
      selectedSuggestion,
      allSuggestions: result.suggestions,
    };

    const next = upsertSavedRecord(record);
    setSavedRecords(next);
  }

  function handleUnsaveByName(name: string) {
    const target = savedRecords.find((record) => record.selectedSuggestion.name === name);
    if (!target) return;
    const next = removeSavedRecord(target.savedId);
    setSavedRecords(next);
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_48%,#f8fafc_100%)] pb-12">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-5 rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-xl shadow-slate-200/60 backdrop-blur sm:mb-8 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-semibold tracking-[0.22em] text-emerald-700 uppercase">
                  Mansion Name Generator Pro
                </span>
                <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                  株式会社宮永不動産 制作
                </span>
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  物件の世界観から、
                  <span className="text-emerald-700">由来のある斬新なネーミング</span>
                  を設計する
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                  投資用一棟アパート・マンション向け。よくある語尾の量産ではなく、コンセプトと居住者像から由来を設計し、提案資料にそのまま載せられる候補を10案生成します。
                </p>
              </div>
            </div>
            <div className="grid w-full gap-3 sm:grid-cols-2 lg:w-auto lg:min-w-[320px]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                保存済み <span className="font-semibold text-slate-950">{savedRecords.length}</span> 件
              </div>
              <Link
                href="/saved"
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-emerald-600 bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 active:scale-[0.99]"
              >
                保存一覧を見る
              </Link>
            </div>
          </div>
        </header>

        <div className="grid gap-5 lg:gap-8 xl:grid-cols-[400px_minmax(0,1fr)]">
          <section className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-6">
            <div className="mb-6 space-y-2">
              <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">基本入力フォーム</h2>
              <p className="text-sm leading-6 text-slate-500">
                スマホでも使いやすいよう、入力は少なく絞っています。まずは世界観の芯だけ決めれば十分です。
              </p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <FormField label="エリア" required error={errors.area}>
                <input
                  value={input.area}
                  onChange={(event) => updateField("area", event.target.value)}
                  placeholder="例：福井市中央、渋谷区代官山、京都市左京区"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                />
              </FormField>

              <FormField label="物件タイプ" required error={errors.propertyTypeOther}>
                <OptionCards
                  options={propertyTypeOptions}
                  value={input.propertyType}
                  onChange={(value) => updateField("propertyType", value)}
                />
                {input.propertyType === "other" ? (
                  <input
                    value={input.propertyTypeOther || ""}
                    onChange={(event) => updateField("propertyTypeOther", event.target.value)}
                    placeholder="例：別荘、ヴィラ型賃貸、テラスハウス"
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                  />
                ) : null}
              </FormField>

              <FormField label="世界観コンセプト" required error={errors.worldConceptOther}>
                <OptionCards
                  options={worldConceptOptions}
                  value={input.worldConcept}
                  onChange={(value) => updateField("worldConcept", value)}
                />
                {input.worldConcept === "other" ? (
                  <input
                    value={input.worldConceptOther || ""}
                    onChange={(event) => updateField("worldConceptOther", event.target.value)}
                    placeholder="例：北欧、ホテルライク、クラシック"
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                  />
                ) : null}
              </FormField>

              <FormField label="居住者イメージ" required error={errors.residentImageOther}>
                <OptionCards
                  options={residentImageOptions}
                  value={input.residentImage}
                  onChange={(value) => updateField("residentImage", value)}
                />
                {input.residentImage === "other" ? (
                  <input
                    value={input.residentImageOther || ""}
                    onChange={(event) => updateField("residentImageOther", event.target.value)}
                    placeholder="例：二拠点生活者、クリエイター層"
                    className="mt-3 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                  />
                ) : null}
              </FormField>

              <FormField
                label="自由キーワード"
                hint="駅近、文教地区、再開発、桜並木、眺望、閑静、洗練、温かみ、ホテルライク など"
                error={errors.freeKeywords}
              >
                <textarea
                  value={input.freeKeywords || ""}
                  onChange={(event) => updateField("freeKeywords", event.target.value)}
                  placeholder="例：駅近、再開発、洗練、ホテルライク"
                  rows={4}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500"
                />
              </FormField>

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full rounded-2xl px-5 py-4 text-base font-semibold text-white shadow-lg transition active:scale-[0.99]",
                  loading ? "bg-slate-400 shadow-slate-300" : "bg-emerald-600 shadow-emerald-600/25 hover:bg-emerald-500",
                )}
              >
                {loading ? "候補を生成中..." : "ネーミング案を10件生成する"}
              </button>

              {apiError ? <p className="text-sm text-rose-600">{apiError}</p> : null}
            </form>
          </section>

          <section className="space-y-5 sm:space-y-6">
            <div className="rounded-[28px] border border-white/70 bg-white/92 p-5 shadow-xl shadow-slate-200/60 backdrop-blur sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">生成結果</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    由来設計 → 命名 → 実務コメントまで一気に出します。雑な語尾量産は、ここでは採用しません。
                  </p>
                </div>
                {result ? (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {formatDateTime(result.createdAt)} に {result.suggestions.length}件生成
                  </div>
                ) : null}
              </div>
            </div>

            {!result ? (
              <div className="rounded-[28px] border border-dashed border-slate-300 bg-white/75 p-8 text-center text-sm leading-7 text-slate-500 shadow-lg shadow-slate-200/40 sm:p-10">
                まだ候補は生成されていません。上のフォームから条件を入れて、まずは一回まわしましょう。
                たいてい、考え込むより叩き台を出した方が早いです。
              </div>
            ) : (
              <div className="space-y-4 sm:space-y-5">
                {result.suggestions.map((suggestion) => {
                  const isSaved = savedNames.has(suggestion.name);
                  return (
                    <ResultCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      isSaved={isSaved}
                      onSave={() => handleSave(suggestion.id)}
                      onUnsave={() => handleUnsaveByName(suggestion.name)}
                    />
                  );
                })}
              </div>
            )}

            {result ? (
              <div className="rounded-[28px] border border-slate-200 bg-slate-950 p-5 text-slate-50 shadow-xl shadow-slate-900/10 sm:p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Current Input Snapshot</p>
                <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Object.entries(normalizeInput(result.input)).map(([key, value]) => (
                    <div key={key} className="rounded-2xl bg-white/5 p-4">
                      <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</dt>
                      <dd className="mt-2 text-sm leading-6 text-slate-100">{value || "—"}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </section>
        </div>

        <footer className="mt-6 rounded-[24px] border border-white/70 bg-white/88 px-5 py-4 text-sm text-slate-600 shadow-lg shadow-slate-200/50 backdrop-blur sm:mt-8 sm:px-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="font-medium text-slate-800">株式会社宮永不動産</p>
            <p>本アプリは実務での物件ネーミング検討を想定したモバイルファーストUIです。</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
