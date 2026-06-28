import { Clock3 } from 'lucide-react';
import type { AnswerKey, Answers, questions } from '@/lib/diagnosis';

export function QuestionScreen({
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
  const remaining = 7 - step - 1;

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
              質問 {step + 1} / 7
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
        selected
          ? 'border-blue-600 bg-blue-50 text-blue-700'
          : 'border-slate-200 text-slate-900'
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
