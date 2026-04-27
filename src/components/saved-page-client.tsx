"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getSavedRecords, removeSavedRecord } from "@/lib/storage";
import { SavedNameRecord } from "@/lib/types";
import { formatDateTime, normalizeInput } from "@/lib/utils";

export function SavedPageClient() {
  const [records, setRecords] = useState<SavedNameRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const next = getSavedRecords();
      setRecords(next);
      setSelectedId(next[0]?.savedId ?? null);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const selectedRecord = useMemo(
    () => records.find((item) => item.savedId === selectedId) ?? records[0] ?? null,
    [records, selectedId],
  );

  function handleRemove(savedId: string) {
    const next = removeSavedRecord(savedId);
    setRecords(next);
    if (selectedId === savedId) {
      setSelectedId(next[0]?.savedId ?? null);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">Saved Records</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                保存済みネーミング一覧
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
                各案の保存時点の入力条件と、その回で生成した候補全体を残しています。比較の文脈まで残すのが、このアプリの実務寄りなところです。
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              生成画面に戻る
            </Link>
          </div>
        </header>

        {records.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-slate-300 bg-white/70 p-10 text-center text-sm leading-7 text-slate-500 shadow-lg shadow-slate-200/40">
            まだ保存データはありません。まずは生成画面で候補を作り、気になる案を保存してください。
          </div>
        ) : (
          <div className="grid gap-8 xl:grid-cols-[340px_minmax(0,1fr)]">
            <aside className="rounded-[32px] border border-white/60 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur">
              <div className="mb-3 px-2 pt-2 text-sm font-semibold text-slate-900">保存済み {records.length}件</div>
              <div className="space-y-3">
                {records.map((record) => {
                  const active = record.savedId === selectedRecord?.savedId;
                  return (
                    <button
                      key={record.savedId}
                      type="button"
                      onClick={() => setSelectedId(record.savedId)}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        active
                          ? "border-slate-900 bg-slate-900 text-white"
                          : "border-slate-200 bg-white text-slate-800 hover:border-slate-400"
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="text-lg font-semibold tracking-tight">{record.selectedSuggestion.name}</div>
                        <div className={`text-xs ${active ? "text-slate-300" : "text-slate-500"}`}>
                          {formatDateTime(record.savedAt)}
                        </div>
                        <div className={`text-sm ${active ? "text-slate-100" : "text-slate-600"}`}>
                          {record.selectedSuggestion.shortEvaluation}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {selectedRecord ? (
              <section className="space-y-6">
                <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Selected Name</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">
                        {selectedRecord.selectedSuggestion.name}
                      </h2>
                      {selectedRecord.selectedSuggestion.reading ? (
                        <p className="mt-2 text-sm text-slate-500">
                          {selectedRecord.selectedSuggestion.reading}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <a
                        href={selectedRecord.selectedSuggestion.googleSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Google検索
                      </a>
                      <a
                        href={selectedRecord.selectedSuggestion.trademarkSearchUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        商標確認
                      </a>
                      <button
                        type="button"
                        onClick={() => handleRemove(selectedRecord.savedId)}
                        className="rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
                      >
                        削除
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-4 lg:grid-cols-3">
                    <section className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">由来・意味</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {selectedRecord.selectedSuggestion.originMeaning}
                      </p>
                    </section>
                    <section className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">印象・トーン</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {selectedRecord.selectedSuggestion.impressionTone}
                      </p>
                    </section>
                    <section className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">居住者イメージとの整合</p>
                      <p className="mt-2 text-sm leading-7 text-slate-700">
                        {selectedRecord.selectedSuggestion.residentFitComment}
                      </p>
                    </section>
                  </div>
                </article>

                <article className="rounded-[32px] border border-slate-200 bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10">
                  <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-400">Saved Input Snapshot</p>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {Object.entries(normalizeInput(selectedRecord.input)).map(([key, value]) => (
                      <div key={key} className="rounded-2xl bg-white/5 p-4">
                        <dt className="text-xs uppercase tracking-[0.2em] text-slate-400">{key}</dt>
                        <dd className="mt-2 text-sm leading-6 text-slate-100">{value || "—"}</dd>
                      </div>
                    ))}
                  </dl>
                </article>

                <article className="rounded-[32px] border border-white/60 bg-white/90 p-6 shadow-xl shadow-slate-200/60 backdrop-blur">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-950">同時に生成された候補一覧</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        保存した案だけでなく、比較対象だった候補も見返せます。
                      </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                      {selectedRecord.allSuggestions.length}件
                    </div>
                  </div>
                  <div className="mt-6 grid gap-4 lg:grid-cols-2">
                    {selectedRecord.allSuggestions.map((suggestion) => {
                      const selected = suggestion.id === selectedRecord.selectedSuggestionId;
                      return (
                        <div
                          key={suggestion.id}
                          className={`rounded-2xl border p-4 ${
                            selected
                              ? "border-emerald-400 bg-emerald-50"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h4 className="text-lg font-semibold text-slate-950">{suggestion.name}</h4>
                              <p className="mt-2 text-sm text-slate-600">{suggestion.shortEvaluation}</p>
                            </div>
                            {selected ? (
                              <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
                                保存中
                              </span>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
