import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  ArrowUp,
  ArrowDown,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Layers,
  FileText,
  Upload,
  Printer,
  Download,
  Eye,
  UserCheck,
  Columns,
  Type,
  LayoutGrid,
  List,
  Check,
  Copy,
  Sliders,
  Settings2,
} from 'lucide-react';
import { Question, QuestionType, ExamHeader, LayoutSettings } from '../../types';
import { PrintSheet } from '../PrintSheet';
import { exportToWordDocx } from '../../utils/docxExport';
import { extractDocxText } from '../../utils/docxReader';

interface QuestionsTabProps {
  header: ExamHeader;
  setHeader: React.Dispatch<React.SetStateAction<ExamHeader>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  layout: LayoutSettings;
  setLayout: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  onOpenQuestionModal: (q?: Question | null) => void;
  onOpenAiModal: () => void;
  defaultScore: number;
  setDefaultScore: (score: number) => void;
}

export const QuestionsTab: React.FC<QuestionsTabProps> = ({
  header,
  setHeader,
  questions,
  setQuestions,
  layout,
  setLayout,
  onOpenQuestionModal,
  onOpenAiModal,
  defaultScore,
  setDefaultScore,
}) => {
  const [viewMode, setViewMode] = useState<'paper' | 'list'>('paper'); // paper = محیط برگه‌ای و زنده مثل Word / list = مدیریت لیست سوالات
  const [examMode, setExamMode] = useState<'student' | 'teacher'>('student');
  const [isLiveEditing, setIsLiveEditing] = useState<boolean>(true);

  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState('');
  const [bulkMessage, setBulkMessage] = useState('');
  const [copied, setCopied] = useState(false);

  // Word (.docx) export handler
  const handleExportWord = () => {
    exportToWordDocx(header, questions, layout, examMode);
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Copy full exam text
  const handleCopyText = () => {
    let fullText = `${header.schoolName || ''} - ${header.subject || ''}\n`;
    fullText += `تاریخ: ${header.examDate || ''} | مدت: ${header.durationMinutes || ''} | پایه: ${header.gradeAndField || ''}\n\n`;

    questions.forEach((q, idx) => {
      fullText += `(${idx + 1}) ${q.text} (${q.score} نمره)\n`;
      if (q.options) {
        q.options.forEach((opt, oIdx) => {
          fullText += `   (${['۱', '۲', '۳', '۴'][oIdx]}) ${opt}\n`;
        });
      }
      if (examMode === 'teacher' && q.answerText) {
        fullText += `   پاسخ: ${q.answerText}\n`;
      }
      fullText += `\n`;
    });

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Move Question Up/Down
  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === questions.length - 1)
    ) {
      return;
    }
    const updated = [...questions];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    updated.forEach((q, i) => (q.order = i + 1));
    setQuestions(updated);
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleScoreChange = (id: string, newScore: number) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, score: newScore } : q))
    );
  };

  // Word file upload handler
  const handleWordUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setBulkMessage('در حال خواندن فایل Word...');
      const buf = await file.arrayBuffer();
      const extracted = await extractDocxText(buf);

      if (!extracted) {
        setBulkMessage('متنی در این فایل Word پیدا نشد.');
        return;
      }

      setBulkText((prev) => (prev ? `${prev}\n${extracted}` : extracted));
      setShowBulkPaste(true);
      setBulkMessage('متن فایل Word استخراج شد؛ برای افزودن، دکمه «تبدیل به سوالات» را بزنید.');
    } catch (err: any) {
      setBulkMessage(err.message || 'خطا در خواندن فایل Word');
    } finally {
      e.target.value = '';
    }
  };

  const handleConvertBulk = () => {
    const lines = bulkText
      .split(/\n+/)
      .map((l) => l.trim())
      .filter(Boolean);

    if (!lines.length) {
      setBulkMessage('متنی برای تبدیل وارد نشده است.');
      return;
    }

    const newQuestions: Question[] = [];

    lines.forEach((line, idx) => {
      let type: QuestionType = 'essay';
      let parenChoices: string[] | undefined = undefined;

      if (/_{2,}/.test(line)) {
        type = 'blank';
      } else if (/\([^()]*\/[^()]*\)/.test(line)) {
        type = 'parenthetical';
        const match = line.match(/\(([^()]*\/[^()]*)\)/);
        if (match) {
          parenChoices = match[1].split('/').map((c) => c.trim());
        }
      }

      newQuestions.push({
        id: 'q_bulk_' + Date.now() + '_' + idx,
        type,
        text: line,
        score: defaultScore,
        order: questions.length + idx + 1,
        parenChoices,
        answerSpaceLines: 3,
      });
    });

    setQuestions([...questions, ...newQuestions]);
    setBulkText('');
    setShowBulkPaste(false);
    setBulkMessage(`${newQuestions.length} سوال با موفقیت افزوده شد.`);
  };

  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);

  const getTypeName = (t: QuestionType) => {
    switch (t) {
      case 'essay':
        return 'تشریحی';
      case 'multiple_choice':
        return 'تست';
      case 'blank':
        return 'جای خالی';
      case 'parenthetical':
        return 'پرانتزی';
      case 'true_false':
        return 'صحیح/غلط';
      case 'short_answer':
        return 'کوتاه پاسخ';
      case 'matching':
        return 'وصل کردنی';
      default:
        return 'سوال';
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Action & Toolbar Bar */}
      <div className="no-print bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-3">
        {/* Row 1: Main View Toggles & Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Workspace View Switcher (Paper WYSIWYG vs List) */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('paper')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                viewMode === 'paper'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>محیط برگه امتحانی (مثل Word)</span>
            </button>

            <button
              onClick={() => setViewMode('list')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>مدیریت لیست سوالات</span>
            </button>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-3 text-xs font-semibold">
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/60 px-3 py-1.5 rounded-xl text-slate-800 dark:text-slate-200">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>تعداد:</span>
              <span className="font-extrabold text-sm">{questions.length} سوال</span>
            </div>

            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/50 px-3 py-1.5 rounded-xl">
              <span>بارم کل:</span>
              <span className="font-black text-amber-600 dark:text-amber-400 text-base">
                {totalScore}
              </span>
              <span>نمره</span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Word Export Button */}
            <button
              onClick={handleExportWord}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              title="دانلود فایل Word کامل با سربرگ و اصلاح پرانتزها"
            >
              <Download className="w-4 h-4 text-amber-300" />
              <span>دانلود فایل Word (.docx)</span>
            </button>

            {/* Print / PDF Button */}
            <button
              onClick={handlePrint}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>چاپ / خروجی PDF</span>
            </button>

            {/* AI Modal Button */}
            <button
              onClick={onOpenAiModal}
              className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>تولید با AI</span>
            </button>

            {/* Add Question Button */}
            <button
              onClick={() => onOpenQuestionModal(null)}
              className="bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              <span>افزودن سوال</span>
            </button>
          </div>
        </div>

        {/* Row 2: Live Word Formatting Toolbar (Visible in Paper Mode) */}
        {viewMode === 'paper' && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
              <button
                onClick={() => setExamMode('student')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  examMode === 'student'
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>برگه دانش‌آموز</span>
              </button>
              <button
                onClick={() => setExamMode('teacher')}
                className={`px-3 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition ${
                  examMode === 'teacher'
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>پاسخ‌نامه معلم</span>
              </button>
            </div>

            {/* Formatting quick controls */}
            <div className="flex items-center gap-3 flex-wrap text-slate-700 dark:text-slate-300">
              {/* Columns Switcher */}
              <button
                onClick={() =>
                  setLayout((prev) => ({ ...prev, columns: prev.columns === 1 ? 2 : 1 }))
                }
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold flex items-center gap-1 transition"
              >
                <Columns className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>{layout.columns === 1 ? 'تک ستونه' : 'دو ستونه'}</span>
              </button>

              {/* Font Family */}
              <div className="flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <select
                  value={layout.fontFamily}
                  onChange={(e) =>
                    setLayout((prev) => ({ ...prev, fontFamily: e.target.value as any }))
                  }
                  className="bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                >
                  <option value="Vazirmatn">وزیرمتن</option>
                  <option value="Sahel">ساحل</option>
                  <option value="Shabnam">شبنم</option>
                  <option value="B Yekan">بی‌یکان</option>
                  <option value="Tahoma">تاهما</option>
                </select>
              </div>

              {/* Answer Space Lines */}
              <button
                onClick={() =>
                  setLayout((prev) => ({ ...prev, showAnswerSpace: !prev.showAnswerSpace }))
                }
                className={`px-2.5 py-1 rounded-lg font-bold transition ${
                  layout.showAnswerSpace
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-300 dark:bg-indigo-950 dark:text-indigo-200'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-700'
                }`}
              >
                خطوط پاسخ‌نویسی: {layout.showAnswerSpace ? 'فعال' : 'غیرفعال'}
              </button>

              {/* Live Inline Editing Toggle */}
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-xs bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800/60 px-2.5 py-1 rounded-lg">
                <input
                  type="checkbox"
                  checked={isLiveEditing}
                  onChange={(e) => setIsLiveEditing(e.target.checked)}
                  className="w-3.5 h-3.5 text-amber-600 rounded"
                />
                <span>ویرایش مستقیم درون برگه</span>
              </label>

              {/* Copy Text */}
              <button
                onClick={handleCopyText}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 font-bold flex items-center gap-1 text-slate-700 dark:text-slate-200"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'کپی شد!' : 'کپی متن'}</span>
              </button>

              {/* Word Upload & Bulk Paste */}
              <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition">
                <Upload className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>ورودی Word</span>
                <input
                  type="file"
                  accept=".docx"
                  onChange={handleWordUpload}
                  className="hidden"
                />
              </label>

              <button
                onClick={() => setShowBulkPaste(!showBulkPaste)}
                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ورودی متنی</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Paste / Import Drawer */}
      {showBulkPaste && (
        <div className="no-print bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
              <FileCode className="w-4 h-4" />
              ورودی دسته‌جمعی یا متنی سوالات (هر سوال در یک سطر)
            </h3>
            <button
              onClick={() => setShowBulkPaste(false)}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              بستن
            </button>
          </div>

          <textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="سوالات خود را خط به خط وارد کنید..."
            className="w-full p-3 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-xs text-slate-800 dark:text-slate-100"
          />

          {bulkMessage && (
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {bulkMessage}
            </div>
          )}

          <div className="flex justify-end gap-2">
            <button
              onClick={handleConvertBulk}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow transition"
            >
              تبدیل و افزودن به آزمون
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Display */}
      {viewMode === 'paper' ? (
        /* LIVE EXAM PAPER SHEET WORKSPACE (Header attached right at top) */
        <div className="bg-slate-200 dark:bg-slate-950 p-3 sm:p-6 rounded-2xl overflow-x-auto min-h-[650px] flex justify-center">
          <PrintSheet
            header={header}
            setHeader={setHeader}
            questions={questions}
            setQuestions={setQuestions}
            layout={layout}
            mode={examMode}
            isEditable={isLiveEditing}
            onSelectQuestionToEdit={(q) => onOpenQuestionModal(q)}
            onAddQuestionInline={() => onOpenQuestionModal(null)}
          />
        </div>
      ) : (
        /* QUESTIONS LIST MANAGER VIEW */
        <div className="space-y-3 no-print">
          {questions.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                هنوز سوالی برای این آزمون ثبت نشده است!
              </h3>
              <div className="pt-2 flex justify-center gap-2">
                <button
                  onClick={onOpenAiModal}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  تولید خودکار سوال با AI
                </button>
                <button
                  onClick={() => onOpenQuestionModal(null)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  افزودن دستی سوال
                </button>
              </div>
            </div>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-sm space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-700 font-extrabold text-xs flex items-center justify-center shrink-0 text-slate-800 dark:text-slate-200">
                      {idx + 1}
                    </span>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                        {q.text}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                          {getTypeName(q.type)}
                        </span>
                        {q.category && (
                          <span className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md">
                            {q.category}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 px-2 py-1 rounded-xl">
                      <span className="text-[11px] font-semibold text-amber-800 dark:text-amber-300">بارم:</span>
                      <input
                        type="number"
                        step="0.25"
                        min="0"
                        value={q.score}
                        onChange={(e) => handleScoreChange(q.id, parseFloat(e.target.value) || 0)}
                        className="w-14 text-center font-black text-xs text-amber-900 dark:text-amber-200 bg-transparent outline-none"
                      />
                    </div>

                    <div className="flex flex-col gap-0.5">
                      <button
                        onClick={() => moveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => moveQuestion(idx, 'down')}
                        disabled={idx === questions.length - 1}
                        className="p-1 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => onOpenQuestionModal(q)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      title="ویرایش سوال"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => deleteQuestion(q.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition"
                      title="حذف سوال"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {q.answerText && (
                  <div className="mt-2 text-xs bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 p-2.5 rounded-xl text-slate-700 dark:text-slate-300">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-1">
                      پاسخ معلم:
                    </span>
                    {q.answerText}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
