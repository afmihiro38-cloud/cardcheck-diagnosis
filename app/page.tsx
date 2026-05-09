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

const questions = [
  {
    key: 'job' as AnswerKey,
    step: 'STEP 1 / 4',
    label: '現在の状況',
    title: '現在の状況を教えてください',
    hint: 'ご自身に一番近いものを選んでください',
    choices: [
      { label: '主婦・主夫', value: 'housewife', desc: '家計管理をしている' },
      { label: '学生', value: 'student', desc: 'アルバイト収入がある・または予定' },
      { label: 'フリーター', value: 'freeter', desc: 'アルバイト・パート等の収入がある' },
      { label: '会社員', value: 'worker', desc: '安定した収入がある' },
    ],
  },
  {
    key: 'anxiety' as AnswerKey,
    step: 'STEP 2 / 4',
    label: '審査の不安',
    title: 'カード審査に不安はありますか？',
    hint: '今の気持ちに近い方を選んでください',
    choices: [
      { label: 'かなり不安', value: 'yes', desc: '通るか心配' },
      { label: 'そこまで不安はない', value: 'no', desc: '比較的前向きに検討中' },
    ],
  },
  {
    key: 'urgent' as AnswerKey,
    step: 'STEP 3 / 4',
    label: '使いたい時期',
    title: 'いつまでに使いたいですか？',
    hint: '急ぎ度に近いものを選んでください',
    choices: [
      { label: '今日〜数日以内', value: 'yes', desc: 'なるべく早く使いたい' },
      { label: '急ぎではない', value: 'no', desc: 'じっくり選びたい' },
    ],
  },
  {
    key: 'priority' as AnswerKey,
    step: 'STEP 4 / 4',
    label: '重視ポイント',
    title: 'いちばん重視するものは？',
    hint: 'カード選びで重視したいものを選んでください',
    choices: [
      { label: '申し込みやすさ', value: 'easy', desc: 'まずは作りやすさ重視' },
      { label: '年会費無料', value: 'free', desc: 'コストをかけたくない' },
      { label: '早く使える可能性', value: 'speed', desc: '発行スピード重視' },
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

  window.gtag?.('event', eventName, {
    src: getSrc(),
    page_type: 'diagnosis_lp',
    card_name: 'epos',
    ...params,
  });
}

function getDiagnosisType(answers: Answers) {
  if (answers.urgent === 'yes') return 'speed';
  if (answers.anxiety === 'yes') return 'easy';
  if (answers.priority === 'free') return 'free';
  return 'beginner';
}

function getDiagnosisLabel(type: string) {
  if (type === 'speed') return '急ぎで使いたい人向け';
  if (type === 'easy') return '審査が不安な人向け';
  if (type === 'free') return '年会費無料重視向け';
  return '初心者向け';
}

export default function Home() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [currentStep, setCurrentStep] = useState(0);
  const [phase, setPhase] = useState<'form' | 'loading' | 'result'>('form');
  const [src, setSrc] = useState('direct');

  const answeredCount = Object.values(answers).filter(Boolean).length;
  const progress = answeredCount / questions.length;
  const currentQuestion = questions[currentStep];
  const diagnosisType = useMemo(() => getDiagnosisType(answers), [answers]);

  useEffect(() => {
    const currentSrc = getSrc();
    setSrc(currentSrc);
    track('diagnosis_lp_view', { src: currentSrc });
  }, []);

  const select = (key: AnswerKey, value: string) => {
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);

    track('diagnosis_answer_select', {
      question_key: key,
      answer_value: value,
      step_number: currentStep + 1,
    });

    setTimeout(() => {
      if (currentStep < questions.length - 1) {
        setCurrentStep((prev) => prev + 1);
      } else {
        startDiagnosis(nextAnswers);
      }
    }, 250);
  };

  const startDiagnosis = (finalAnswers: Answers) => {
    track('diagnosis_button_click', {
      answered_count: 4,
    });

    setPhase('loading');

    setTimeout(() => {
      const type = getDiagnosisType(finalAnswers);

      track('diagnosis_result_view', {
        diagnosis_type: type,
        recommended_card: 'epos',
        job: finalAnswers.job,
        anxiety: finalAnswers.anxiety,
        urgent: finalAnswers.urgent,
        priority: finalAnswers.priority,
      });

      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1400);
  };

  const reset = () => {
    track('diagnosis_retry_click', {
      diagnosis_type: diagnosisType,
    });

    setAnswers(initialAnswers);
    setCurrentStep(0);
    setPhase('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-[#f4f8f3] pb-24 text-slate-900">
      <div className="mx-auto max-w-3xl px-4 py-5">
        <AffiliateNotice />

        {phase === 'form' && (
          <>
            <Hero src={src} onStart={() => {
              document.getElementById('diagnosis-form')?.scrollIntoView({
                behavior: 'smooth',
              });
              track('fv_cta_click', { cta_position: 'fv' });
            }} />

            <section
              id="diagnosis-form"
              className="mt-6 rounded-[28px] bg-white p-5 shadow-xl ring-1 ring-emerald-100"
            >
              <StepNav currentStep={currentStep} />

              <div className="mt-6">
                <Progress progress={progress} answeredCount={answeredCount} />
              </div>

              <div className="mt-7 rounded-[24px] border border-emerald-100 bg-white p-5 shadow-sm">
                <p className="inline-flex rounded-full bg-[#0f5f45] px-3 py-1 text-xs font-black text-white">
                  {currentQuestion.step}
                </p>

                <h2 className="mt-4 text-2xl font-black leading-tight">
                  {currentQuestion.title}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {currentQuestion.hint}
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {currentQuestion.choices.map((choice) => (
                    <ChoiceCard
                      key={choice.value}
                      selected={answers[currentQuestion.key] === choice.value}
                      label={choice.label}
                      desc={choice.desc}
                      onClick={() =>
                        select(currentQuestion.key, choice.value)
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-emerald-50 p-4 text-sm leading-7 text-slate-700">
                <b className="text-[#0f5f45]">ヒント：</b>
                入力内容は保存されません。診断は無料で、いつでもやり直せます。
              </div>
            </section>
          </>
        )}

        {phase === 'loading' && <LoadingDiagnosis />}

        {phase === 'result' && (
          <ResultSection diagnosisType={diagnosisType} onReset={reset} />
        )}
      </div>

      {phase === 'form' && (
        <FixedBottomCta
          text="30秒で無料診断を始める"
          onClick={() => {
            document.getElementById('diagnosis-form')?.scrollIntoView({
              behavior: 'smooth',
            });
            track('fixed_cta_click', { cta_position: 'fixed_bottom' });
          }}
        />
      )}
    </main>
  );
}

function Hero({ src, onStart }: { src: string; onStart: () => void }) {
  return (
    <header className="pt-5">
      <div className="rounded-[30px] bg-white p-5 shadow-xl ring-1 ring-emerald-100">
        <p className="text-xs font-black tracking-[0.25em] text-[#0f5f45]">
          cardcheck.jp
        </p>

        <h1 className="mt-4 text-3xl font-black leading-tight tracking-tight sm:text-4xl">
          審査が不安でも、
          <br />
          あなたに合うカードを
          <br />
          <span className="text-[#0f5f45]">30秒で無料診断</span>
        </h1>

        <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
          主婦・学生・フリーター・初めての方にも対応。
          初心者向けに、選びやすいカード候補をわかりやすく表示します。
        </p>

        <div className="mt-6 overflow-hidden rounded-[28px] border border-emerald-100 bg-[#f4f8f3]">
  <img
    src="/images/diagnosis-hero.png"
    alt="クレジットカード無料診断"
    className="h-auto w-full object-cover"
  />
</div>
        
        <div className="mt-5 grid grid-cols-3 gap-2 text-xs font-bold text-[#0f5f45]">
          <div className="rounded-2xl bg-[#f4f8f3] p-3 text-center">完全無料</div>
          <div className="rounded-2xl bg-[#f4f8f3] p-3 text-center">最短30秒</div>
          <div className="rounded-2xl bg-[#f4f8f3] p-3 text-center">初心者向け</div>
        </div>

        <button
          onClick={onStart}
          className="mt-6 w-full rounded-2xl bg-[#0f5f45] px-6 py-4 text-lg font-black text-white shadow-lg transition hover:bg-[#0b4d38]"
        >
          自分に合うカードを無料診断
        </button>

        <p className="mt-3 text-center text-xs text-slate-400">流入元：{src}</p>
      </div>
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

function StepNav({ currentStep }: { currentStep: number }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {questions.map((q, index) => (
        <div key={q.key} className="text-center">
          <div
            className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full text-sm font-black ${
              index <= currentStep
                ? 'bg-[#0f5f45] text-white'
                : 'bg-slate-100 text-slate-400'
            }`}
          >
            {index + 1}
          </div>
          <p
            className={`mt-2 text-[11px] font-bold ${
              index <= currentStep ? 'text-[#0f5f45]' : 'text-slate-400'
            }`}
          >
            {q.label}
          </p>
        </div>
      ))}
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
          className="h-full rounded-full bg-[#0f5f45] transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}

function ChoiceCard({
  label,
  desc,
  selected,
  onClick,
}: {
  label: string;
  desc: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative rounded-2xl border p-4 text-left transition ${
        selected
          ? 'border-[#0f5f45] bg-emerald-50 shadow-md'
          : 'border-slate-200 bg-white hover:bg-slate-50'
      }`}
    >
      {selected && (
        <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#0f5f45] text-sm font-black text-white">
          ✓
        </span>
      )}

      <p className="pr-8 text-lg font-black text-slate-900">{label}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
    </button>
  );
}

function LoadingDiagnosis() {
  return (
    <section className="mt-6 rounded-[28px] bg-white p-8 text-center shadow-xl ring-1 ring-emerald-100">
      <div className="mb-6 overflow-hidden rounded-[24px]">
  <img
    src="/images/diagnosis-loading.png"
    alt="診断中"
    className="mx-auto h-auto w-full max-w-md"
  />
</div>
      <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-emerald-100 border-t-[#0f5f45]" />

      <p className="mt-6 text-sm font-black tracking-widest text-[#0f5f45]">
        診断中...
      </p>

      <h2 className="mt-3 text-2xl font-black">
        あなたに合うカードを
        <br />
        分析しています
      </h2>

      <p className="mt-4 text-sm leading-7 text-slate-600">
        回答内容をもとに、初心者でも選びやすい候補を表示します。
      </p>
    </section>
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
      <div className="rounded-[28px] bg-white p-5 shadow-xl ring-1 ring-emerald-100">
        <div className="mb-5 overflow-hidden rounded-[28px] border border-emerald-100 bg-white">
  <img
    src="/images/diagnosis-result.png"
    alt="診断レポート"
    className="h-auto w-full object-cover"
  />
</div>
        <div className="rounded-[24px] bg-[#ecf6ef] p-5">
          <p className="text-center text-sm font-black text-[#0f5f45]">
            診断レポート
          </p>

          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">あなたのタイプ</p>
            <h2 className="mt-2 text-2xl font-black leading-tight text-[#0f5f45] sm:text-4xl">
              {getDiagnosisLabel(diagnosisType)}
            </h2>
          </div>

          <div className="mt-4 rounded-2xl bg-white p-5 text-center shadow-sm">
            <p className="text-sm font-bold text-slate-500">おすすめ候補</p>
            <p className="mt-2 text-3xl font-black text-slate-900">
              エポスカード
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              年会費無料・最短即日発行対応で、初めての1枚としても検討しやすいカードです。
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-5">
          <p className="text-lg font-black text-slate-900">
            あなたにエポスカードが合いやすい理由
          </p>

          <div className="mt-4 space-y-3">
            <ReasonCard
              title="年会費無料で始めやすい"
              text="維持費をかけずに持てるため、初めてカードを作る方でも検討しやすいです。"
            />
            <ReasonCard
              title="最短即日発行に対応"
              text="急ぎでカードを使いたい方にも候補になります。"
            />
            <ReasonCard
              title="初心者でも選びやすい"
              text="複雑な条件よりも、まず1枚持ちたい方に向きやすいカードです。"
            />
          </div>
        </div>

        <div className="mt-5 rounded-2xl bg-amber-50 p-5 text-sm leading-7 text-amber-900">
          <p className="font-black">申し込みが不安な方へ</p>
          <p className="mt-2">
            いきなり申し込まなくても大丈夫です。まずは公式サイトで、最新条件・特典・発行内容を確認してから判断できます。
          </p>
        </div>

        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-xs leading-6 text-slate-600">
          ※この診断は一般的な傾向をもとにした目安です。
          <br />
          ※審査結果・発行スピードを保証するものではありません。
          <br />
          ※最新の条件・特典・発行可否は必ず公式サイトでご確認ください。
        </div>

<div className="mt-6 overflow-hidden rounded-[24px] bg-[#063f2e] text-center shadow-xl">
  <div className="bg-yellow-300 px-4 py-3">
    <p className="text-sm font-black text-[#063f2e]">
      いきなり申し込まなくてもOK
    </p>
  </div>

  <div className="p-5">
    <p className="text-xl font-black leading-snug text-white">
      まずは公式サイトで
      <br />
      最新条件を確認してください
    </p>

    <p className="mt-3 text-sm leading-7 text-emerald-50">
      年会費・特典・発行スピードなどを確認してから判断できます。
      急ぎの方は早めの確認がおすすめです。
    </p>

    <div className="mt-5 rounded-2xl bg-white p-4 shadow-inner">
      <p className="mb-3 text-sm font-black text-slate-900">
        ↓ 公式サイトはこちら ↓
      </p>

      <div className="flex justify-center">
        <A8EposBanner />
      </div>
    </div>

    <p className="mt-3 text-xs leading-5 text-emerald-100">
      ※A8.netの広告リンクを使用しています
      <br />
      ※最新条件・特典内容は公式サイトでご確認ください
    </p>
  </div>
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

function ReasonCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="font-black text-slate-900">✅ {title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
    </div>
  );
}

function Benefit({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4 font-bold text-slate-700">
      ✅ {children}
    </div>
  );
}

function FixedBottomCta({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#063f2e] px-4 py-3 shadow-2xl">
      <div className="mx-auto flex max-w-3xl items-center gap-3">
        <div className="hidden text-xs font-bold text-white sm:block">
          迷ったらまずは無料診断
        </div>
        <button
          onClick={onClick}
          className="w-full rounded-2xl bg-yellow-300 px-5 py-3 text-base font-black text-[#063f2e] shadow-lg"
        >
          {text}
        </button>
      </div>
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
