export type AnswerKey =
  | 'status'
  | 'firstCard'
  | 'annualFee'
  | 'points'
  | 'speed'
  | 'brand'
  | 'useCase';

export type CardId = 'rakuten' | 'epos' | 'suruga';

export type Answers = Record<AnswerKey, string>;

export const initialAnswers: Answers = {
  status: '',
  firstCard: '',
  annualFee: '',
  points: '',
  speed: '',
  brand: '',
  useCase: '',
};

export const questions = [
  {
    key: 'status' as AnswerKey,
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
    key: 'firstCard' as AnswerKey,
    title: 'クレジットカードは初めてですか？',
    hint: '初めての方には、分かりやすく使いやすいカードを優先します。',
    choices: [
      { value: 'yes', label: '初めて', desc: '最初の1枚として選びやすいカードを探したい' },
      { value: 'no', label: 'すでに持っている', desc: '今のカードとは違う候補も見てみたい' },
    ],
  },
  {
    key: 'annualFee' as AnswerKey,
    title: '年会費は重視しますか？',
    hint: '維持費をかけたくない場合は、年会費無料を重視しましょう。',
    choices: [
      { value: 'free', label: '年会費無料がいい', desc: 'コストをかけずに持てるカードを優先したい' },
      { value: 'not_matter', label: 'そこまで気にしない', desc: '特典や使いやすさも含めて考えたい' },
    ],
  },
  {
    key: 'points' as AnswerKey,
    title: 'ポイント還元は重視しますか？',
    hint: '普段の買い物やネットショッピングでポイントを貯めたいかを確認します。',
    choices: [
      { value: 'high', label: '重視する', desc: '日常の支払いでポイントを貯めたい' },
      { value: 'normal', label: '普通でいい', desc: 'ポイントよりも使いやすさや安心感を重視したい' },
    ],
  },
  {
    key: 'speed' as AnswerKey,
    title: 'すぐに使いたいですか？',
    hint: '急ぎの場合は、発行スピードも候補選びに影響します。',
    choices: [
      { value: 'fast', label: 'できるだけ早く使いたい', desc: '急ぎでカードを準備したい' },
      { value: 'normal', label: '急ぎではない', desc: '条件を見ながらじっくり選びたい' },
    ],
  },
  {
    key: 'brand' as AnswerKey,
    title: '国際ブランドの希望はありますか？',
    hint: 'JCB希望などがあれば、候補に反映します。',
    choices: [
      { value: 'jcb', label: 'JCBがいい', desc: 'JCBブランドを希望している' },
      { value: 'any', label: 'こだわりなし', desc: 'ブランドよりも総合的な使いやすさを重視したい' },
    ],
  },
  {
    key: 'useCase' as AnswerKey,
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

export function getScores(answers: Answers): Record<CardId, number> {
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

export function getMainCard(scores: Record<CardId, number>): CardId {
  return Object.entries(scores).sort((a, b) => b[1] - a[1])[0][0] as CardId;
}

export function getCardName(card: CardId) {
  if (card === 'rakuten') return '楽天カード';
  if (card === 'epos') return 'エポスカード';
  return 'スルガJCBカード';
}
