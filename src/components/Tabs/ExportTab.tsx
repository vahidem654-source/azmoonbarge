import React, { useState } from 'react';
import { Printer, Download, Copy, Check, Eye, UserCheck, Columns, Sparkles } from 'lucide-react';
import { ExamHeader, Question, LayoutSettings } from '../../types';
import { PrintSheet } from '../PrintSheet';
import { exportToWordDocx } from '../../utils/docxExport';

interface ExportTabProps {
  header: ExamHeader;
  questions: Question[];
  layout: LayoutSettings;
  setLayout: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  subjectName: string;
}

export const ExportTab: React.FC<ExportTabProps> = ({
  header,
  questions,
  layout,
  setLayout,
  subjectName,
}) => {
  const [mode, setMode] = useState<'student' | 'teacher'>('student');
  const [copied, setCopied] = useState(false);
  const [isGeneratingAnswers, setIsGeneratingAnswers] = useState(false);
  const [aiAnswerMsg, setAiAnswerMsg] = useState('');

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    let fullText = `${header.schoolName} - ${header.subject}\n`;
    fullText += `تاریخ: ${header.examDate} | مدت: ${header.durationMinutes} | پایه: ${header.gradeAndField}\n\n`;

    questions.forEach((q, idx) => {
      fullText += `${idx + 1}- ${q.text} (${q.score} نمره)\n`;
      if (q.options) {
        q.options.forEach((opt, oIdx) => {
          fullText += `   ${['الف', 'ب', 'ج', 'د'][oIdx]}) ${opt}\n`;
        });
      }
      if (mode === 'teacher' && q.answerText) {
        fullText += `   پاسخ: ${q.answerText}\n`;
      }
      fullText += `\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Generate Answer Key automatically with Gemini
  const handleGenerateAiAnswers = async () => {
    setIsGeneratingAnswers(true);
    setAiAnswerMsg('در حال تولید کلید پاسخ‌نامه با هوش مصنوعی...');

    try {
      const response = await fetch('/api/ai/generate-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, subject: header.subject }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.answers)) {
        // Map back to questions
        const answersMap = new Map<string, any>(data.answers.map((a: any) => [a.id, a]));
        questions.forEach((q) => {
          const ans = answersMap.get(q.id);
          if (ans) {
            if (ans.answerText) q.answerText = ans.answerText;
            if (ans.keywords) q.keywords = ans.keywords;
          }
        });
        setMode('teacher');
        setAiAnswerMsg('پاسخ‌نامه تشریحی با موفقیت تولید شد!');
      } else {
        setAiAnswerMsg('خطا در دریافت پاسخ‌ها: ' + (data.error || ''));
      }
    } catch (err: any) {
      setAiAnswerMsg('خطا در برقراری ارتباط با AI: ' + (err.message || ''));
    } finally {
      setIsGeneratingAnswers(false);
    }
  };

  return (
    <div className="space-y-4 no-print">
      {/* Top Action Toolbar */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        {/* Left: Mode Selection */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button
            onClick={() => setMode('student')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              mode === 'student'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>برگه امتحانی دانش‌آموز</span>
          </button>

          <button
            onClick={() => setMode('teacher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
              mode === 'teacher'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>پاسخ‌نامه و کلید معلم</span>
          </button>
        </div>

        {/* Center: Column Switcher */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() =>
              setLayout((prev) => ({ ...prev, columns: prev.columns === 1 ? 2 : 1 }))
            }
            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1 hover:bg-slate-200 transition"
          >
            <Columns className="w-4 h-4" />
            <span>{layout.columns === 1 ? 'تک ستونه' : 'دو ستونه (فشرده)'}</span>
          </button>

          {mode === 'teacher' && (
            <button
              onClick={handleGenerateAiAnswers}
              disabled={isGeneratingAnswers}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>تولید خودکار پاسخ‌نامه با AI</span>
            </button>
          )}
        </div>

        {/* Right: Export Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToWordDocx(header, questions, layout, mode)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition"
            title="دانلود فایل Word کامل با سربرگ و اصلاح پرانتزها"
          >
            <Download className="w-4 h-4 text-amber-300" />
            <span>دانلود فایل Word (.docx)</span>
          </button>

          <button
            onClick={handleCopyText}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-slate-300 dark:border-slate-600 transition"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'کپی شد!' : 'کپی متنی'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 shadow-md shadow-emerald-900/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ مستقیم / ذخیره PDF</span>
          </button>
        </div>
      </div>

      {aiAnswerMsg && (
        <div className="p-3 bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl text-xs font-bold">
          {aiAnswerMsg}
        </div>
      )}

      {/* Printable Sheet Live Preview */}
      <div className="bg-slate-200 dark:bg-slate-950 p-4 sm:p-8 rounded-2xl overflow-x-auto min-h-[600px] flex justify-center">
        <PrintSheet
          header={header}
          questions={questions}
          layout={layout}
          mode={mode}
        />
      </div>
    </div>
  );
};
