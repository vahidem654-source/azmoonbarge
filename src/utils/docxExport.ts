/**
 * Utility for exporting exams to Microsoft Word (.doc / .docx)
 * Generates an MHTML/HTML Word document with native Word XML tags,
 * proper RTL support, correct Persian parentheses formatting,
 * and complete attached header with score tables.
 */

import { saveAs } from 'file-saver';
import { ExamHeader, Question, LayoutSettings } from '../types';

/**
 * Format string with Right-to-Left Mark (\u200F) so parentheses do not reverse
 */
export function fixRtlParentheses(text: string): string {
  if (!text) return '';
  // Replace standard parentheses containing Persian/Numbers with RTL isolated markers
  return text.replace(/\(([^()]+)\)/g, '&#x200F;($1)&#x200F;');
}

export function exportToWordDocx(
  header: ExamHeader,
  questions: Question[],
  layout: LayoutSettings,
  mode: 'student' | 'teacher' = 'student',
  fileName?: string
) {
  const totalScore = questions.reduce((acc, q) => acc + (q.score || 0), 0);
  const title = fileName || `${header.subject || 'آزمون'}_${header.schoolName || 'برگه_امتحانی'}.doc`;

  const customFieldsHtml = header.customFields
    .filter((f) => f.visible)
    .map((f) => `<td style="padding: 4px 8px;"><b style="color: #1e293b;">${f.label}:</b> ${f.value}</td>`)
    .join('');

  const questionsHtml = questions
    .map((q, idx) => {
      const qNum = idx + 1;
      let optionsHtml = '';

      if (q.type === 'multiple_choice' && q.options) {
        const optionRows = q.options
          .map((opt, oIdx) => {
            const letter = ['۱', '۲', '۳', '۴'][oIdx] || `${oIdx + 1}`;
            const isCorrect = mode === 'teacher' && q.correctOption === oIdx;
            const style = isCorrect
              ? 'background-color: #d1fae5; font-weight: bold; color: #065f46; border: 1px solid #10b981; border-radius: 4px; padding: 2px 6px;'
              : 'padding: 2px 6px;';

            return `<td style="width: 25%; vertical-align: top; ${style}">
              <span style="font-weight: bold; color: #1e1b4b;">&#x200F;(${letter})&#x200F;</span> ${fixRtlParentheses(opt)}
            </td>`;
          })
          .join('');

        optionsHtml = `<table dir="rtl" style="width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 8px;">
          <tr>${optionRows}</tr>
        </table>`;
      } else if (q.type === 'true_false') {
        const tfAns = q.trueFalseAnswer;
        optionsHtml = `<div style="margin-top: 4px; margin-bottom: 6px; font-weight: bold;">
          <span style="margin-left: 20px; ${mode === 'teacher' && tfAns ? 'color: #047857;' : ''}">الف) درست ${mode === 'teacher' && tfAns ? '✓ (پاسخ صحيح)' : ''}</span>
          <span style="${mode === 'teacher' && !tfAns ? 'color: #047857;' : ''}">ب) نادرست ${mode === 'teacher' && !tfAns ? '✓ (پاسخ صحيح)' : ''}</span>
        </div>`;
      } else if (q.type === 'parenthetical' && q.parenChoices) {
        optionsHtml = `<div style="margin-top: 4px; margin-bottom: 6px; color: #334155;">
          گزینه‌ها: &#x200F;(${q.parenChoices.join(' / ')})&#x200F;
          ${mode === 'teacher' ? `<b style="color: #047857; margin-right: 12px;">[پاسخ صحیح: ${q.parenCorrectChoice || q.answerText || ''}]</b>` : ''}
        </div>`;
      } else if (q.type === 'matching' && q.matchingPairs) {
        const pairsRows = q.matchingPairs
          .map(
            (pair, pIdx) => `<tr>
            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 50%;">${pIdx + 1}) ${pair.left}</td>
            <td style="border: 1px solid #cbd5e1; padding: 4px 8px; width: 50%;">
              ${String.fromCharCode(65 + pIdx)}) ${pair.right}
              ${mode === 'teacher' ? `<b style="color: #047857; margin-right: 8px;">(پاسخ: ${pIdx + 1} &rarr; ${String.fromCharCode(65 + pIdx)})</b>` : ''}
            </td>
          </tr>`
          )
          .join('');

        optionsHtml = `<table dir="rtl" style="width: 100%; border-collapse: collapse; border: 1px solid #cbd5e1; margin-top: 6px; font-size: 11pt;">
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <th style="border: 1px solid #cbd5e1; padding: 4px; text-align: right;">ستون الف</th>
            <th style="border: 1px solid #cbd5e1; padding: 4px; text-align: right;">ستون ب</th>
          </tr>
          ${pairsRows}
        </table>`;
      }

      // Answer Lines or Boxes for Students
      let answerSpaceHtml = '';
      if (mode === 'student' && layout.showAnswerSpace) {
        const lineCount = q.answerSpaceLines || (q.type === 'essay' ? 3 : 1);
        if (layout.answerSpaceType === 'lines') {
          answerSpaceHtml = Array.from({ length: lineCount })
            .map(() => `<div style="border-bottom: 1px dotted #94a3b8; height: 18px; margin-bottom: 6px;"></div>`)
            .join('');
        } else if (layout.answerSpaceType === 'box') {
          answerSpaceHtml = `<div style="border: 1px solid #cbd5e1; background-color: #f8fafc; height: ${lineCount * 22}px; border-radius: 4px; margin-top: 6px; margin-bottom: 8px;"></div>`;
        }
      }

      // Teacher Answer Key
      let teacherAnswerHtml = '';
      if (mode === 'teacher' && (q.answerText || q.keywords)) {
        teacherAnswerHtml = `<div style="margin-top: 6px; padding: 6px 10px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 4px; font-size: 10.5pt; color: #064e3b;">
          <b style="color: #047857;">پاسخ تشریحی و کلید تصحیح:</b> ${q.answerText || ''}
          ${q.keywords && q.keywords.length > 0 ? `<br/><small style="color: #065f46;"><b>کلیدواژه‌ها:</b> ${q.keywords.join(' ، ')}</small>` : ''}
        </div>`;
      }

      // Question Image
      let imageHtml = '';
      if (q.image) {
        imageHtml = `<div style="text-align: center; margin: 8px 0;"><img src="${q.image}" style="max-height: 180px; border: 1px solid #ccc;" /></div>`;
      }

      return `<div style="margin-bottom: 14px; page-break-inside: avoid; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
        <table dir="rtl" style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="text-align: right; vertical-align: top; font-weight: bold; font-size: 12pt; color: #0f172a;">
              ${layout.showQuestionNumbers ? `<span style="color: #1e1b4b; font-weight: 800; margin-left: 4px;">&#x200F;(${qNum})&#x200F;</span>` : ''}
              ${fixRtlParentheses(q.text)}
            </td>
            ${
              layout.showScores
                ? `<td style="text-align: left; vertical-align: top; width: 80px; font-weight: bold; font-size: 10.5pt; color: #334155;">
                  &#x200F;(${q.score} نمره)&#x200F;
                </td>`
                : ''
            }
          </tr>
        </table>
        ${imageHtml}
        ${optionsHtml}
        ${answerSpaceHtml}
        ${teacherAnswerHtml}
      </div>`;
    })
    .join('');

  // Complete MS Word HTML Document String
  const docHtml = `
  <html xmlns:o="urn:schemas-microsoft-microsoft-com:office:office"
        xmlns:w="urn:schemas-microsoft-microsoft-com:office:word"
        xmlns="http://www.w3.org/TR/REC-html40">
  <head>
    <meta charset="utf-8">
    <title>${header.subject || 'برگه آزمون'}</title>
    <!--[if gte mso 9]>
    <xml>
      <w:WordDocument>
        <w:View>Print</w:View>
        <w:Zoom>100</w:Zoom>
        <w:DoNotOptimizeForBrowser/>
      </w:WordDocument>
    </xml>
    <![endif]-->
    <style>
      @page {
        size: A4 ${layout.orientation || 'portrait'};
        margin: 1.5cm 1.5cm 1.5cm 1.5cm;
      }
      body {
        direction: rtl;
        unicode-bidi: embed;
        font-family: 'Vazirmatn', 'B Yekan', 'Shabnam', 'Sahel', 'Tahoma', 'Arial', sans-serif;
        font-size: ${layout.fontSize === 'small' ? '10.5pt' : layout.fontSize === 'large' ? '13pt' : '11.5pt'};
        line-height: ${layout.lineSpacing === 'compact' ? '1.3' : layout.lineSpacing === 'relaxed' ? '1.8' : '1.5'};
        color: #0f172a;
        background-color: #ffffff;
      }
      table {
        direction: rtl;
        border-collapse: collapse;
      }
      .header-table {
        width: 100%;
        border: 2px solid #0f172a;
        border-radius: 6px;
        margin-bottom: 16px;
        background-color: #ffffff;
      }
      .score-table {
        width: 100%;
        border-collapse: collapse;
        border-top: 1px solid #0f172a;
        background-color: #f8fafc;
        text-align: center;
        font-size: 9.5pt;
      }
      .score-table td {
        border-left: 1px solid #0f172a;
        padding: 4px;
        vertical-align: top;
      }
      .score-table td:last-child {
        border-left: none;
      }
      .footer-text {
        margin-top: 24px;
        padding-top: 8px;
        border-top: 1px solid #cbd5e1;
        text-align: center;
        font-size: 9.5pt;
        color: #64748b;
      }
    </style>
  </head>
  <body dir="rtl">
    <!-- Attached Header Block -->
    <table class="header-table" dir="rtl">
      <!-- Top Info Row -->
      <tr style="border-bottom: 1px solid #cbd5e1;">
        <td style="width: 30%; padding: 8px; text-align: right; vertical-align: middle;">
          ${header.provinceOrDistrict ? `<div style="font-size: 9.5pt; color: #475569;">${header.provinceOrDistrict}</div>` : ''}
          <div style="font-size: 12pt; font-weight: bold; color: #020617; margin-top: 2px;">${header.schoolName}</div>
        </td>
        <td style="width: 40%; padding: 8px; text-align: center; vertical-align: middle;">
          <div style="font-size: 14pt; font-weight: 900; color: #0f172a;">${header.subject}</div>
          <div style="font-size: 10pt; font-weight: bold; color: #334155; margin-top: 4px; background-color: #f1f5f9; display: inline-block; padding: 2px 8px; border-radius: 4px;">
            ${header.examTurn || 'آزمون کتبی'} - ${header.gradeAndField}
          </div>
        </td>
        <td style="width: 30%; padding: 8px; text-align: left; vertical-align: middle; font-size: 10pt;">
          <div>تاریخ آزمون: <b>${header.examDate}</b></div>
          <div>مدت پاسخ‌گویی: <b>${header.durationMinutes}</b></div>
          <div>نام دبیر: <b>${header.teacherName}</b></div>
        </td>
      </tr>

      <!-- Student Credentials Row -->
      <tr style="border-bottom: 1px solid #0f172a; background-color: #ffffff; font-size: 10pt;">
        <td style="padding: 6px 8px;"><b>${header.studentNameLabel}</b></td>
        <td style="padding: 6px 8px; text-align: center;"><b>${header.seatNumberLabel}</b></td>
        <td style="padding: 6px 8px; text-align: left;">بارم کل: <b>&#x200F;(${totalScore} نمره)&#x200F;</b></td>
      </tr>

      ${
        customFieldsHtml
          ? `<tr><td colspan="3"><table dir="rtl" style="width: 100%; font-size: 9.5pt;"><tr>${customFieldsHtml}</tr></table></td></tr>`
          : ''
      }

      <!-- Score Table Row (Standard Iranian School Exam Header) -->
      <tr>
        <td colspan="3" style="padding: 0;">
          <table class="score-table" dir="rtl">
            <tr>
              <td style="width: 25%;">
                <div style="color: #475569; font-weight: bold;">نمره به عدد:</div>
                <div style="height: 22px;"></div>
              </td>
              <td style="width: 25%;">
                <div style="color: #475569; font-weight: bold;">نمره به حروف:</div>
                <div style="height: 22px;"></div>
              </td>
              <td style="width: 25%;">
                <div style="color: #475569; font-weight: bold;">امضاء و نام دبیر:</div>
                <div style="height: 22px;"></div>
              </td>
              <td style="width: 25%;">
                <div style="color: #475569; font-weight: bold;">نمره تجدیدنظر / نهایی:</div>
                <div style="height: 22px;"></div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Questions Section -->
    <div style="width: 100%;">
      ${questionsHtml}
    </div>

    <!-- Footer -->
    ${layout.footerText ? `<div class="footer-text">${layout.footerText}</div>` : ''}
  </body>
  </html>
  `;

  // Create Blob and save file directly
  const blob = new Blob(['\ufeff' + docHtml], {
    type: 'application/msword;charset=utf-8',
  });

  saveAs(blob, title);
}
