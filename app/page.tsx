'use client';

import Script from 'next/script';
import { useEffect, useMemo, useState } from 'react';

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    brandsafe_js_async?: (
      url: string,
      query: string,
      id: string,
      token: string
    ) => void;
  }
}

type AnswerKey = 'job' | 'anxiety' | 'urgent' | 'priority';

type Answers = Record<AnswerKey, string>;

const initialAnswers: Answers = {
  job: '',
  anxiety: '',
  urgent: '',
  priority: '',
};

const questions: {
  key: AnswerKey;
  title: string;
  choices: { label: string; value: string; hint?: string }[];
}[] = [
  {
    key: 'job',
    title: 'Q1. 現在の状況は？',
    choices: [
      { label: '主婦・主夫', value: 'housewife' },
      { label: '学生', value: 'student' },
      { label: 'フリーター', value: 'freeter' },
      { label: '会社員', value: 'worker' },
    ],
  },
  {
    key: 'anxiety',
    title: 'Q2. カード審査に不安はありますか？',
    choices: [
      { label: 'かなり不安', value: 'yes', hint: '通るか心配' },
      { label: 'そこまで不安はない', value: 'no' },
    ],
  },
  {
    key: 'urgent',
    title: 'Q3. いつまでに使いたいですか？',
    choices: [
      { label: '今日〜数日以内に使いたい', value: 'yes' },
      { label: '急ぎではない', value: 'no' },
    ],
  },
  {
    key: 'priority',
    title: 'Q4. いちばん重視するものは？',
    choices: [
      { label: '申し込みやすさ', value: 'easy' },
      { label: '年会費無料', value: 'free' },
      { label: 'すぐ使える可能性', value: 'speed' },
    ],
  },
];

function getSrc() {
  if (typeof window === 'undefined') return 'direct';
  const params = new URLSearchParams(window.location.search);
  return params.get('src') || 'direct';
}

function track(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;

  const src = getSrc();

  window.gtag?.('event', eventName, {
    src,
    page_type: 'diagnosis_lp',
    card_name: 'epos',
    ...params,
  });
}

export default function Home() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [showResult, setShowResult] = useState(false);
  const [error, setError] = useState('');
  const [src, setSrc] = useState('direct');

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const progress = answeredCount / questions.length;

  useEffect(() => {
    const currentSrc = getSrc();
    setSrc(currentSrc);

    track('diagnosis_lp_view', {
      src: currentSrc,
    });
  }, []);

  const diagnosisType = useMemo(() => {
    if (answers.urgent === 'yes') return 'speed';
    if (answers.anxiety === 'yes') return 'easy';
    if (answers.priority === 'free') return 'free';
    return 'standard';
  }, [answers]);

  const select = (key: AnswerKey, value: string) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setError('');

    track('diagnosis_answer_select', {
      question_key: key,
      answer_value: value,
    });
  };

  const diagnose = () => {
    track('diagnosis_button_click', {
      answered_count: answeredCount,
    });

    if (answeredCount < questions.length) {
      setError('すべての質問を選択してください。');
      track('diagnosis_error', {
        error_type: 'incomplete_answers',
      });
      return;
    }

    setShowResult(true);

    track('diagnosis_result_view', {
      diagnosis_type: diagnosisType,
      job: answers.job,
      anxiety: answers.anxiety,
      urgent: answers.urgent,
      priority: answers.priority,
      recommended_card: 'epos',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const reset = () => {
    track('diagnosis_retry_click', {
      diagnosis_type: diagnosisType,
    });

    setAnswers(initialAnswers);
    setShowResult(false);
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50 px-4 py-6 text-slate-900">
      <div className="mx-auto max-w-3xl">
        <AffiliateNotice />

        {!showResult ? (
          <>
            <Hero src={src} />

            <section className="mt-6 rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-100">
              <Progress progress={progress} answeredCount={answeredCount} />

              <div className="mt-7 space-y-7">
                {questions.map((q) => (
                  <Question key={q.key} title={q.title}>
                    {q.choices.map((choice) => (
                      <Choice
                        key={choice.value}
                        selected={answers[q.key] === choice.value}
                        onClick={() => select(q.key, choice.value)}
                      >
                        <span>{choice.label}</span>
                        {choice.hint && (
                          <small className="mt-1 block text-xs font-medium text-slate-500">
                            {choice.hint}
                          </small>
                        )}
                      </Choice>
                    ))}
                  </Question>
                ))}
              </div>

              {error && (
                <div className="mt-6 rounded-2xl bg-red-50 p-4 text-center text-sm font-bold text-red-600">
                  {error}
                </div>
              )}

              <button
                onClick={diagnose}
                className="mt-7 w-full rounded-2xl bg-emerald-600 px-6 py-4 text-lg font-extrabold text-white shadow-lg transition hover:bg-emerald-700"
              >
                診断結果を見る
              </button>

              <p className="mt-3 text-center text-xs text-slate-500">
                診断は無料です。審査結果を保証するものではありません。
              </p>
            </section>
          </>
        ) : (
          <ResultSection
            diagnosisType={diagnosisType}
            onReset={reset}
          />
        )}
      </div>
    </main>
  );
}

function Hero({ src }: { src: string }) {
  return (
    <header className="pt-4 text-center">
      <p className="text-xs font-extrabold tracking-[0.25em] text-emerald-600">
        cardcheck.jp
      </p>

      <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
        あなたに合う
        <br />
        クレジットカードを30秒診断
      </h1>

      <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
        審査が不安、すぐ使いたい、年会費無料がいい。
        あなたの状況に合わせて、今申し込める候補をわかりやすく表示します。
      </p>

      <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-bold text-slate-700">
        <div className="rounded-2xl bg-white p-3 shadow-sm">無料診断</div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">30秒</div>
        <div className="rounded-2xl bg-white p-3 shadow-sm">初心者向け</div>
      </div>

      <p className="mt-3 text-xs text-slate-400">
        流入元：{src}
      </p>
    </header>
  );
}

function AffiliateNotice() {
  return (
    <div className="rounded-2xl bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900 ring-1 ring-amber-100">
      <b>広告・PRについて：</b>
      当サイトはアフィリエイト広告を利用しています。診断結果は一般的な傾向をもとにした目安であり、審査通過や発行を保証するものではありません。
    </div>
  );
}

function Progress({
  progress,
  answeredCount,
}: {
  progress: number;
  answeredCount: number;
}) {
  return (
    <div>
      <div className="mb-2 flex justify-between text-sm font-bold text-slate-600">
        <span>診断進捗</span>
        <span>
          {answeredCount}/4問・{Math.round(progress * 100)}%
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function ResultSection({
  diagnosisType,
  onReset,
}: {
  diagnosisType: string;
  onReset: () => void;
}) {
  return (
    <section className="mt-6">
      <div className="rounded-3xl bg-white p-5 shadow-xl ring-1 ring-slate-100">
        <div className="rounded-3xl bg-emerald-50 p-5">
          <p className="text-sm font-extrabold text-emerald-700">診断結果</p>

          <h2 className="mt-2 text-2xl font-black leading-tight sm:text-4xl">
            あなたには
            <br />
            エポスカードが向いています
          </h2>

          <div className="mt-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-emerald-700">
            {getDiagnosisLabel(diagnosisType)}
          </div>

          <p className="mt-5 text-lg font-extrabold leading-8">
            年会費無料で、初めての1枚としても選びやすいカードです。
          </p>

          <p className="mt-3 leading-8 text-slate-700">
            エポスカードは年会費無料で、最短即日発行にも対応しています。
            審査に不安がある方や、早めにカードを用意したい方の候補になります。
          </p>
        </div>

        <div className="mt-5 grid gap-3">
          <Benefit>年会費無料</Benefit>
          <Benefit>最短即日発行に対応</Benefit>
          <Benefit>初めてのクレジットカードとして選びやすい</Benefit>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">
          ※この診断は一般的な傾向をもとにした目安です。
          <br />
          ※審査結果・発行スピードを保証するものではありません。
          <br />
          ※最新の条件・特典・発行可否は必ず公式サイトでご確認ください。
        </div>

        <div className="mt-6 rounded-3xl bg-white p-5 text-center shadow ring-1 ring-slate-100">
          <p className="font-black">
            まずは公式サイトで条件を確認してください
          </p>
          <p className="mt-2 text-sm text-slate-600">
            申し込み前に、最新の発行条件・特典内容を確認できます。
          </p>

          <div className="mt-4 flex justify-center">
            <A8EposBanner />
          </div>

          <p className="mt-3 text-xs text-slate-500">
            ※A8.netの広告リンクを使用しています
          </p>
        </div>

        <button
          onClick={onReset}
          className="mt-6 w-full rounded-2xl border bg-white px-6 py-3 font-bold transition hover:bg-slate-50"
        >
          もう一度診断する
        </button>
      </div>
    </section>
  );
}

function getDiagnosisLabel(type: string) {
  if (type === 'speed') return '急ぎで使いたい人向け';
  if (type === 'easy') return '審査が不安な人向け';
  if (type === 'free') return '年会費無料重視向け';
  return 'バランス重視向け';
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-700">
      ✅ {children}
    </div>
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

    track('epos_banner_view', {
      cta_position: 'result_main',
      affiliate_network: 'a8',
    });
  };

  useEffect(() => {
    renderAd();
  }, []);

  return (
    <div
      className="text-center"
      onClick={() => {
        track('epos_banner_click', {
          cta_position: 'result_main',
          affiliate_network: 'a8',
          click_type: 'banner_area',
        });
      }}
    >
      <Script
        src="https://ad-verification.a8.net/ad/js/brandsafe.js"
        strategy="afterInteractive"
        onLoad={renderAd}
      />

      <div id="div_admane_async_1734_658_2972" />

      <img
        width={1}
        height={1}
        src="https://www14.a8.net/0.gif?a8mat=4B3G6K+9LWV8Y+38L8+BXYE9"
        alt=""
        style={{ border: 0 }}
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
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
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
      className={`rounded-2xl border px-4 py-4 text-left font-bold transition ${
        selected
          ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}
