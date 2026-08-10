import React from 'react';
import {
  FileText,
  Layout,
  Printer,
  Database,
  Wrench,
  Sun,
  Moon,
  Sparkles,
  Save,
  CheckCircle2,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  questionCount: number;
  totalScore: number;
  onOpenAiModal: () => void;
  onSaveDraft: () => void;
  isSaved: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  theme,
  setTheme,
  questionCount,
  totalScore,
  onOpenAiModal,
  onSaveDraft,
  isSaved,
}) => {
  const tabs = [
    { id: 'questions', label: 'سوالات', icon: FileText, badge: questionCount },
    { id: 'header', label: 'طراحی جدول و سربرگ', icon: Layout },
    { id: 'export', label: 'خروجی و چاپ', icon: Printer },
    { id: 'bank', label: 'بانک سوالات', icon: Database },
    { id: 'tools', label: 'ابزار / راهنما', icon: Wrench },
  ];

  return (
    <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-lg no-print">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-extrabold tracking-tight flex items-center gap-2">
              آزمون‌ساز کاغذی
              <span className="text-[11px] bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-normal">
                امتحانات حضوری
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              طراحی، بارم‌بندی، چاپ برگه و پاسخ‌نامه کتبی مدارس
            </p>
          </div>
        </div>

        {/* Action Controls & Stats */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Total Score Badge */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs flex items-center gap-2">
            <span className="text-slate-400">مجموع بارم:</span>
            <span className="font-extrabold text-amber-400 text-sm">{totalScore}</span>
            <span className="text-slate-400">نمره</span>
          </div>

          {/* AI Generator Trigger */}
          <button
            onClick={onOpenAiModal}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-900/30 transition duration-150"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>تولید هوشمند سوال</span>
          </button>

          {/* Save Draft Button */}
          <button
            onClick={onSaveDraft}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="ذخیره پیش‌نویس پروژه"
          >
            {isSaved ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">ذخیره شد</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-slate-300" />
                <span>ذخیره</span>
              </>
            )}
          </button>

          {/* Print Trigger */}
          <button
            onClick={() => {
              setActiveTab('export');
              setTimeout(() => window.print(), 300);
            }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-900/20 transition"
          >
            <Printer className="w-4 h-4" />
            <span>چاپ برگه</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition"
            title="تغییر پوسته"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto no-scrollbar pt-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-t-lg text-xs font-bold flex items-center gap-2 whitespace-nowrap border-b-2 transition ${
                isActive
                  ? 'bg-slate-800 text-white border-blue-500 shadow-inner'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="bg-slate-700 text-slate-200 text-[10px] px-2 py-0.5 rounded-full font-black">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
