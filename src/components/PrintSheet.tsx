import React from 'react';
import { ExamHeader, Question, LayoutSettings } from '../types';
import { fixRtlParentheses } from '../utils/docxExport';

interface PrintSheetProps {
  header: ExamHeader;
  setHeader?: React.Dispatch<React.SetStateAction<ExamHeader>>;
  questions: Question[];
  setQuestions?: React.Dispatch<React.SetStateAction<Question[]>>;
  layout: LayoutSettings;
  mode: 'student' | 'teacher'; // student = برگه سوال / teacher = پاسخ‌نامه
  isEditable?: boolean; // Enable live inline Word-like editing directly on paper
  onSelectQuestionToEdit?: (q: Question) => void;
  onAddQuestionInline?: () => void;
}

export const PrintSheet: React.FC<PrintSheetProps> = ({
  header,
  setHeader,
  questions,
  setQuestions,
  layout,
  mode = 'student',
  isEditable = false,
  onSelectQuestionToEdit,
  onAddQuestionInline,
}) => {
  const totalScore = questions.reduce((acc, q) => acc + (q.score || 0), 0);

  const getFontSizeClass = () => {
    switch (layout.fontSize) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  const getLineSpacingClass = () => {
    switch (layout.lineSpacing) {
      case 'compact':
        return 'leading-snug';
      case 'relaxed':
        return 'leading-loose';
      default:
        return 'leading-relaxed';
    }
  };

  // Inline header updater
  const updateHeaderField = (field: keyof ExamHeader, value: string) => {
    if (setHeader) {
      setHeader((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Inline question text updater
  const updateQuestionText = (id: string, newText: string) => {
    if (setQuestions) {
      setQuestions(
        questions.map((q) => (q.id === id ? { ...q, text: newText } : q))
      );
    }
  };

  // Inline option text updater
  const updateOptionText = (questionId: string, optIdx: number, newOptText: string) => {
    if (setQuestions) {
      setQuestions(
        questions.map((q) => {
          if (q.id === questionId && q.options) {
            const updatedOpts = [...q.options];
            updatedOpts[optIdx] = newOptText;
            return { ...q, options: updatedOpts };
          }
          return q;
        })
      );
    }
  };

  return (
    <div
      className={`print-sheet bg-white text-slate-900 mx-auto p-6 md:p-8 rounded-lg shadow-xl border border-slate-300 print:shadow-none print:border-none print:p-0 transition-all ${
        layout.paperSize === 'A5' ? 'max-w-[148mm]' : 'max-w-[210mm]'
      }`}
      style={{
        direction: 'rtl',
        fontFamily: layout.fontFamily || 'Vazirmatn',
        unicodeBidi: 'isolate',
      }}
    >
      {/* Watermark if configured */}
      {layout.watermarkText && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-5 select-none text-6xl font-bold text-slate-900 rotate-45 z-0">
          {layout.watermarkText}
        </div>
      )}

      {/* Header Mode Badge */}
      <div className="no-print mb-4 p-2 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-950 text-xs font-bold flex items-center justify-between shadow-xs">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          برگه زنده آزمون ({mode === 'student' ? 'برگه دانش‌آموزی' : 'کلید تصحیح معلم'})
          {isEditable && <span className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded text-[11px] font-extrabold mr-2">محیط ویرایش زنده فعال است</span>}
        </span>
        <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-md text-[11px] font-extrabold">
          بارم کل: &#x200F;({totalScore} نمره)&#x200F;
        </span>
      </div>

      {/* Header Block Attached at top of exam paper */}
      <div className="border-2 border-slate-900 rounded-xl p-3 mb-4 bg-white relative shadow-xs">
        {/* Top Header Row */}
        <div className="grid grid-cols-3 items-center border-b border-slate-300 pb-2 mb-2 text-center text-xs">
          {/* Right Column: District / School */}
          <div className="text-right font-bold text-slate-800">
            {isEditable ? (
              <input
                type="text"
                value={header.provinceOrDistrict}
                onChange={(e) => updateHeaderField('provinceOrDistrict', e.target.value)}
                placeholder="منطقه / اداره"
                className="w-full text-xs font-semibold text-slate-600 bg-amber-50/50 hover:bg-amber-50 focus:bg-white border border-dashed border-slate-300 rounded px-1 outline-none mb-1"
              />
            ) : (
              header.provinceOrDistrict && <div className="text-[11px] text-slate-600">{header.provinceOrDistrict}</div>
            )}

            {isEditable ? (
              <input
                type="text"
                value={header.schoolName}
                onChange={(e) => updateHeaderField('schoolName', e.target.value)}
                placeholder="نام مدرسه"
                className="w-full text-sm font-extrabold text-slate-950 bg-amber-50/50 hover:bg-amber-50 focus:bg-white border border-dashed border-slate-300 rounded px-1 outline-none"
              />
            ) : (
              <div className="text-sm font-extrabold text-slate-950 mt-0.5">{header.schoolName}</div>
            )}
          </div>

          {/* Center Column: Exam Title & Subject */}
          <div className="text-center font-bold">
            {isEditable ? (
              <input
                type="text"
                value={header.subject}
                onChange={(e) => updateHeaderField('subject', e.target.value)}
                placeholder="عنوان درس"
                className="w-full text-center text-base font-black text-slate-900 bg-amber-50/50 hover:bg-amber-50 focus:bg-white border border-dashed border-slate-300 rounded px-1 outline-none mb-1"
              />
            ) : (
              <div className="text-base font-black text-slate-950 mb-1">{header.subject}</div>
            )}

            {isEditable ? (
              <div className="flex gap-1 justify-center">
                <input
                  type="text"
                  value={header.examTurn}
                  onChange={(e) => updateHeaderField('examTurn', e.target.value)}
                  placeholder="نوبت امتحانی"
                  className="text-xs font-bold text-slate-700 bg-amber-50/50 hover:bg-amber-50 focus:bg-white border border-dashed border-slate-300 rounded px-1 outline-none w-28 text-center"
                />
                <input
                  type="text"
                  value={header.gradeAndField}
                  onChange={(e) => updateHeaderField('gradeAndField', e.target.value)}
                  placeholder="پایه و رشته"
                  className="text-xs font-bold text-slate-700 bg-amber-50/50 hover:bg-amber-50 focus:bg-white border border-dashed border-slate-300 rounded px-1 outline-none w-32 text-center"
                />
              </div>
            ) : (
              <div className="text-xs text-slate-800 bg-slate-100 px-2 py-0.5 rounded inline-block font-bold">
                {header.examTurn || 'آزمون کتبی'} - {header.gradeAndField}
              </div>
            )}
          </div>

          {/* Left Column: Date, Duration, Teacher */}
          <div className="text-left font-medium text-slate-800 text-[11px] space-y-1">
            <div className="flex items-center justify-end gap-1">
              <span>تاریخ:</span>
              {isEditable ? (
                <input
                  type="text"
                  value={header.examDate}
                  onChange={(e) => updateHeaderField('examDate', e.target.value)}
                  className="w-20 font-bold bg-amber-50/50 border border-dashed border-slate-300 rounded px-1 text-left outline-none"
                />
              ) : (
                <span className="font-bold">{header.examDate}</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-1">
              <span>مدت:</span>
              {isEditable ? (
                <input
                  type="text"
                  value={header.durationMinutes}
                  onChange={(e) => updateHeaderField('durationMinutes', e.target.value)}
                  className="w-20 font-bold bg-amber-50/50 border border-dashed border-slate-300 rounded px-1 text-left outline-none"
                />
              ) : (
                <span className="font-bold">{header.durationMinutes}</span>
              )}
            </div>

            <div className="flex items-center justify-end gap-1">
              <span>دبیر:</span>
              {isEditable ? (
                <input
                  type="text"
                  value={header.teacherName}
                  onChange={(e) => updateHeaderField('teacherName', e.target.value)}
                  className="w-20 font-bold bg-amber-50/50 border border-dashed border-slate-300 rounded px-1 text-left outline-none"
                />
              ) : (
                <span className="font-bold">{header.teacherName}</span>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Fields Row */}
        <div
          className="grid gap-2 text-xs py-1 text-slate-800 border-b border-slate-300 mb-2"
          style={{
            gridTemplateColumns: `repeat(${header.headerFieldsPerRow || 3}, minmax(0, 1fr))`,
          }}
        >
          {isEditable ? (
            <>
              <input
                type="text"
                value={header.studentNameLabel}
                onChange={(e) => updateHeaderField('studentNameLabel', e.target.value)}
                className="font-semibold bg-amber-50/50 border border-dashed border-slate-300 rounded px-1 outline-none"
              />
              <input
                type="text"
                value={header.seatNumberLabel}
                onChange={(e) => updateHeaderField('seatNumberLabel', e.target.value)}
                className="font-semibold bg-amber-50/50 border border-dashed border-slate-300 rounded px-1 outline-none"
              />
            </>
          ) : (
            <>
              <div className="font-semibold">{header.studentNameLabel}</div>
              <div className="font-semibold">{header.seatNumberLabel}</div>
            </>
          )}

          <div className="font-bold text-indigo-950">
            نمره کل: <span className="font-extrabold">&#x200F;({totalScore} نمره)&#x200F;</span>
          </div>

          {header.customFields
            .filter((f) => f.visible)
            .map((f) => (
              <div key={f.id} className="text-slate-700">
                <span className="font-semibold">{f.label}:</span> {f.value}
              </div>
            ))}
        </div>

        {/* Score Table Block (Standard School Format) */}
        <div className="grid grid-cols-4 border border-slate-900 text-center text-[11px] font-semibold bg-slate-50">
          <div className="border-l border-slate-900 p-1">
            <div className="text-[10px] text-slate-600">نمره به عدد:</div>
            <div className="h-5"></div>
          </div>
          <div className="border-l border-slate-900 p-1">
            <div className="text-[10px] text-slate-600">نمره به حروف:</div>
            <div className="h-5"></div>
          </div>
          <div className="border-l border-slate-900 p-1">
            <div className="text-[10px] text-slate-600">امضاء دبیر:</div>
            <div className="h-5"></div>
          </div>
          <div className="p-1">
            <div className="text-[10px] text-slate-600">نمره تجدیدنظر / نهایی:</div>
            <div className="h-5"></div>
          </div>
        </div>
      </div>

      {/* Questions List Section */}
      <div
        className={`questions-container ${
          layout.columns === 2 ? 'grid grid-cols-2 gap-4' : 'space-y-4'
        } ${getFontSizeClass()} ${getLineSpacingClass()}`}
      >
        {questions.map((q, idx) => {
          const qNum = idx + 1;
          return (
            <div
              key={q.id}
              onClick={() => onSelectQuestionToEdit && onSelectQuestionToEdit(q)}
              className={`question-item break-inside-avoid border-b border-slate-200 pb-3 mb-2 transition rounded p-1 ${
                isEditable ? 'hover:bg-amber-50/40 hover:border-amber-300 cursor-pointer' : ''
              }`}
            >
              {/* Question Row Header & Score */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="font-bold text-slate-900 flex-1 flex items-start gap-1">
                  {layout.showQuestionNumbers && (
                    <span className="inline-block font-extrabold text-indigo-950 shrink-0 select-none">
                      &#x200F;({qNum})&#x200F;
                    </span>
                  )}

                  {isEditable ? (
                    <textarea
                      value={q.text}
                      onChange={(e) => updateQuestionText(q.id, e.target.value)}
                      rows={Math.max(1, Math.ceil(q.text.length / 60))}
                      className="w-full text-sm font-bold text-slate-900 bg-amber-50/50 hover:bg-amber-50 focus:bg-white border border-dashed border-slate-300 rounded p-1 outline-none resize-y"
                    />
                  ) : (
                    <span className="leading-relaxed" dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                      {q.text}
                    </span>
                  )}
                </div>

                {layout.showScores && (
                  <div className="shrink-0 text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 px-2 py-0.5 rounded select-none">
                    &#x200F;({q.score} نمره)&#x200F;
                  </div>
                )}
              </div>

              {/* Question Specific Content */}
              {/* Image */}
              {q.image && (
                <div className="my-2 max-w-xs mx-auto text-center">
                  <img
                    src={q.image}
                    alt="تصویر سوال"
                    className="max-h-40 rounded border border-slate-300 mx-auto"
                  />
                </div>
              )}

              {/* Multiple Choice Options */}
              {q.type === 'multiple_choice' && q.options && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 my-2 mr-4 text-xs">
                  {q.options.map((opt, oIdx) => (
                    <div
                      key={oIdx}
                      className={`flex items-center gap-1.5 p-1 rounded ${
                        mode === 'teacher' && q.correctOption === oIdx
                          ? 'bg-emerald-100 border border-emerald-400 font-bold text-emerald-900'
                          : ''
                      }`}
                    >
                      <span className="w-5 h-5 rounded-full border border-slate-500 inline-flex items-center justify-center text-[10px] font-extrabold text-slate-900 shrink-0">
                        &#x200F;({['۱', '۲', '۳', '۴'][oIdx]})&#x200F;
                      </span>
                      {isEditable ? (
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => updateOptionText(q.id, oIdx, e.target.value)}
                          className="w-full bg-amber-50/50 border border-dashed border-slate-300 rounded px-1 text-xs outline-none"
                        />
                      ) : (
                        <span dir="rtl" style={{ unicodeBidi: 'isolate' }}>
                          {opt}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* True / False Options */}
              {q.type === 'true_false' && (
                <div className="flex gap-6 my-2 mr-4 text-xs font-bold">
                  <span
                    className={`inline-flex items-center gap-1 ${
                      mode === 'teacher' && q.trueFalseAnswer ? 'text-emerald-700 font-black' : ''
                    }`}
                  >
                    <span className="w-3.5 h-3.5 border border-slate-600 rounded inline-block"></span>
                    &#x200F;(الف)&#x200F; درست {mode === 'teacher' && q.trueFalseAnswer && '✓'}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 ${
                      mode === 'teacher' && !q.trueFalseAnswer ? 'text-emerald-700 font-black' : ''
                    }`}
                  >
                    <span className="w-3.5 h-3.5 border border-slate-600 rounded inline-block"></span>
                    &#x200F;(ب)&#x200F; نادرست {mode === 'teacher' && !q.trueFalseAnswer && '✓'}
                  </span>
                </div>
              )}

              {/* Parenthetical Choice */}
              {q.type === 'parenthetical' && q.parenChoices && (
                <div className="text-xs text-slate-800 mr-4 my-1 font-semibold">
                  گزینه‌ها: &#x200F;({q.parenChoices.join(' / ')})&#x200F;
                  {mode === 'teacher' && (
                    <span className="mr-2 text-emerald-800 font-bold">
                      [پاسخ صحیح: {q.parenCorrectChoice || q.answerText}]
                    </span>
                  )}
                </div>
              )}

              {/* Matching Pairs */}
              {q.type === 'matching' && q.matchingPairs && (
                <div className="my-2 mr-2">
                  <table className="w-full text-xs border border-slate-400 rounded">
                    <thead>
                      <tr className="bg-slate-100 font-bold border-b border-slate-400">
                        <th className="p-1 text-right border-l border-slate-400">ستون الف</th>
                        <th className="p-1 text-right">ستون ب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {q.matchingPairs.map((pair, pIdx) => (
                        <tr key={pair.id || pIdx} className="border-b border-slate-300">
                          <td className="p-1 border-l border-slate-400 font-medium">
                            {pIdx + 1}) {pair.left}
                          </td>
                          <td className="p-1 font-medium">
                            {String.fromCharCode(65 + pIdx)}) {pair.right}
                            {mode === 'teacher' && (
                              <span className="mr-2 text-emerald-700 font-bold">
                                (پاسخ: {pIdx + 1} → {String.fromCharCode(65 + pIdx)})
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Answer Space / Lines for Student mode */}
              {mode === 'student' && layout.showAnswerSpace && (
                <div className="my-2">
                  {layout.answerSpaceType === 'lines' && (
                    <div className="space-y-3 my-2">
                      {Array.from({
                        length: q.answerSpaceLines || (q.type === 'essay' ? 3 : 1),
                      }).map((_, lIdx) => (
                        <div
                          key={lIdx}
                          className="border-b border-dotted border-slate-400 h-4"
                        ></div>
                      ))}
                    </div>
                  )}

                  {layout.answerSpaceType === 'box' && (
                    <div
                      className="border border-slate-400 rounded p-2 bg-slate-50/50"
                      style={{
                        height: `${(q.answerSpaceLines || (q.type === 'essay' ? 3 : 1)) * 22}px`,
                      }}
                    ></div>
                  )}
                </div>
              )}

              {/* Teacher Answer Key Block */}
              {mode === 'teacher' && (q.answerText || q.keywords) && (
                <div className="mt-2 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-950">
                  <div className="font-bold text-emerald-900 mb-0.5 flex items-center justify-between">
                    <span>پاسخ تشریحی و کلید تصحیح:</span>
                    {q.keywords && q.keywords.length > 0 && (
                      <span className="text-[10px] bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded font-bold">
                        کلیدواژه‌ها: {q.keywords.join(' ، ')}
                      </span>
                    )}
                  </div>
                  <div className="whitespace-pre-line leading-relaxed font-medium">
                    {q.answerText || 'پاسخ ثبت نشده است.'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Inline Add Question Button */}
      {isEditable && onAddQuestionInline && (
        <div className="no-print mt-4 text-center">
          <button
            onClick={onAddQuestionInline}
            className="w-full py-2.5 border-2 border-dashed border-indigo-400 text-indigo-700 bg-indigo-50/60 hover:bg-indigo-100 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
          >
            <span>+ افزودن سوال جدید مستقیم به این برگه</span>
          </button>
        </div>
      )}

      {/* Footer */}
      {layout.footerText && (
        <div className="mt-6 pt-3 border-t border-slate-300 text-center text-xs text-slate-600 font-medium select-none">
          {layout.footerText}
        </div>
      )}
    </div>
  );
};
