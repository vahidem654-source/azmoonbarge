import React, { useState } from 'react';
import { Database, Search, Plus, Save, Tag, Check, Filter } from 'lucide-react';
import { Question, BankQuestion } from '../../types';
import { SUBJECT_OPTIONS } from '../../data/presets';

interface QuestionBankTabProps {
  bank: BankQuestion[];
  setBank: React.Dispatch<React.SetStateAction<BankQuestion[]>>;
  currentQuestions: Question[];
  onAddQuestionToExam: (question: Question) => void;
}

export const QuestionBankTab: React.FC<QuestionBankTabProps> = ({
  bank,
  setBank,
  currentQuestions,
  onAddQuestionToExam,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [message, setMessage] = useState('');

  const filteredBank = bank.filter((q) => {
    const matchesQuery =
      !searchQuery ||
      q.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject =
      selectedSubject === 'all' || q.subject === selectedSubject;

    return matchesQuery && matchesSubject;
  });

  const handleAddQuestion = (q: BankQuestion) => {
    onAddQuestionToExam(q);
    setAddedIds((prev) => new Set(prev).add(q.id));
  };

  const handleSaveCurrentToBank = () => {
    if (currentQuestions.length === 0) {
      setMessage('سوال فعلی در آزمون وجود ندارد.');
      return;
    }

    const newBankItems: BankQuestion[] = currentQuestions.map((q) => ({
      ...q,
      subject: 'ریاضی',
      grade: 'دوازدهم',
      tags: ['آزمون حضوری'],
      createdAt: new Date().toISOString(),
    }));

    // Avoid duplicates by text
    const existingTexts = new Set(bank.map((b) => b.text));
    const uniqueNew = newBankItems.filter((q) => !existingTexts.has(q.text));

    setBank([...bank, ...uniqueNew]);
    setMessage(`${uniqueNew.length} سوال به بانک سوالات شما اضافه شد.`);
  };

  return (
    <div className="space-y-4 no-print">
      {/* Search and Filter Topbar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجو در متن یا مبحث سوالات بانک..."
              className="w-full pr-9 pl-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
            />
          </div>

          <div className="flex items-center gap-1">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold"
            >
              <option value="all">همه درس‌ها</option>
              {SUBJECT_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSaveCurrentToBank}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
        >
          <Save className="w-4 h-4" />
          <span>ذخیره سوالات آزمون فعلی در بانک</span>
        </button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold">
          {message}
        </div>
      )}

      {/* Bank Items List */}
      <div className="space-y-3">
        {filteredBank.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 text-center text-slate-500 text-xs">
            سوالی با این مشخصات در بانک پیدا نشد.
          </div>
        ) : (
          filteredBank.map((q, idx) => {
            const isAdded = addedIds.has(q.id);
            return (
              <div
                key={q.id || idx}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex items-start justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 px-2 py-0.5 rounded">
                      {q.subject || 'عمومی'}
                    </span>
                    {q.category && (
                      <span className="text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                        {q.category}
                      </span>
                    )}
                    <span className="text-[10px] text-amber-700 font-extrabold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {q.score} نمره
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-relaxed pt-1">
                    {q.text}
                  </div>

                  {q.answerText && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 font-sans">
                      پاسخ: {q.answerText}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => handleAddQuestion(q)}
                  disabled={isAdded}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition shrink-0 ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-800 font-black'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      افزوده شد
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      افزودن به آزمون
                    </>
                  )}
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
