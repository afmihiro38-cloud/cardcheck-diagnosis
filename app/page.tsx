'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    brandsafe_js_async?: (
      url: string,
      query: string,
      id: string,
      token: string
    ) => void;
  }
}

type Answer = {
  job: string;
  anxiety: string;
  urgent: string;
  priority: string;
};

export default function Home() {
  const [answers, setAnswers] = useState<Answer>({
    job: '',
    anxiety: '',
    urgent: '',
    priority: '',
  });

  const [result, setResult] = useState(false);
  const [error, setError] = useState('');

  const select = (key: keyof Answer, value: string) => {
    setAnswers({ ...answers, [key]: value });
    setError('');
  };

  const diagnose = () => {
    if (!answers.job || !answers.anxiety || !answers.urgent || !answers.priority) {
      setError('すべての質問を選択してください。');
      return;
    }

    setResult(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress =
    Object.values(answers).filter(Boolean).length / Object.keys(answers).length;

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-slate-100 px-5 py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 text-center">
          <p className="text-sm font-bold tracking-widest text-emerald-600">
            cardcheck.jp
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900">
            クレジットカード無料診断
          </h1>
          <p className="mt-4 text-slate-600">
            30秒であなたに合うカードを診断。審査に不安がある方でも選びやすいカードを提案します。
          </p>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-xl">
          {!result && (
            <>
              <div className="mb-8">
                <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
                  <span>診断進捗</span>
                  <span>{Math.round(progress * 100)}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
              </div>

              <div className="space-y-8">
                <Question title="Q1. 現在の状況は？">
                  <Choice onClick={() => select('job', 'housewife')} selected={answers.job === 'housewife'}>主婦</Choice>
                  <Choice onClick={() => select('job', 'student')} selected={answers.job === 'student'}>学生</Choice>
                  <Choice onClick={() => select('job', 'freeter')} selected={answers.job === 'freeter'}>フリーター</Choice>
                  <Choice onClick={() => select('job', 'worker')} selected={answers.job === 'worker'}>会社員</Choice>
                </Question>

                <Question title="Q2. 審査に不安はありますか？">
                  <Choice onClick={() => select('anxiety', 'yes')} selected={answers.anxiety === 'yes'}>ある</Choice>
                  <Choice onClick={() => select('anxiety', 'no')} selected={answers.anxiety === 'no'}>ない</Choice>
                </Question>

                <Question title="Q3. すぐに使いたいですか？">
                  <Choice onClick={() => select('urgent', 'yes')} selected={answers.urgent === 'yes'}>今日〜数日以内に使いたい</Choice>
                  <Choice onClick={() => select('urgent', 'no')} selected={answers.urgent === 'no'}>急ぎではない</Choice>
                </Question>

                <Question title="Q4. 重視するものは？">
                  <Choice onClick={() => select('priority', 'easy')} selected={answers.priority === 'easy'}>申し込みやすさ</Choice>
                  <Choice onClick={() => select('priority', 'point')} selected={answers.priority === 'point'}>ポイント還元</Choice>
                  <Choice onClick={() => select('priority', 'convenience')} selected={answers.priority === 'convenience'}>コンビニ利用</Choice>
                </Question>

                {error && (
                  <div className="rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
                    {error}
                  </div>
                )}

                <button
                  onClick={diagnose}
                  className="w-full rounded-2xl bg-emerald-500 px-6 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-emerald-600"
                >
                  診断結果を見る
                </button>
              </div>
            </>
          )}

          {result && (
            <section className="rounded-3xl border bg-emerald-50 p-6">
              <p className="text-sm font-bold text-emerald-700">
                あなたにおすすめ
              </p>

              <h2 className="mt-2 text-4xl font-extrabold text-slate-900">
                エポスカード
              </h2>

              <p className="mt-4 leading-8 text-slate-700">
                審査に不安がある方や、すぐに使いたい方に向いています。
                最短即日発行に対応しているため、初めての1枚としても選ばれやすいカードです。
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-2xl bg-white p-4 font-semibold text-slate-700">
                  ✅ 年会費無料
                </div>
                <div className="rounded-2xl bg-white p-4 font-semibold text-slate-700">
                  ✅ 最短即日発行に対応
                </div>
                <div className="rounded-2xl bg-white p-4 font-semibold text-slate-700">
                  ✅ 審査に不安がある方にも選ばれやすい
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-4 text-sm text-slate-600">
                ※この診断は一般的な傾向をもとにした目安です。審査結果を保証するものではありません。
              </div>

              <div className="mt-6 rounded-3xl bg-white p-5 shadow">
                <p className="text-center font-bold text-slate-900">
                  まずは公式サイトで条件を確認してください
                </p>
                <p className="mt-2 text-center text-sm text-slate-600">
                  最短当日で利用できる可能性があります。
                </p>

                <div className="mt-4 flex justify-center">
                  <A8EposBanner />
                </div>

                <p className="mt-3 text-center text-xs text-slate-500">
                  ※A8.netの広告リンクを使用しています
                </p>
              </div>

              <button
                onClick={() => setResult(false)}
                className="mt-6 w-full rounded-2xl border bg-white px-6 py-3 font-bold transition hover:bg-slate-50"
              >
                もう一度診断する
              </button>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}

function A8EposBanner() {
  const renderAd = () => {
    if (typeof window === 'undefined') return;
    if (!window.brandsafe_js_async) return;

    const container = document.getElementById('div_admane_async_1734_658_2972');
    if (!container) return;

    container.innerHTML = '';

    window.brandsafe_js_async(
      '//ad-verification.a8.net/ad',
      '_site=1734&_article=658&_link=2972&_image=3219&_ns=1&sad=s00000015110002',
      '260501420581',
      '4B3G6K+9LWV8Y+38L8+BXYE9'
    );
  };

  useEffect(() => {
    renderAd();
  }, []);

  return (
    <div className="text-center">
      <Script
        src="https://ad-verification.a8.net/ad/js/brandsafe.js"
        strategy="afterInteractive"
        onLoad={renderAd}
      />

      <div id="div_admane_async_1734_658_2972" />

      <img
        border={0}
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B3G6K+9LWV8Y+38L8+BXYE9"
        alt=""
      />
    </div>
  );
}

function Question({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Choice({
  children,
  onClick,
  selected,
}: {
  children: React.ReactNode;
  onClick: () => void;
  selected: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-left font-semibold transition ${
        selected
          ? 'border-emerald-500 bg-emerald-100 text-emerald-800'
          : 'bg-white hover:bg-slate-100'
      }`}
    >
      {children}
    </button>
  );
}