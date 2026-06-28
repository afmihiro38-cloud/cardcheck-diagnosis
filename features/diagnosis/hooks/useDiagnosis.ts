'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  type AnswerKey,
  type Answers,
  initialAnswers,
  questions,
  getScores,
  getMainCard,
} from '../lib/diagnosis';
import { track } from '../lib/tracking';

export type DiagnosisPhase = 'hero' | 'question' | 'loading' | 'result';

export function useDiagnosis() {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [step, setStep] = useState(0);
  const [phase, setPhase] = useState<DiagnosisPhase>('hero');
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
    const nextAnswers = { ...answers, [key]: value };
    setAnswers(nextAnswers);

    track('diagnosis_answer_select', {
      question_key: key,
      answer_value: value,
      question_number: step + 1,
    });

    setTimeout(() => {
      if (step < questions.length - 1) {
        setStep((prev) => prev + 1);
      } else {
        setPhase('loading');
        runLoading(nextAnswers);
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

    texts.forEach((text, index) => {
      setTimeout(() => setLoadingText(text), index * 450);
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
    setLoadingText('年会費を確認しています');

    track('diagnosis_retry_click');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    answers,
    step,
    phase,
    loadingText,
    currentQuestion,
    progress,
    scores,
    mainCard,
    start,
    select,
    reset,
  };
}
