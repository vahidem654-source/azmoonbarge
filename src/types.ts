export type QuestionType = 
  | 'essay'       // تشریحی
  | 'multiple_choice' // چندگزینه‌ای (تست)
  | 'blank'       // جای خالی
  | 'parenthetical' // پرانتزی (انتخاب کلمه)
  | 'true_false'   // صحیح / غلط
  | 'short_answer' // کوتاه پاسخ
  | 'matching';    // وصل کردنی

export interface Option {
  id: string;
  text: string;
}

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  score: number;
  order: number;
  category?: string; // فصل یا مبحث
  image?: string; // تصویر همراه سوال (دیتا URL یا لینک)
  
  // Specific properties based on type
  options?: string[]; // برای چند گزینه‌ای
  correctOption?: number; // صفر-ایندمس برای چندگزینه‌ای (0..3)
  
  answerText?: string; // پاسخ صحیح برای تشریحی، جای خالی، کوتاه پاسخ
  keywords?: string[]; // کلیدواژه‌های تصحیح تشریحی
  
  trueFalseAnswer?: boolean; // برای صحیح/غلط
  
  parenChoices?: string[]; // گزینه‌های داخل پرانتز e.g. ["سریع", "آرام"]
  parenCorrectChoice?: string;
  
  matchingPairs?: MatchingPair[]; // برای سوالات وصل کردنی
  
  answerSpaceLines?: number; // تعداد خطوط پاسخ‌برگ برای سوال تشریحی
}

export interface HeaderField {
  id: string;
  label: string;
  value: string;
  visible: boolean;
}

export interface ExamHeader {
  schoolName: string;
  subject: string;
  gradeAndField: string;
  examDate: string;
  durationMinutes: string;
  teacherName: string;
  provinceOrDistrict: string;
  examTurn: string; // نوبت اول / نوبت دوم / مستمر
  studentNameLabel: string; // نام و نام خانوادگی دانش‌آموز
  seatNumberLabel: string; // شماره صندلی/کلاس
  logoUrl?: string;
  customFields: HeaderField[];
  headerFieldsPerRow: number; // 2 or 3 or 4
}

export interface LayoutSettings {
  paperSize: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
  columns: 1 | 2;
  fontFamily: 'Vazirmatn' | 'Sahel' | 'Shabnam' | 'B Yekan' | 'Tahoma';
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  showAnswerSpace: boolean; // نمایش کادر/خطوط پاسخ
  answerSpaceType: 'lines' | 'box' | 'blank';
  showScores: boolean; // نمایش بارم
  showQuestionNumbers: boolean;
  watermarkText: string;
  footerText: string;
  theme: 'light' | 'dark';
}

export interface ExamProject {
  id: string;
  title: string;
  updatedAt: string;
  header: ExamHeader;
  questions: Question[];
  layout: LayoutSettings;
}

export interface BankQuestion extends Question {
  subject: string;
  grade: string;
  tags: string[];
  createdAt: string;
}
