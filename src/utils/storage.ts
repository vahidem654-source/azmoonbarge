import { ExamHeader, LayoutSettings, Question, BankQuestion, ExamProject } from '../types';
import { DEFAULT_HEADER, DEFAULT_LAYOUT, SAMPLE_QUESTIONS, INITIAL_BANK_QUESTIONS } from '../data/presets';

const KEYS = {
  HEADER: 'barge_exam_header_v1',
  QUESTIONS: 'barge_exam_questions_v1',
  LAYOUT: 'barge_exam_layout_v1',
  BANK: 'barge_question_bank_v1',
  PROJECTS: 'barge_exam_projects_v1',
  THEME: 'barge_theme_v1',
};

export const AppStorage = {
  getHeader(): ExamHeader {
    try {
      const data = localStorage.getItem(KEYS.HEADER);
      return data ? JSON.parse(data) : DEFAULT_HEADER;
    } catch {
      return DEFAULT_HEADER;
    }
  },

  saveHeader(header: ExamHeader) {
    try {
      localStorage.setItem(KEYS.HEADER, JSON.stringify(header));
    } catch (e) {
      console.error('Failed to save header', e);
    }
  },

  getQuestions(): Question[] {
    try {
      const data = localStorage.getItem(KEYS.QUESTIONS);
      return data ? JSON.parse(data) : SAMPLE_QUESTIONS;
    } catch {
      return SAMPLE_QUESTIONS;
    }
  },

  saveQuestions(questions: Question[]) {
    try {
      localStorage.setItem(KEYS.QUESTIONS, JSON.stringify(questions));
    } catch (e) {
      console.error('Failed to save questions', e);
    }
  },

  getLayout(): LayoutSettings {
    try {
      const data = localStorage.getItem(KEYS.LAYOUT);
      return data ? JSON.parse(data) : DEFAULT_LAYOUT;
    } catch {
      return DEFAULT_LAYOUT;
    }
  },

  saveLayout(layout: LayoutSettings) {
    try {
      localStorage.setItem(KEYS.LAYOUT, JSON.stringify(layout));
    } catch (e) {
      console.error('Failed to save layout', e);
    }
  },

  getBank(): BankQuestion[] {
    try {
      const data = localStorage.getItem(KEYS.BANK);
      return data ? JSON.parse(data) : INITIAL_BANK_QUESTIONS;
    } catch {
      return INITIAL_BANK_QUESTIONS;
    }
  },

  saveBank(bank: BankQuestion[]) {
    try {
      localStorage.setItem(KEYS.BANK, JSON.stringify(bank));
    } catch (e) {
      console.error('Failed to save bank', e);
    }
  },

  getProjects(): ExamProject[] {
    try {
      const data = localStorage.getItem(KEYS.PROJECTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveProjects(projects: ExamProject[]) {
    try {
      localStorage.setItem(KEYS.PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.error('Failed to save projects', e);
    }
  },

  getTheme(): 'light' | 'dark' {
    return (localStorage.getItem(KEYS.THEME) as 'light' | 'dark') || 'light';
  },

  saveTheme(theme: 'light' | 'dark') {
    localStorage.setItem(KEYS.THEME, theme);
  },
};
