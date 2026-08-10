import React, { useRef, useState } from 'react';
import { Download, Upload, RefreshCw, FileText, CheckCircle2, HelpCircle, ShieldCheck } from 'lucide-react';
import { ExamHeader, Question, LayoutSettings, ExamProject } from '../../types';
import { DEFAULT_HEADER, DEFAULT_LAYOUT, SAMPLE_QUESTIONS } from '../../data/presets';

interface ToolsTabProps {
  header: ExamHeader;
  setHeader: React.Dispatch<React.SetStateAction<ExamHeader>>;
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
  layout: LayoutSettings;
  setLayout: React.Dispatch<React.SetStateAction<LayoutSettings>>;
  onLoadPreset: (preset: { header: ExamHeader; questions: Question[] }) => void;
}

export const ToolsTab: React.FC<ToolsTabProps> = ({
  header,
  setHeader,
  questions,
  setQuestions,
  layout,
  setLayout,
  onLoadPreset,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toastMsg, setToastMsg] = useState('');

  // Backup JSON
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      header,
      questions,
      layout,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `پشتیبان_آزمون_${header.subject || 'کاغذی'}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg('فایل پشتیبان با موفقیت دانلود شد.');
  };

  // Restore JSON
  const handleRestoreBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.header) setHeader(data.header);
        if (data.questions) setQuestions(data.questions);
        if (data.layout) setLayout(data.layout);
        setToastMsg('فایل پشتیبان با موفقیت بازیابی شد.');
      } catch (err) {
        setToastMsg('فرمت فایل پشتیبان نامعتبر است.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Reset to default sample exam
  const handleReset = () => {
    if (window.confirm('آیا مطمئن هستید که می‌خواهید آزمون جدید شروع کنید؟')) {
      setHeader(DEFAULT_HEADER);
      setQuestions(SAMPLE_QUESTIONS);
      setLayout(DEFAULT_LAYOUT);
      setToastMsg('آزمون جدید بارگذاری شد.');
    }
  };

  return (
    <div className="space-y-6 no-print">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. Backup & Restore Box */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            پشتیبان‌گیری و بازیابی اطلاعات پروژه
          </h2>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          شما می‌توانید از تمامی سوالات، بارم‌ها و سربرگ آزمون فعلی یک خروجی آفلاین به فرمت JSON تهیه کنید تا بعداً در مرورگر دیگر یا سیستم دیگری آن را بازگردانید.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportBackup}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>دانلود پشتیبان (فایل JSON)</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-100 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-300 dark:border-slate-600 transition"
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>بازیابی از فایل پشتیبان</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreBackup}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={handleReset}
            className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 border border-rose-200 dark:border-rose-800 transition mr-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>بازنشانی و شروع آزمون جدید</span>
          </button>
        </div>
      </div>

      {/* 2. Guide & Printing Tips */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
          <HelpCircle className="w-5 h-5 text-amber-500" />
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white">
            راهنمای تنظیمات چاپ و پرینت استاندارد
          </h2>
        </div>

        <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
          <li>
            هنگام کلیک روی دکمه <strong>«چاپ برگه»</strong>، در پنجره پرینتر مرورگر تنظیمات <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Margins</code> را روی <strong>Default</strong> یا <strong>Minimum</strong> قرار دهید.
          </li>
          <li>
            گزینه <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">Background graphics</code> را حتماً تیک بزنید تا خطوط جدول‌ها و کادرهای پاسخ به صورت کامل چاپ شوند.
          </li>
          <li>
            اگر می‌خواهید برگه امتحانی کم‌حجم‌تر شود، در تب طراحی چیدمان گزینه <strong>دو ستونه</strong> را انتخاب کنید.
          </li>
          <li>
            برای ایجاد فایل PDF آنلاین، در پنجره پرینت گزینه Destination را روی <strong>Save as PDF</strong> تنظیم کنید.
          </li>
        </ul>
      </div>
    </div>
  );
};
