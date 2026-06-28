export function Loading({ text }: { text: string }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-5 md:py-16">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-[24px] bg-[#f8fafc]">
          <img
            src="/images/diagnosis-loading-v2.png"
            alt="カード候補を整理しています"
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[24px] bg-blue-50">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        </div>

        <p className="mt-6 text-sm font-black tracking-[0.2em] text-blue-600">
          cardcheck診断
        </p>

        <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 md:text-4xl">
          あなたに合うカード候補を
          <br />
          整理しています
        </h2>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          回答内容をもとに、cardcheck編集部が定めた基準で確認しています。
        </p>

        <div className="mx-auto mt-8 max-w-md rounded-[24px] bg-[#f8fafc] p-5 text-left">
          <LoadingCheck active={text.includes('年会費')} text="年会費を確認しています" />
          <LoadingCheck active={text.includes('ポイント')} text="ポイント還元を比較しています" />
          <LoadingCheck active={text.includes('初心者')} text="初心者向けか確認しています" />
          <LoadingCheck active={text.includes('候補')} text="あなた向けの候補を整理しています" />
        </div>
      </div>
    </section>
  );
}

function LoadingCheck({
  text,
  active,
}: {
  text: string;
  active: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-[18px] px-4 py-3 text-sm font-bold transition ${
        active ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-400'
      }`}
    >
      <span
        className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-black ${
          active ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-400'
        }`}
      >
        {active ? '✓' : '・'}
      </span>
      {text}
    </div>
  );
}
