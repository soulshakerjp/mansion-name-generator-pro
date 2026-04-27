import { NameSuggestion } from "@/lib/types";

export function ResultCard({
  suggestion,
  onSave,
  onUnsave,
  isSaved,
}: {
  suggestion: NameSuggestion;
  onSave: () => void;
  onUnsave: () => void;
  isSaved: boolean;
}) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Name Candidate</p>
          <div>
            <h3 className="text-2xl font-semibold tracking-tight text-slate-950">{suggestion.name}</h3>
            {suggestion.reading ? (
              <p className="mt-1 text-sm text-slate-500">{suggestion.reading}</p>
            ) : null}
          </div>
          <div className="inline-flex rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-800">
            {suggestion.shortEvaluation}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <a
            href={suggestion.googleSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Google検索
          </a>
          <a
            href={suggestion.trademarkSearchUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            商標確認
          </a>
          {isSaved ? (
            <button
              type="button"
              onClick={onUnsave}
              className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
            >
              保存解除
            </button>
          ) : (
            <button
              type="button"
              onClick={onSave}
              className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
            >
              保存する
            </button>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">由来・意味</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{suggestion.originMeaning}</p>
        </section>
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">印象・トーン</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{suggestion.impressionTone}</p>
        </section>
        <section className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">居住者イメージとの整合</p>
          <p className="mt-2 text-sm leading-7 text-slate-700">{suggestion.residentFitComment}</p>
        </section>
      </div>
    </article>
  );
}
