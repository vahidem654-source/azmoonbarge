/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { QuestionsTab } from './components/Tabs/QuestionsTab';
import { HeaderDesignTab } from './components/Tabs/HeaderDesignTab';
import { ExportTab } from './components/Tabs/ExportTab';
import { QuestionBankTab } from './components/Tabs/QuestionBankTab';
import { ToolsTab } from './components/Tabs/ToolsTab';
import { QuestionModal } from './components/Modals/QuestionModal';
import { AiModal } from './components/Modals/AiModal';
import { ExamHeader, Question, LayoutSettings, BankQuestion } from './types';
import { AppStorage } from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('questions');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => AppStorage.getTheme());

  // State
  const [header, setHeader] = useState<ExamHeader>(() => AppStorage.getHeader());
  const [questions, setQuestions] = useState<Question[]>(() => AppStorage.getQuestions());
  const [layout, setLayout] = useState<LayoutSettings>(() => AppStorage.getLayout());
  const [bank, setBank] = useState<BankQuestion[]>(() => AppStorage.getBank());

  const [defaultScore, setDefaultScore] = useState<number>(1);
  const [isSaved, setIsSaved] = useState<boolean>(true);

  // Modals
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState<boolean>(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState<boolean>(false);

  // Theme effect
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    AppStorage.saveTheme(theme);
  }, [theme]);

  // Auto save draft to local storage
  useEffect(() => {
    AppStorage.saveHeader(header);
    AppStorage.saveQuestions(questions);
    AppStorage.saveLayout(layout);
    AppStorage.saveBank(bank);
    setIsSaved(true);
  }, [header, questions, layout, bank]);

  const handleManualSave = () => {
    AppStorage.saveHeader(header);
    AppStorage.saveQuestions(questions);
    AppStorage.saveLayout(layout);
    AppStorage.saveBank(bank);
    setIsSaved(true);
  };

  const handleSaveQuestion = (qToSave: Question) => {
    if (editingQuestion) {
      setQuestions(questions.map((q) => (q.id === qToSave.id ? qToSave : q)));
    } else {
      setQuestions([...questions, qToSave]);
    }
    setEditingQuestion(null);
  };

  const handleAddGeneratedQuestions = (newQuestions: Question[]) => {
    setQuestions([...questions, ...newQuestions]);
  };

  const totalScore = questions.reduce((acc, q) => acc + (q.score || 0), 0);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-100 font-['Vazirmatn',sans-serif] transition-colors duration-200">
      {/* App Top Navigation Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        setTheme={setTheme}
        questionCount={questions.length}
        totalScore={totalScore}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onSaveDraft={handleManualSave}
        isSaved={isSaved}
      />

      {/* Main Tab Content View */}
      <main className="max-w-7xl mx-auto p-4 md:p-6 pb-24">
        {activeTab === 'questions' && (
          <QuestionsTab
            header={header}
            setHeader={setHeader}
            questions={questions}
            setQuestions={setQuestions}
            layout={layout}
            setLayout={setLayout}
            onOpenQuestionModal={(q) => {
              setEditingQuestion(q || null);
              setIsQuestionModalOpen(true);
            }}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            defaultScore={defaultScore}
            setDefaultScore={setDefaultScore}
          />
        )}

        {activeTab === 'header' && (
          <HeaderDesignTab
            header={header}
            setHeader={setHeader}
            layout={layout}
            setLayout={setLayout}
          />
        )}

        {activeTab === 'export' && (
          <ExportTab
            header={header}
            questions={questions}
            layout={layout}
            setLayout={setLayout}
            subjectName={header.subject}
          />
        )}

        {activeTab === 'bank' && (
          <QuestionBankTab
            bank={bank}
            setBank={setBank}
            currentQuestions={questions}
            onAddQuestionToExam={(q) => setQuestions([...questions, { ...q, id: 'q_' + Date.now() }])}
          />
        )}

        {activeTab === 'tools' && (
          <ToolsTab
            header={header}
            setHeader={setHeader}
            questions={questions}
            setQuestions={setQuestions}
            layout={layout}
            setLayout={setLayout}
            onLoadPreset={({ header: h, questions: q }) => {
              setHeader(h);
              setQuestions(q);
            }}
          />
        )}
      </main>

      {/* Add / Edit Question Modal */}
      <QuestionModal
        isOpen={isQuestionModalOpen}
        onClose={() => {
          setIsQuestionModalOpen(false);
          setEditingQuestion(null);
        }}
        onSave={handleSaveQuestion}
        initialQuestion={editingQuestion}
        defaultScore={defaultScore}
        totalExistingQuestions={questions.length}
      />

      {/* AI Question Generator Modal */}
      <AiModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onAddGeneratedQuestions={handleAddGeneratedQuestions}
      />
    </div>
  );
}
