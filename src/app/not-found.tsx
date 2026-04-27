import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] px-4">
      <div className="max-w-xl rounded-[32px] border border-white/60 bg-white/90 p-10 text-center shadow-xl shadow-slate-200/60 backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.32em] text-slate-500">404</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">ページが見つかりません</h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          たぶん、物件名より先にURLが迷子になりました。生成画面に戻って続けましょう。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          トップへ戻る
        </Link>
      </div>
    </div>
  );
}
