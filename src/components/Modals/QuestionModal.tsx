import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { Question, QuestionType, MatchingPair } from '../../types';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  initialQuestion?: Question | null;
  defaultScore: number;
  totalExistingQuestions: number;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion,
  defaultScore,
  totalExistingQuestions,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<QuestionType>(initialQuestion?.type || 'essay');
  const [text, setText] = useState<string>(initialQuestion?.text || '');
  const [score, setScore] = useState<number>(
    initialQuestion?.score !== undefined ? initialQuestion.score : defaultScore
  );
  const [category, setCategory] = useState<string>(initialQuestion?.category || '');
  const [image, setImage] = useState<string>(initialQuestion?.image || '');

  // Specific state
  const [options, setOptions] = useState<string[]>(
    initialQuestion?.options || ['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴']
  );
  const [correctOption, setCorrectOption] = useState<number>(
    initialQuestion?.correctOption ?? 0
  );

  const [answerText, setAnswerText] = useState<string>(initialQuestion?.answerText || '');
  const [keywordsStr, setKeywordsStr] = useState<string>(
    initialQuestion?.keywords ? initialQuestion.keywords.join(', ') : ''
  );
  const [trueFalseAnswer, setTrueFalseAnswer] = useState<boolean>(
    initialQuestion?.trueFalseAnswer ?? true
  );

  const [parenChoices, setParenChoices] = useState<string[]>(
    initialQuestion?.parenChoices || ['گزینه ۱', 'گزینه ۲']
  );
  const [parenCorrectChoice, setParenCorrectChoice] = useState<string>(
    initialQuestion?.parenCorrectChoice || ''
  );

  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>(
    initialQuestion?.matchingPairs || [
      { id: '1', left: '', right: '' },
      { id: '2', left: '', right: '' },
    ]
  );

  const [answerSpaceLines, setAnswerSpaceLines] = useState<number>(
    initialQuestion?.answerSpaceLines || 3
  );

  useEffect(() => {
    if (initialQuestion) {
      setType(initialQuestion.type);
      setText(initialQuestion.text);
      setScore(initialQuestion.score);
      setCategory(initialQuestion.category || '');
      setImage(initialQuestion.image || '');
      if (initialQuestion.options) setOptions(initialQuestion.options);
      if (initialQuestion.correctOption !== undefined) setCorrectOption(initialQuestion.correctOption);
      if (initialQuestion.answerText) setAnswerText(initialQuestion.answerText);
      if (initialQuestion.keywords) setKeywordsStr(initialQuestion.keywords.join(', '));
      if (initialQuestion.trueFalseAnswer !== undefined) setTrueFalseAnswer(initialQuestion.trueFalseAnswer);
      if (initialQuestion.parenChoices) setParenChoices(initialQuestion.parenChoices);
      if (initialQuestion.parenCorrectChoice) setParenCorrectChoice(initialQuestion.parenCorrectChoice);
      if (initialQuestion.matchingPairs) setMatchingPairs(initialQuestion.matchingPairs);
      if (initialQuestion.answerSpaceLines) setAnswerSpaceLines(initialQuestion.answerSpaceLines);
    } else {
      setType('essay');
      setText('');
      setScore(defaultScore);
      setCategory('');
      setImage('');
      setOptions(['گزینه ۱', 'گزینه ۲', 'گزینه ۳', 'گزینه ۴']);
      setCorrectOption(0);
      setAnswerText('');
      setKeywordsStr('');
      setTrueFalseAnswer(true);
      setParenChoices(['گزینه ۱', 'گزینه ۲']);
      setParenCorrectChoice('');
      setMatchingPairs([
        { id: '1', left: '', right: '' },
        { id: '2', left: '', right: '' },
      ]);
      setAnswerSpaceLines(3);
    }
  }, [initialQuestion, defaultScore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    const keywords = keywordsStr
      .split(/[,،]/)
      .map((k) => k.trim())
      .filter(Boolean);

    const questionToSave: Question = {
      id: initialQuestion?.id || 'q_' + Date.now(),
      type,
      text: text.trim(),
      score: Number(score) || 0,
      order: initialQuestion?.order ?? totalExistingQuestions + 1,
      category: category.trim() || undefined,
      image: image.trim() || undefined,
      answerText: answerText.trim() || undefined,
      keywords: keywords.length > 0 ? keywords : undefined,
      answerSpaceLines: type === 'essay' ? Number(answerSpaceLines) : undefined,
    };

    if (type === 'multiple_choice') {
      questionToSave.options = options;
      questionToSave.correctOption = correctOption;
    } else if (type === 'true_false') {
      questionToSave.trueFalseAnswer = trueFalseAnswer;
    } else if (type === 'parenthetical') {
      questionToSave.parenChoices = parenChoices;
      questionToSave.parenCorrectChoice = parenCorrectChoice;
    } else if (type === 'matching') {
      questionToSave.matchingPairs = matchingPairs.filter((p) => p.left || p.right);
    }

    onSave(questionToSave);
    onClose();
  };

  const questionTypes: { id: QuestionType; label: string; desc: string }[] = [
    { id: 'essay', label: 'تشریحی', desc: 'سوال تشریحی همراه با کادر/خطوط پاسخ' },
    { id: 'multiple_choice', label: 'چندگزینه‌ای (تست)', desc: 'تست ۴ گزینه‌ای با علامت‌گذاری پاسخ' },
    { id: 'blank', label: 'جای خالی', desc: 'عبارت دارای ___ برای پر کردن دانش‌آموز' },
    { id: 'parenthetical', label: 'پرانتزی (انتخاب کلمه)', desc: 'انتخاب کلمه صحیح از داخل پرانتز (الف/ب)' },
    { id: 'true_false', label: 'صحیح / غلط', desc: 'تشخیص درست یا نادرست بودن عبارت' },
    { id: 'short_answer', label: 'کوتاه پاسخ', desc: 'پاسخ کوتاه یک کلمه‌ای یا عددی' },
    { id: 'matching', label: 'وصل کردنی', desc: 'جدول دو ستونی جفت کردن مفاهیم' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
        {/* Modal Header */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h2 className="text-base font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            <CheckCircle2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            {initialQuestion ? 'ویرایش سوال' : 'افزودن سوال جدید'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {/* Question Type Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1.5">
              نوع سوال:
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {questionTypes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setType(t.id)}
                  className={`p-2 rounded-xl text-right text-xs font-semibold border transition ${
                    type === t.id
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-900 dark:bg-indigo-950/60 dark:border-indigo-400 dark:text-indigo-200 ring-2 ring-indigo-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div>{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Question Text */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              متن سوال:
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="صورت سوال را بنویسید..."
              required
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm leading-relaxed"
            />
          </div>

          {/* Row: Score, Category, Lines */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                بارم (نمره):
              </label>
              <input
                type="number"
                step="0.25"
                min="0"
                value={score}
                onChange={(e) => setScore(parseFloat(e.target.value) || 0)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                مبحث / فصل:
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="مثلاً: فصل ۲ - تابع"
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
              />
            </div>

            {type === 'essay' && (
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  تعداد خطوط پاسخ‌برگ:
                </label>
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={answerSpaceLines}
                  onChange={(e) => setAnswerSpaceLines(parseInt(e.target.value) || 3)}
                  className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            )}
          </div>

          {/* Type Specific Fields */}

          {/* Multiple Choice Options */}
          {type === 'multiple_choice' && (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                گزینه‌های تست (پاسخ صحیح را علامت بزنید):
              </label>
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="correct_option"
                    checked={correctOption === idx}
                    onChange={() => setCorrectOption(idx)}
                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs font-bold w-12 text-slate-500">
                    گزینه {['۱', '۲', '۳', '۴'][idx]}:
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => {
                      const newOpts = [...options];
                      newOpts[idx] = e.target.value;
                      setOptions(newOpts);
                    }}
                    className="flex-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                </div>
              ))}
            </div>
          )}

          {/* True False Option */}
          {type === 'true_false' && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                پاسخ صحیح عبارت:
              </span>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  checked={trueFalseAnswer === true}
                  onChange={() => setTrueFalseAnswer(true)}
                  className="text-emerald-600"
                />
                درست (✓)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold">
                <input
                  type="radio"
                  checked={trueFalseAnswer === false}
                  onChange={() => setTrueFalseAnswer(false)}
                  className="text-rose-600"
                />
                نادرست (✗)
              </label>
            </div>
          )}

          {/* Parenthetical Option */}
          {type === 'parenthetical' && (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                گزینه‌های داخل پرانتز:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="گزینه ۱"
                  value={parenChoices[0] || ''}
                  onChange={(e) => setParenChoices([e.target.value, parenChoices[1] || ''])}
                  className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="گزینه ۲"
                  value={parenChoices[1] || ''}
                  onChange={(e) => setParenChoices([parenChoices[0] || '', e.target.value])}
                  className="p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
              <div className="mt-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                  پاسخ صحیح پرانتزی:
                </label>
                <input
                  type="text"
                  value={parenCorrectChoice}
                  onChange={(e) => setParenCorrectChoice(e.target.value)}
                  placeholder="مثلاً: گزینه صحیح از دو حالت بالا"
                  className="w-full p-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
              </div>
            </div>
          )}

          {/* Matching Pairs */}
          {type === 'matching' && (
            <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  جفت‌های ستون الف و ستون ب:
                </label>
                <button
                  type="button"
                  onClick={() =>
                    setMatchingPairs([
                      ...matchingPairs,
                      { id: Date.now().toString(), left: '', right: '' },
                    ])
                  }
                  className="text-xs text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> افزودن سطر
                </button>
              </div>

              {matchingPairs.map((pair, idx) => (
                <div key={pair.id || idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`ستون الف ${idx + 1}`}
                    value={pair.left}
                    onChange={(e) => {
                      const updated = [...matchingPairs];
                      updated[idx].left = e.target.value;
                      setMatchingPairs(updated);
                    }}
                    className="flex-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <span className="text-xs font-bold text-slate-400">↔</span>
                  <input
                    type="text"
                    placeholder={`ستون ب ${String.fromCharCode(65 + idx)}`}
                    value={pair.right}
                    onChange={(e) => {
                      const updated = [...matchingPairs];
                      updated[idx].right = e.target.value;
                      setMatchingPairs(updated);
                    }}
                    className="flex-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))}
                    className="text-rose-500 hover:text-rose-700 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Answer Key / Teacher Solution */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              پاسخ تشریحی / راهنمای تصحیح برای پاسخ‌نامه معلم:
            </label>
            <textarea
              rows={2}
              value={answerText}
              onChange={(e) => setAnswerText(e.target.value)}
              placeholder="پاسخ کامل سوال و نکات نمره‌دهی..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          {/* Keywords for Correction */}
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              کلیدواژه‌های تصحیح (جداشده با کاما):
            </label>
            <input
              type="text"
              value={keywordsStr}
              onChange={(e) => setKeywordsStr(e.target.value)}
              placeholder="مثلاً: فرمول دلتا، ریشه مضاعف، علامت ضریب"
              className="w-full p-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md transition"
            >
              {initialQuestion ? 'بروزرسانی سوال' : 'ذخیره و افزودن سوال'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
