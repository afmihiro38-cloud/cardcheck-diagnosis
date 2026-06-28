import { ArrowRight, BadgeCheck, Clock3, UserRoundCheck } from 'lucide-react';
import type { ReactNode } from 'react';

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:px-5 md:py-14">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <img
          src="/images/diagnosis-hero-v2.png"
          alt="あなたに合うクレジットカードを30秒で無料診断"
          className="h-auto w-full object-cover"
        />

        <div className="bg-white p-5 text-center md:p-7">
          <button
            onClick={onStart}
            className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-sm transition hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md sm:w-auto"
          >
            無料で診断する
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="mx-auto mt-5 grid max-w-lg grid-cols-3 gap-2 text-center text-xs font-bold text-blue-700 sm:text-sm">
            <TrustBadge icon={<Clock3 className="h-4 w-4" />} text="30秒" />
            <TrustBadge icon={<UserRoundCheck className="h-4 w-4" />} text="個人情報不要" />
            <TrustBadge icon={<BadgeCheck className="h-4 w-4" />} text="無料" />
          </div>

          <p className="mx-auto mt-4 max-w-xl text-xs leading-6 text-slate-500 sm:text-sm">
            あなたの回答をもとに、cardcheck編集部が定めた基準でカード候補を提案します。
            診断結果は目安であり、申し込みは任意です。
          </p>
        </div>
      </div>
    </section>
  );
}

function TrustBadge({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-[20px] bg-blue-50 px-3 py-3">
      {icon}
      {text}
    </div>
  );
}
