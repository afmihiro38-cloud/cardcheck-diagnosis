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

const RAKUTEN_LINK = 'https://af.moshimo.com/af/c/click?a_id=5526377&p_id=7276&pc_id=20877&pl_id=91971';
const SURUGA_LINK = 'https://px.a8.net/svt/ejp?a8mat=4B3QB2+FUYPWY+5OWE+HV7V6';

type AnswerKey =
  | 'status'
  | 'firstCard'
  | 'annualFee'
  | 'points'
  | 'speed'
  | 'brand'
  | 'useCase';

type CardId = 'rakuten' | 'epos' | 'suruga';

type Answers = Record<AnswerKey, string>;

const BLUE = '#2563eb';

const initialAnswers: Answers = {
  status: '',
  firstCard: '',
  annualFee: '',
  points: '',
  speed: '',
  brand: '',
  useCase: '',
};

const questions = [
  {
    key: 'status' as AnswerKey,
    title: '現在の状況を教えてください',
    hint: 'おすすめカードを絞り込みます。',
    choices: [
      ['student', '学生'],
      ['worker', '会社員'],
      ['housewife', '主婦・主夫'],
      ['freeter', 'フリーター'],
    ],
  },
  {
    key: 'firstCard' as AnswerKey,
    title: 'クレジットカードは初めてですか？',
    hint: '初心者向けかどうかを判定します。',
    choices: [
      ['yes', '初めて'],
      ['no', 'すでに持っている'],
    ],
  },
  {
    key: 'annualFee' as AnswerKey,
    title: '年会費は重視しますか？',
    hint: '維持費をかけたくない方は重視を選んでください。',
    choices: [
      ['free', '年会費無料がいい'],
      ['not_matter', 'そこまで気にしない'],
    ],
  },
  {
    key: 'points' as AnswerKey,
    title: 'ポイント還元は重視しますか？',
    hint: '普段の買い物でポイントを貯めたいかを確認します。',
    choices: [
      ['high', '重視する'],
      ['normal', '普通でいい'],
    ],
  },
  {
    key: 'speed' as AnswerKey,
    title: 'すぐに使いたいですか？',
    hint: '急ぎの場合は発行スピードも考慮します。',
    choices: [
      ['fast', 'できるだけ早く使いたい'],
      ['normal', '急ぎではない'],
    ],
  },
  {
    key: 'brand' as AnswerKey,
    title: '国際ブランドの希望はありますか？',
    hint: 'JCB希望などがあれば反映します。',
    choices: [
      ['jcb', 'JCBがいい'],
      ['any', 'こだわりなし'],
    ],
  },
  {
    key: 'useCase' as AnswerKey,
    title: '主にどんな場面で使いたいですか？',
    hint: '普段使い・旅行・ネット利用などを考慮します。',
    choices: [
      ['daily', '普段の買い物'],
      ['online', 'ネットショッピング'],
      ['travel', '旅行・優待'],
      ['first', 'まずは最初の1枚'],
    ],
  },
];

function getSrc() {
  if (typeof window === 'undefined') return 'direct';
  return new URLSearchParams(window.location.search).get('src') || 'direct';
}

function track(eventName: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return;
  window.gtag?.('event', eventName, {
    src: getSrc(),
    page_type: 'diagnosis_lp_v5',
    ...params,
  });
}

function getScores(answers: Answers) {
  const score: Record<CardId, number> = {
    rakuten: 70,
    epos: 20,
    suruga: 10,
  };

  if (answers.firstCard === 'yes') score.rakuten += 10;
  if (answers.annualFee === 'free') score.rakuten += 10;
  if (answers.points === 'high') score.rakuten += 15;
  if (answers.status === 'student') score.rakuten += 8;
  if (answers.status === 'housewife') score.rakuten += 8;
  if (answers.useCase === 'online') score.rakuten += 12;
  if (answers.useCase === 'first') score.rakuten += 10;

  if (answers.speed === 'fast') score.epos += 18;
  if (answers.useCase === 'travel') score.epos += 18;

  if (answers.brand === 'jcb') score.suruga += 30;

  return score;
}

function getMainCard(scores: Record<CardId, number>): CardId {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as CardId;
}

export default function Home() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'hero' | 'question' | 'loading' | 'result'>(
    'hero'
  );
  const [loadingText, setLoadingText] = useState('年会費を確認しています');

  const currentQuestion = questions[step];
  const progress = Math.round(((step + 1) / questions.length) * 100);
  const scores = useMemo(() => getScores(answers), [answers]);
  const mainCard = getMainCard(scores);

  useEffect(() => {
    track('diagnosis_lp_view');
  }, []);

  const start = () => {
    setPhase('question');
    track('diagnosis_start_click');
  };

  const select = (key: AnswerKey, value: string) => {
    const next = { ...answers, [key]: value };
    setAnswers(next);

    track('diagnosis_answer_select', {
      question_key: key,
      answer_value: value,
      question_number: step + 1,
    });

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep(step + 1);
      } else {
        setPhase('loading');
        runLoading(next);
      }
    }, 250);
  };

  const runLoading = (finalAnswers: Answers) => {
    const texts = [
      '年会費を確認しています',
      'ポイント還元を比較しています',
      '初心者向けか確認しています',
      'あなた向けの候補を整理しています',
    ];

    texts.forEach((text, i) => {
      setTimeout(() => setLoadingText(text), i * 450);
    });

    setTimeout(() => {
      const finalScores = getScores(finalAnswers);
      const finalCard = getMainCard(finalScores);

      track('diagnosis_result_view', {
        recommended_card: finalCard,
        rakuten_score: finalScores.rakuten,
        epos_score: finalScores.epos,
        suruga_score: finalScores.suruga,
      });

      setPhase('result');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2100);
  };

  const reset = () => {
    setAnswers(initialAnswers);
    setStep(0);
    setPhase('hero');
    track('diagnosis_retry_click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="min-h-screen bg-white text-[#0f172a]">
      <AffiliateNotice />

      {phase === 'hero' && <Hero onStart={start} />}

      {phase === 'question' && (
        <section className="mx-auto max-w-3xl px-5 py-10">
          <div className="rounded-[20px] border bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-blue-600">
              質問 {step + 1} / {questions.length}
            </p>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-600 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h2 className="mt-8 text-2xl font-black">
              {currentQuestion.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {currentQuestion.hint}
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {currentQuestion.choices.map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => select(currentQuestion.key, value)}
                  className={`rounded-[20px] border p-5 text-left font-bold shadow-sm transition hover:scale-[1.02] hover:shadow-md ${
                    answers[currentQuestion.key] === value
                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  ○ {label}
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {phase === 'loading' && <Loading text={loadingText} />}

      {phase === 'result' && (
        <Result
          mainCard={mainCard}
          scores={scores}
          onReset={reset}
        />
      )}
    </main>
  );
}

function AffiliateNotice() {
  return (
    <div className="mx-auto max-w-6xl px-5 pt-4">
      <div className="rounded-[20px] bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">
        <b>広告・PRについて：</b>
        当サイトはアフィリエイト広告を利用しています。診断結果は一般的な傾向をもとにした目安であり、審査通過や発行を保証するものではありません。
      </div>
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 py-16 md:grid-cols-2 md:py-24">
      <div>
        <div className="inline-flex rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
          初心者向け・無料診断
        </div>

        <h1 className="mt-6 text-4xl font-black leading-[1.12] tracking-tight text-slate-900 md:text-6xl">
          あなたに合う
          <br />
          クレジットカードを
          <br />
          <span className="text-blue-600">30秒で診断します。</span>
        </h1>

        <p className="mt-6 max-w-xl text-base leading-8 text-slate-600">
          初めてのカード選びで迷っている方へ。
          あなたの回答をもとに、cardcheck編集部が定めた基準で
          選びやすいカード候補を提案します。
        </p>

        <div className="mt-7 grid max-w-md grid-cols-3 gap-2 text-center text-sm font-bold text-blue-700">
          <div className="rounded-[20px] bg-blue-50 px-3 py-3">
            無料
          </div>
          <div className="rounded-[20px] bg-blue-50 px-3 py-3">
            個人情報不要
          </div>
          <div className="rounded-[20px] bg-blue-50 px-3 py-3">
            30秒
          </div>
        </div>

        <button
          onClick={onStart}
          className="mt-8 inline-flex w-full items-center justify-center rounded-[20px] bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-sm transition hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md sm:w-auto"
        >
          無料で診断する
        </button>

        <p className="mt-4 text-sm leading-7 text-slate-500">
          診断結果は目安です。申し込みは任意で、審査結果を保証するものではありません。
        </p>
      </div>

      <div className="relative">
        <div className="absolute -left-6 -top-6 hidden h-24 w-24 rounded-full bg-blue-100 blur-2xl md:block" />
        <div className="absolute -bottom-8 -right-6 hidden h-32 w-32 rounded-full bg-slate-100 blur-2xl md:block" />

        <div className="relative rounded-[28px] border border-slate-200 bg-[#f8fafc] p-5 shadow-sm">
          <div className="rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-black text-blue-600">
                cardcheck診断
              </p>
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700">
                30秒
              </span>
            </div>

            <div className="mt-6">
              <p className="text-sm font-bold text-slate-500">
                質問 2 / 7
              </p>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-4/12 rounded-full bg-blue-600" />
              </div>
            </div>

            <div className="mt-6">
              <div className="h-4 w-10/12 rounded-full bg-slate-100" />
              <div className="mt-3 h-4 w-7/12 rounded-full bg-slate-100" />
            </div>

            <div className="mt-6 space-y-3">
              <HeroMockChoice active text="年会費無料を重視したい" />
              <HeroMockChoice text="ポイントを貯めたい" />
              <HeroMockChoice text="まずは最初の1枚を探している" />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <HeroMiniCard title="初心者" />
            <HeroMiniCard title="無料" />
            <HeroMiniCard title="安心" />
          </div>
        </div>
      </div>
    </section>
  );
}

function MockLine({ width }: { width: string }) {
  return <div className={`h-3 rounded-full bg-slate-100 ${width}`} />;
}

function MockChoice({ text }: { text: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-4 text-sm font-bold text-slate-700">
      ○ {text}
    </div>
  );
}

function HeroMockChoice({
  text,
  active = false,
}: {
  text: string;
  active?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-4 text-sm font-bold shadow-sm ${
        active
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-700'
      }`}
    >
      ○ {text}
    </div>
  );
}

function HeroMiniCard({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] bg-white p-4 text-center text-sm font-black text-slate-700 shadow-sm">
      {title}
    </div>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <section className="mx-auto max-w-3xl px-5 py-16 text-center">
      <div className="rounded-[20px] border bg-white p-8 shadow-sm">
        <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
        <p className="mt-6 text-sm font-bold text-blue-600">診断中...</p>
        <h2 className="mt-3 text-2xl font-black">{text}</h2>
        <div className="mx-auto mt-6 h-2 max-w-sm overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-8/12 rounded-full bg-blue-600" />
        </div>
      </div>
    </section>
  );
}

function Result({
  mainCard,
  scores,
  onReset,
}: {
  mainCard: CardId;
  scores: Record<CardId, number>;
  onReset: () => void;
}) {
  const main =
    mainCard === 'rakuten'
      ? '楽天カード'
      : mainCard === 'epos'
      ? 'エポスカード'
      : 'スルガJCBカード';

  return (
    <section className="bg-[#f8fafc] px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[28px] bg-blue-50 p-6 text-center">
          <p className="font-bold text-blue-600">診断完了</p>
          <h2 className="mt-3 text-3xl font-black">
            あなたにおすすめのカード
          </h2>

          <div className="mx-auto mt-6 max-w-md rounded-[20px] bg-white p-6 shadow-sm">
            <p className="text-3xl font-black">{main}</p>
            <p className="mt-2 text-2xl font-black text-blue-600">
              {scores[mainCard]}点
            </p>
            <p className="mt-1 text-yellow-400">★★★★★</p>
          </div>
        </div>

        <div className="mt-8 rounded-[20px] bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black">あなたはこんなタイプでした</h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <TypeCard title="初心者" stars="★★★★★" />
            <TypeCard title="年会費重視" stars="★★★★★" />
            <TypeCard title="ポイント重視" stars="★★★★☆" />
            <TypeCard title="旅行・優待" stars="★★☆☆☆" />
          </div>

          <p className="mt-5 leading-8 text-slate-600">
            この結果から、現時点では <b>{main}</b> をおすすめ候補として表示しています。
          </p>
        </div>

        <div className="mt-8 rounded-[20px] bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-black">おすすめ理由</h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Reason title="年会費無料" />
            <Reason title="ポイントが貯まりやすい" />
            <Reason title="初めてでも使いやすい" />
            <Reason title="普段使い向き" />
          </div>
        </div>

        <div className="mt-8 rounded-[20px] bg-yellow-50 p-6 text-yellow-900">
          <h3 className="font-black">申し込み前に確認しましょう</h3>
          <ul className="mt-3 space-y-2 text-sm leading-7">
            <li>・カード発行には審査があります。</li>
            <li>・必ず発行されるわけではありません。</li>
            <li>・ポイント制度や特典は変更される場合があります。</li>
          </ul>
        </div>

        <MainCta card={mainCard} />

        <div className="mt-8">
          <h3 className="text-2xl font-black">他の候補</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <SubCard title="スルガJCBカード" score="84点" text="JCB希望ならおすすめ" />
            <SubCard title="エポスカード" score="80点" text="旅行・優待を重視する方向け" />
          </div>
        </div>

        <FAQ />

        <div className="mt-8 rounded-[20px] bg-white p-6 shadow-sm">
          <h3 className="text-xl font-black">cardcheck編集部</h3>
          <p className="mt-3 leading-8 text-slate-600">
            cardcheck編集部では、初心者向けにクレジットカード情報をわかりやすく発信しています。
          </p>
        </div>

        <button
          onClick={onReset}
          className="mt-8 w-full rounded-[20px] border bg-white px-6 py-4 font-black shadow-sm transition hover:shadow-md"
        >
          もう一度診断する
        </button>
      </div>
    </section>
  );
}

function TypeCard({ title, stars }: { title: string; stars: string }) {
  return (
    <div className="rounded-[20px] border bg-white p-5 shadow-sm">
      <p className="font-black">{title}</p>
      <p className="mt-2 text-yellow-400">{stars}</p>
    </div>
  );
}

function Reason({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] border bg-white p-5 text-center font-black shadow-sm">
      {title}
    </div>
  );
}

function MainCta({ card }: { card: CardId }) {
  if (card === 'epos') {
    return (
      <div className="mt-8 rounded-[20px] bg-white p-6 text-center shadow-sm">
        <h3 className="text-2xl font-black">エポスカード</h3>
        <p className="mt-3 text-sm text-slate-600">
          公式サイトで最新条件を確認してください。
        </p>
        <div className="mt-5 flex justify-center">
          <A8EposBanner />
        </div>
      </div>
    );
  }

  const href = card === 'rakuten' ? RAKUTEN_LINK : SURUGA_LINK;
  const name = card === 'rakuten' ? '楽天カード' : 'スルガJCBカード';

  return (
    <div className="mt-8 rounded-[20px] bg-white p-6 text-center shadow-sm">
      <h3 className="text-2xl font-black">{name}</h3>
      <p className="mt-3 text-sm text-slate-600">
        公式サイトで最新条件を確認してください。
      </p>
      <a
        href={href}
        target="_blank"
        rel="nofollow sponsored noopener noreferrer"
        onClick={() =>
          track('affiliate_cta_click', {
            card_name: card,
            cta_position: 'main_result',
          })
        }
        className="mt-5 inline-block rounded-[20px] bg-blue-600 px-8 py-4 font-black text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md"
      >
        公式サイトを見る
      </a>
    </div>
  );
}

function SubCard({
  title,
  score,
  text,
}: {
  title: string;
  score: string;
  text: string;
}) {
  return (
    <div className="rounded-[20px] bg-white p-5 shadow-sm">
      <p className="text-xl font-black">{title}</p>
      <p className="mt-2 font-black text-blue-600">{score}</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
    </div>
  );
}

function FAQ() {
  const items = [
    ['診断は無料ですか？', 'はい、無料で利用できます。'],
    ['申し込み義務はありますか？', 'ありません。結果を見たあとに申し込まなくても大丈夫です。'],
    ['診断結果以外のカードを選んでもいいですか？', 'もちろん問題ありません。診断結果はあくまで目安です。'],
    ['審査に必ず通りますか？', 'いいえ。審査結果を保証するものではありません。'],
    ['個人情報は必要ですか？', 'この診断では氏名や住所などの個人情報は入力不要です。'],
  ];

  return (
    <div className="mt-8 rounded-[20px] bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-black">よくある質問</h3>
      <div className="mt-5 space-y-3">
        {items.map(([q, a]) => (
          <details key={q} className="rounded-[20px] border p-4">
            <summary className="cursor-pointer font-black">{q}</summary>
            <p className="mt-3 text-sm leading-7 text-slate-600">{a}</p>
          </details>
        ))}
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
      cta_position: 'main_result',
      affiliate_network: 'a8',
    });
  };

  useEffect(() => {
    renderAd();
  }, []);

  return (
    <div
      onClick={() =>
        track('epos_banner_click', {
          cta_position: 'main_result',
          affiliate_network: 'a8',
        })
      }
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
