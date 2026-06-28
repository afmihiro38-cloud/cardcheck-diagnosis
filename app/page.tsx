'use client';

import Script from 'next/script';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  CreditCard,
  HelpCircle,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react';

const RAKUTEN_LINK = 'ここに楽天カードの広告リンク';
const SURUGA_LINK = 'ここにスルガJCBカードの広告リンク';

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

const initialAnswers: Answers = {
  status: '',
  firstCard: '',
  annualFee: '',
  points: '',
  speed: '',
  brand: '',
  useCase: '',
};

const questions: {
  key: AnswerKey;
  title: string;
  hint: string;
  choices: { value: string; label: string; desc: string }[];
}[] = [
  {
    key: 'status',
    title: '現在の状況を教えてください',
    hint: 'あなたに近いものを選ぶと、候補を絞り込みやすくなります。',
    choices: [
      { value: 'student', label: '学生', desc: '初めての1枚や年会費無料を重視しやすい方' },
      { value: 'worker', label: '会社員', desc: '普段使い・ポイント・安心感をバランスよく見たい方' },
      { value: 'housewife', label: '主婦・主夫', desc: '家計管理や日常の買い物で使いやすいカードを探したい方' },
      { value: 'freeter', label: 'フリーター', desc: '年会費無料や申し込みやすさを重視したい方' },
    ],
  },
  {
    key: 'firstCard',
    title: 'クレジットカードは初めてですか？',
    hint: '初めての方には、分かりやすく使いやすいカードを優先します。',
    choices: [
      { value: 'yes', label: '初めて', desc: '最初の1枚として選びやすいカードを探したい' },
      { value: 'no', label: 'すでに持っている', desc: '今のカードとは違う候補も見てみたい' },
    ],
  },
  {
    key: 'annualFee',
    title: '年会費は重視しますか？',
    hint: '維持費をかけたくない場合は、年会費無料を重視しましょう。',
    choices: [
      { value: 'free', label: '年会費無料がいい', desc: 'コストをかけずに持てるカードを優先したい' },
      { value: 'not_matter', label: 'そこまで気にしない', desc: '特典や使いやすさも含めて考えたい' },
    ],
  },
  {
    key: 'points',
    title: 'ポイント還元は重視しますか？',
    hint: '普段の買い物やネットショッピングでポイントを貯めたいかを確認します。',
    choices: [
      { value: 'high', label: '重視する', desc: '日常の支払いでポイントを貯めたい' },
      { value: 'normal', label: '普通でいい', desc: 'ポイントよりも使いやすさや安心感を重視したい' },
    ],
  },
  {
    key: 'speed',
    title: 'すぐに使いたいですか？',
    hint: '急ぎの場合は、発行スピードも候補選びに影響します。',
    choices: [
      { value: 'fast', label: 'できるだけ早く使いたい', desc: '急ぎでカードを準備したい' },
      { value: 'normal', label: '急ぎではない', desc: '条件を見ながらじっくり選びたい' },
    ],
  },
  {
    key: 'brand',
    title: '国際ブランドの希望はありますか？',
    hint: 'JCB希望などがあれば、候補に反映します。',
    choices: [
      { value: 'jcb', label: 'JCBがいい', desc: 'JCBブランドを希望している' },
      { value: 'any', label: 'こだわりなし', desc: 'ブランドよりも総合的な使いやすさを重視したい' },
    ],
  },
  {
    key: 'useCase',
    title: '主にどんな場面で使いたいですか？',
    hint: '利用シーンに合わせて、おすすめ候補を調整します。',
    choices: [
      { value: 'daily', label: '普段の買い物', desc: 'スーパー・コンビニ・日用品などで使いたい' },
      { value: 'online', label: 'ネットショッピング', desc: 'ネット通販やオンライン決済で使いたい' },
      { value: 'travel', label: '旅行・優待', desc: '旅行や優待サービスも気になる' },
      { value: 'first', label: 'まずは最初の1枚', desc: '迷わず使いやすい1枚を選びたい' },
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
    page_type: 'diagnosis_lp_v6',
    ...params,
  });
}

function getScores(answers: Answers): Record<CardId, number> {
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

function getCardName(card: CardId) {
  if (card === 'rakuten') return '楽天カード';
  if (card === 'epos') return 'エポスカード';
  return 'スルガJCBカード';
}

export default function Home() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<'hero' | 'question' | 'loading' | 'result'>('hero');
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    }, 220);
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
    <main className="min-h-screen bg-white pb-24 text-slate-900 md:pb-0">
      <AffiliateNotice />

      {phase === 'hero' && <Hero onStart={start} />}
      {phase === 'question' && (
        <QuestionScreen
          step={step}
          currentQuestion={currentQuestion}
          answers={answers}
          progress={progress}
          onSelect={select}
        />
      )}
      {phase === 'loading' && <Loading text={loadingText} />}
      {phase === 'result' && <Result mainCard={mainCard} scores={scores} onReset={reset} />}

      {phase === 'hero' && <FloatingStartButton onStart={start} />}
    </main>
  );
}

function AffiliateNotice() {
  return (
    <div className="mx-auto max-w-6xl px-4 pt-4 md:px-5">
      <div className="rounded-[20px] bg-amber-50 px-4 py-3 text-xs leading-6 text-amber-900">
        <b>広告・PRについて：</b>
        当サイトはアフィリエイト広告を利用しています。診断結果は一般的な傾向をもとにした目安であり、審査通過や発行を保証するものではありません。
      </div>
    </div>
  );
}

function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="mx-auto max-w-5xl px-4 py-6 md:px-5 md:py-14">
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
        <img
          src="/images/diagnosis-hero.png"
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

function QuestionScreen({
  step,
  currentQuestion,
  answers,
  progress,
  onSelect,
}: {
  step: number;
  currentQuestion: (typeof questions)[number];
  answers: Answers;
  progress: number;
  onSelect: (key: AnswerKey, value: string) => void;
}) {
  const remaining = questions.length - step - 1;

  return (
    <section className="mx-auto max-w-4xl px-4 py-8 md:px-5 md:py-14">
      <div className="mb-6 text-center">
        <p className="text-sm font-black tracking-[0.2em] text-blue-600">
          cardcheck diagnosis
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
          あなたに合うカードを絞り込みます
        </h1>
      </div>

      <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-black text-blue-600">
              質問 {step + 1} / {questions.length}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {remaining > 0 ? `あと${remaining}問で診断結果を表示します` : '最後の質問です'}
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-bold text-blue-700">
            <Clock3 className="h-4 w-4" />
            約30秒で完了
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-2 flex justify-between text-xs font-bold text-slate-500">
            <span>進捗</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-8 rounded-[24px] bg-[#f8fafc] p-5 md:p-6">
          <p className="text-sm font-black text-blue-600">STEP {step + 1}</p>

          <h2 className="mt-3 text-2xl font-black leading-tight text-slate-900 md:text-3xl">
            {currentQuestion.title}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {currentQuestion.hint}
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {currentQuestion.choices.map((choice) => (
              <QuestionChoiceCard
                key={choice.value}
                label={choice.label}
                desc={choice.desc}
                selected={answers[currentQuestion.key] === choice.value}
                onClick={() => onSelect(currentQuestion.key, choice.value)}
              />
            ))}
          </div>
        </div>

        <div className="mt-5 rounded-[20px] border border-blue-100 bg-blue-50 p-4 text-sm leading-7 text-slate-600">
          <span className="font-black text-blue-700">ヒント：</span>
          回答内容はカード候補を絞り込むための目安です。氏名や住所などの個人情報は入力不要です。
        </div>
      </div>
    </section>
  );
}

function QuestionChoiceCard({
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
      className={`group relative rounded-[20px] border bg-white p-5 text-left shadow-sm transition hover:scale-[1.02] hover:shadow-md ${
        selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-900'
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${
            selected
              ? 'bg-blue-600 text-white'
              : 'bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600'
          }`}
        >
          {selected ? '✓' : '○'}
        </div>

        <div>
          <p className="text-lg font-black">{label}</p>
          <p className="mt-1 text-sm leading-6 text-slate-500">{desc}</p>
        </div>
      </div>
    </button>
  );
}

function Loading({ text }: { text: string }) {
  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:px-5 md:py-16">
      <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-center shadow-sm md:p-10">
        <div className="mx-auto mb-6 max-w-md overflow-hidden rounded-[24px] bg-[#f8fafc]">
          <img
            src="/images/diagnosis-loading.png"
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

function LoadingCheck({ text, active }: { text: string; active: boolean }) {
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

function Result({
  mainCard,
  scores,
  onReset,
}: {
  mainCard: CardId;
  scores: Record<CardId, number>;
  onReset: () => void;
}) {
  const main = getCardName(mainCard);

  return (
    <section className="bg-[#f8fafc] px-4 py-8 md:px-5 md:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <img
            src="/images/diagnosis-result.png"
            alt="診断レポート"
            className="h-auto w-full object-cover"
          />
        </div>

        <div className="rounded-[28px] border border-blue-100 bg-white p-6 text-center shadow-sm md:p-10">
          <p className="text-sm font-black tracking-[0.2em] text-blue-600">
            診断完了
          </p>

          <h2 className="mt-4 text-3xl font-black leading-tight text-slate-900 md:text-5xl">
            あなたにおすすめのカードは
            <br />
            <span className="text-blue-600">{main}</span>
            です
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
            回答内容をもとに、cardcheck編集部が定めた基準で候補を整理しました。
            診断結果は目安として、申し込み前に公式サイトで最新条件をご確認ください。
          </p>

          <div className="mx-auto mt-8 max-w-md rounded-[24px] bg-blue-50 p-6">
            <p className="text-sm font-bold text-blue-700">おすすめスコア</p>
            <p className="mt-2 text-5xl font-black text-blue-600">
              {scores[mainCard]}
              <span className="text-2xl">点</span>
            </p>
            <p className="mt-2 text-lg text-yellow-400">★★★★★</p>
          </div>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <ResultTypeCard />
          <ResultReasonCard />
        </div>

        <NoticeBox />
        <MainCta card={mainCard} />
        <OtherOptions />
        <FAQ />
        <EditorBox />

        <div className="mt-8 rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm">
          <p className="text-sm font-bold text-slate-500">
            回答を変えて、別の候補も確認できます。
          </p>
          <button
            onClick={onReset}
            className="mt-4 w-full rounded-[20px] border border-slate-200 bg-white px-6 py-4 font-black text-slate-900 shadow-sm transition hover:scale-[1.02] hover:shadow-md sm:w-auto"
          >
            もう一度診断する
          </button>
        </div>
      </div>
    </section>
  );
}

function ResultTypeCard() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900">
        あなたはこんなタイプでした
      </h3>
      <div className="mt-5 space-y-3">
        <ResultTypeRow title="初心者向け" score="高い" level={5} />
        <ResultTypeRow title="年会費重視" score="高い" level={5} />
        <ResultTypeRow title="ポイント重視" score="やや高い" level={4} />
        <ResultTypeRow title="旅行・優待" score="低め" level={2} />
      </div>
    </div>
  );
}

function ResultReasonCard() {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-black text-slate-900">
        おすすめする理由
      </h3>
      <div className="mt-5 grid gap-3">
        <ResultReason title="年会費無料" text="維持費をかけずに持ちやすく、初めての1枚として検討しやすいです。" />
        <ResultReason title="普段使いに向きやすい" text="日常の買い物やネット利用など、幅広い場面で使いやすい候補です。" />
        <ResultReason title="初心者でも選びやすい" text="難しい条件よりも、まず持ちやすさを重視したい方に向きやすいです。" />
      </div>
    </div>
  );
}

function ResultTypeRow({ title, score, level }: { title: string; score: string; level: number }) {
  return (
    <div className="rounded-[20px] bg-[#f8fafc] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="font-black text-slate-900">{title}</p>
        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">
          {score}
        </span>
      </div>
      <div className="mt-3 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`h-2 flex-1 rounded-full ${i < level ? 'bg-blue-600' : 'bg-slate-200'}`} />
        ))}
      </div>
    </div>
  );
}

function ResultReason({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[20px] bg-[#f8fafc] p-4">
      <p className="font-black text-slate-900">✓ {title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function NoticeBox() {
  return (
    <div className="mt-8 rounded-[24px] border border-yellow-200 bg-yellow-50 p-6 text-yellow-900 shadow-sm">
      <h3 className="text-xl font-black">申し込み前に確認しましょう</h3>
      <ul className="mt-4 space-y-2 text-sm leading-7">
        <li>・カード発行には審査があります。</li>
        <li>・必ず発行されるわけではありません。</li>
        <li>・ポイント制度や特典は変更される場合があります。</li>
        <li>・最新条件は必ず公式サイトで確認してください。</li>
      </ul>
    </div>
  );
}

function MainCta({ card }: { card: CardId }) {
  if (card === 'epos') {
    return (
      <div className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <CtaHeader name="エポスカード" />
        <div className="p-6 text-center">
          <CtaNote />
          <div className="flex justify-center">
            <A8EposBanner />
          </div>
        </div>
      </div>
    );
  }

  const href = card === 'rakuten' ? RAKUTEN_LINK : SURUGA_LINK;
  const name = getCardName(card);

  return (
    <div className="mt-8 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <CtaHeader name={name} />
      <div className="p-6 text-center">
        <CtaNote />
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
          className="inline-flex w-full items-center justify-center gap-2 rounded-[20px] bg-blue-600 px-8 py-4 text-lg font-black text-white shadow-sm transition hover:scale-[1.02] hover:bg-blue-700 hover:shadow-md sm:w-auto"
        >
          公式サイトを見る
          <ArrowRight className="h-5 w-5" />
        </a>
      </div>
    </div>
  );
}

function CtaHeader({ name }: { name: string }) {
  return (
    <div className="bg-blue-50 px-6 py-5 text-center">
      <p className="text-sm font-black tracking-[0.2em] text-blue-600">
        OFFICIAL SITE
      </p>
      <h3 className="mt-2 text-2xl font-black text-slate-900">{name}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        公式サイトで、最新条件・特典・申し込み内容を確認できます。
      </p>
    </div>
  );
}

function CtaNote() {
  return (
    <div className="mb-5 rounded-[20px] bg-[#f8fafc] p-4 text-sm leading-7 text-slate-600">
      申し込みは任意です。まずは年会費・特典・発行条件を確認してから判断できます。
    </div>
  );
}

function OtherOptions() {
  return (
    <div className="mt-10">
      <p className="text-sm font-black tracking-[0.2em] text-blue-600">
        OTHER OPTIONS
      </p>
      <h3 className="mt-2 text-2xl font-black text-slate-900">他の候補</h3>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <SubCard title="スルガJCBカード" score="84点" text="JCBブランドを希望する方の候補になります。" />
        <SubCard title="エポスカード" score="80点" text="旅行・優待や即日発行を重視する方の候補になります。" />
      </div>
    </div>
  );
}

function SubCard({ title, score, text }: { title: string; score: string; text: string }) {
  return (
    <div className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xl font-black">{title}</p>
      <p className="mt-2 font-black text-blue-600">{score}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function FAQ() {
  const items = [
    ['診断は無料ですか？', 'はい、無料で利用できます。診断結果を見るために料金が発生することはありません。'],
    ['個人情報は必要ですか？', 'この診断では、氏名・住所・電話番号などの個人情報は入力不要です。'],
    ['申し込み義務はありますか？', 'ありません。診断結果を見たあと、申し込まずにページを閉じても問題ありません。'],
    ['審査に必ず通りますか？', 'いいえ。クレジットカードには審査があり、診断結果は審査通過を保証するものではありません。'],
  ];

  return (
    <div className="mt-10 rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <p className="text-sm font-black tracking-[0.2em] text-blue-600">FAQ</p>
      <h3 className="mt-2 text-2xl font-black text-slate-900">よくある質問</h3>

      <div className="mt-6 space-y-3">
        {items.map(([q, a]) => (
          <details key={q} className="group rounded-[20px] border border-slate-200 bg-[#f8fafc] p-5 transition hover:bg-white hover:shadow-sm">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-black text-slate-900">
              <span>{q}</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm transition group-open:rotate-45">
                +
              </span>
            </summary>
            <p className="mt-4 text-sm leading-7 text-slate-600">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function EditorBox() {
  return (
    <div className="mt-10 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="bg-[#f8fafc] p-6 md:p-8">
        <p className="text-sm font-black tracking-[0.2em] text-blue-600">
          EDITORIAL POLICY
        </p>
        <h3 className="mt-2 text-2xl font-black text-slate-900">
          cardcheck編集部について
        </h3>
        <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-600">
          cardcheck編集部では、初めてクレジットカードを選ぶ方にもわかりやすいよう、
          年会費・使いやすさ・ポイント・初心者向けかどうかなどを整理して情報発信しています。
        </p>
      </div>

      <div className="grid border-t border-slate-200 md:grid-cols-3">
        <EditorPoint title="初心者向け" text="難しい専門用語をできるだけ避けて説明します。" />
        <EditorPoint title="比較しやすく整理" text="年会費や使いやすさなど、選び方の軸を整理します。" />
        <EditorPoint title="申し込みは任意" text="診断結果は目安であり、申し込みを強制するものではありません。" />
      </div>
    </div>
  );
}

function EditorPoint({ title, text }: { title: string; text: string }) {
  return (
    <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r md:last:border-r-0">
      <p className="font-black text-slate-900">{title}</p>
      <p className="mt-2 text-sm leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function FloatingStartButton({ onStart }: { onStart: () => void }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white/90 px-4 py-3 shadow-lg backdrop-blur md:hidden">
      <button
        onClick={onStart}
        className="w-full rounded-[20px] bg-blue-600 px-6 py-4 text-base font-black text-white shadow-sm transition active:scale-[0.98]"
      >
        無料で診断する
      </button>
      <p className="mt-2 text-center text-[11px] leading-5 text-slate-500">
        個人情報不要・診断は無料です
      </p>
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
