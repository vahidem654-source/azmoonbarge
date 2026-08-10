import React from 'react';
import { Layout, Plus, Trash2, Sliders, Type, FileText } from 'lucide-react';
import { ExamHeader, LayoutSettings } from '../../types';

interface HeaderDesignTabProps {
  header: ExamHeader;
  setHeader: React.Dispatch<React.SetStateAction<ExamHeader>>;
  layout: LayoutSettings;
  setLayout: React.Dispatch<React.SetStateAction<LayoutSettings>>;
}

export const HeaderDesignTab: React.FC<HeaderDesignTabProps> = ({
  header,
  setHeader,
  layout,
  setLayout,
}) => {
  const handleHeaderChange = (field: keyof ExamHeader, value: any) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
  };

  const handleLayoutChange = (field: keyof LayoutSettings, value: any) => {
    setLayout((prev) => ({ ...prev, [field]: value }));
  };

  const addCustomField = () => {
    const newField = {
      id: 'custom_' + Date.now(),
      label: 'عنوان جدید',
      value: 'مقدار',
      visible: true,
    };
    setHeader((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  };

  const removeCustomField = (id: string) => {
    setHeader((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((f) => f.id !== id),
    }));
  };

  const updateCustomField = (id: string, key: 'label' | 'value', val: string) => {
    setHeader((prev) => ({
      ...prev,
      customFields: prev.customFields.map((f) =>
        f.id === id ? { ...f, [key]: val } : f
      ),
    }));
  };

  return (
    <div className="space-y-6 no-print">
      {/* 1. Header Information Section */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-sm font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            <Layout className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            اطلاعات اصلی سربرگ آزمون
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            نمایش در بالای اولین صفحه برگه آزمون
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نام مدرسه / موسسه:
            </label>
            <input
              type="text"
              value={header.schoolName}
              onChange={(e) => handleHeaderChange('schoolName', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              عنوان درس / نام آزمون:
            </label>
            <input
              type="text"
              value={header.subject}
              onChange={(e) => handleHeaderChange('subject', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              پایه و رشته تحصیلی:
            </label>
            <input
              type="text"
              value={header.gradeAndField}
              onChange={(e) => handleHeaderChange('gradeAndField', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تاریخ برگزار آزمون:
            </label>
            <input
              type="text"
              value={header.examDate}
              onChange={(e) => handleHeaderChange('examDate', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              مدت زمان پاسخ‌گویی:
            </label>
            <input
              type="text"
              value={header.durationMinutes}
              onChange={(e) => handleHeaderChange('durationMinutes', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نام طراح / معلم:
            </label>
            <input
              type="text"
              value={header.teacherName}
              onChange={(e) => handleHeaderChange('teacherName', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              منطقه / استان / اداره:
            </label>
            <input
              type="text"
              value={header.provinceOrDistrict}
              onChange={(e) => handleHeaderChange('provinceOrDistrict', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              نوبت امتحانی:
            </label>
            <input
              type="text"
              value={header.examTurn}
              onChange={(e) => handleHeaderChange('examTurn', e.target.value)}
              placeholder="مثلاً: آزمون پایانی نوبت دوم"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تعداد ستون‌های جدول مشخصات:
            </label>
            <select
              value={header.headerFieldsPerRow}
              onChange={(e) => handleHeaderChange('headerFieldsPerRow', parseInt(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value={2}>۲ ستونه</option>
              <option value={3}>۳ ستونه (استاندارد)</option>
              <option value={4}>۴ ستونه</option>
            </select>
          </div>
        </div>

        {/* Custom Header Fields */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              فیلدهای سفارشی سربرگ:
            </span>
            <button
              onClick={addCustomField}
              className="text-xs text-blue-600 dark:text-blue-400 font-bold flex items-center gap-1 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" /> افزودن فیلد
            </button>
          </div>

          {header.customFields.map((field) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                value={field.label}
                onChange={(e) => updateCustomField(field.id, 'label', e.target.value)}
                placeholder="عنوان فیلد"
                className="w-1/3 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <input
                type="text"
                value={field.value}
                onChange={(e) => updateCustomField(field.id, 'value', e.target.value)}
                placeholder="مقدار فیلد"
                className="flex-1 p-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              />
              <button
                onClick={() => removeCustomField(field.id)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Page & Print Layout Settings */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
          <h2 className="text-sm font-extrabold flex items-center gap-2 text-slate-900 dark:text-white">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            تنظیمات کاغذ، چیدمان و پاسخ‌نویسی
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          {/* Paper Size */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اندازه کاغذ:
            </label>
            <select
              value={layout.paperSize}
              onChange={(e) => handleLayoutChange('paperSize', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value="A4">A4 (استاندارد امتحانات)</option>
              <option value="A5">A5 (کاغذ کوچک)</option>
              <option value="Letter">Letter</option>
            </select>
          </div>

          {/* Columns */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              تعداد ستون‌های برگه:
            </label>
            <select
              value={layout.columns}
              onChange={(e) => handleLayoutChange('columns', parseInt(e.target.value))}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value={1}>تک ستونه (استاندارد)</option>
              <option value={2}>دو ستونه (فشرده و صرفه‌جویی)</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              اندازه قلم (فونت):
            </label>
            <select
              value={layout.fontSize}
              onChange={(e) => handleLayoutChange('fontSize', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value="small">ریز (فشرده)</option>
              <option value="medium">متوسط (استاندارد)</option>
              <option value="large">درشت (خواندن آسان)</option>
            </select>
          </div>

          {/* Line Spacing */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              فاصله خطوط سوالات:
            </label>
            <select
              value={layout.lineSpacing}
              onChange={(e) => handleLayoutChange('lineSpacing', e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-bold"
            >
              <option value="compact">فشرده</option>
              <option value="normal">معمولی</option>
              <option value="relaxed">باز و بافاصله</option>
            </select>
          </div>
        </div>

        {/* Answer Space Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showAnswerSpace"
              checked={layout.showAnswerSpace}
              onChange={(e) => handleLayoutChange('showAnswerSpace', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="showAnswerSpace" className="font-bold cursor-pointer">
              نمایش محل پاسخ‌نویسی دانش‌آموز
            </label>
          </div>

          {layout.showAnswerSpace && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                نوع کادر پاسخ:
              </label>
              <select
                value={layout.answerSpaceType}
                onChange={(e) => handleLayoutChange('answerSpaceType', e.target.value)}
                className="w-full p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
              >
                <option value="lines">خط‌چین‌های نقطه‌ای</option>
                <option value="box">کادر چهارگوش خالی</option>
                <option value="blank">فضای خالی ساده</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showScores"
              checked={layout.showScores}
              onChange={(e) => handleLayoutChange('showScores', e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="showScores" className="font-bold cursor-pointer">
              نمایش بارم (نمره) جلوی هر سوال
            </label>
          </div>
        </div>

        {/* Watermark & Footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-200 dark:border-slate-700 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              متن واترمارک پس‌زمینه (اختیاری):
            </label>
            <input
              type="text"
              value={layout.watermarkText}
              onChange={(e) => handleLayoutChange('watermarkText', e.target.value)}
              placeholder="مثلاً: پیش‌نویس / غیرقابل تکثیر"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              متن پاورقی (پیام زیر برگه):
            </label>
            <input
              type="text"
              value={layout.footerText}
              onChange={(e) => handleLayoutChange('footerText', e.target.value)}
              placeholder="مثلاً: موفقیت شما آرزوی ماست"
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
