import React, { useState } from 'react';
import { X, Sparkles, Loader2, BookOpen, PlusCircle } from 'lucide-react';
import { Question } from '../../types';
import { SUBJECT_OPTIONS } from '../../data/presets';

interface AiModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGeneratedQuestions: (newQuestions: Question[]) => void;
}

export const AiModal: React.FC<AiModalProps> = ({
  isOpen,
  onClose,
  onAddGeneratedQuestions,
}) => {
  if (!isOpen) return null;

  const [subject, setSubject] = useState<string>('ریاضی');
  const [grade, setGrade] = useState<string>('دوازدهم');
  const [topic, setTopic] = useState<string>('');
  const [count, setCount] = useState<number>(5);
  const [type, setType] = useState<string>('all');

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim() && !subject) {
      setErrorMsg('لطفاً عنوان مبحث یا نام درس را مشخص کنید.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');
    setGeneratedQuestions([]);

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, grade, topic, count, type }),
      });

      const data = await response.json();

      if (data.success && Array.isArray(data.questions)) {
        setGeneratedQuestions(data.questions);
      } else {
        setErrorMsg(data.error || 'خطا در دریافت سوالات از هوش مصنوعی.');
      }
    } catch (err: any) {
      setErrorMsg('خطای شبکه یا عدم پاسخگویی سرور: ' + (err.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyAll = () => {
    if (generatedQuestions.length === 0) return;
    onAddGeneratedQuestions(generatedQuestions);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-100 max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-400/20 text-amber-300 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold">طراحی هوشمند سوالات با Gemini</h2>
              <p className="text-xs text-indigo-200">تولید خودکار سوالات امتحانی به همراه پاسخ تشریحی و بارم</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-indigo-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-sm">
          {/* Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                نام درس:
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                {SUBJECT_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                پایه تحصیلی:
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="مثلاً: دوازدهم تجربی / نهم"
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
              مبحث / سرفصل امتحان:
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثلاً: فصل سوم - حد و پیوستگی / پدیده‌های الکتریکی"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                تعداد سوال:
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                نوع سوالات:
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
              >
                <option value="all">ترکیبی (تشریحی، تست، جای خالی)</option>
                <option value="essay">فقط تشریحی</option>
                <option value="multiple_choice">فقط چهارگزینه‌ای (تست)</option>
                <option value="blank">فقط جای خالی</option>
                <option value="true_false">فقط صحیح / غلط</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition disabled:opacity-50 text-xs"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                <span>در حال ساخت و تولید سوالات با هوش مصنوعی...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>شروع ساخت سوالات هوشمند</span>
              </>
            )}
          </button>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          {/* Generated Questions Preview */}
          {generatedQuestions.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="font-extrabold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  پیش‌نمایش سوالات تولید شده ({generatedQuestions.length} سوال):
                </span>
                <button
                  onClick={handleApplyAll}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 shadow"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  افزودن همه به برگه آزمون
                </button>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {generatedQuestions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {idx + 1}- {q.text}
                      </span>
                      <span className="shrink-0 bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded font-bold">
                        {q.score} نمره
                      </span>
                    </div>
                    {q.answerText && (
                      <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                        پاسخ: {q.answerText}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
