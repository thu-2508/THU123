import React, { useState, useEffect } from 'react';
import { Question, StudentProfile, AnswerRecord, MistakeRecord } from './types';
import { QUESTIONS_BANK } from './data/questions';
import { StartScreen } from './components/StartScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import { PracticeMistakes } from './components/PracticeMistakes';
import { sound } from './utils/audio';
import { generateSingleFileHtml } from './exportSingleFileHtml';

const STORAGE_KEY = 'leisure_quest_unit1_state';

export default function App() {
  const [view, setView] = useState<'start' | 'playing' | 'results' | 'practice'>('start');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    studentClass: '',
    school: '',
  });

  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean>(false);

  // Load saved state on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.profile) setProfile(parsed.profile);
        if (parsed.soundEnabled !== undefined) {
          setSoundEnabled(parsed.soundEnabled);
          sound.setEnabled(parsed.soundEnabled);
        }
        if (parsed.gameQuestions && parsed.gameQuestions.length > 0) {
          // Re-hydrate questions from QUESTIONS_BANK so updated prompts apply
          const refreshed = parsed.gameQuestions.map((q: Question) => {
            const fresh = QUESTIONS_BANK.find((b) => b.id === q.id);
            return fresh ? { ...fresh } : q;
          });
          parsed.gameQuestions = refreshed;
          if (parsed.mistakes) {
            parsed.mistakes = parsed.mistakes.map((m: MistakeRecord) => {
              const fresh = QUESTIONS_BANK.find((b) => b.id === m.question.id);
              return fresh ? { ...m, question: { ...fresh } } : m;
            });
          }
          localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
          if (parsed.view === 'playing') {
            setHasSavedProgress(true);
          }
        }
      }
    } catch {
      // ignore
    }
  }, []);

  // Save changes to localStorage
  const persistState = (extraState?: Partial<{
    profile: StudentProfile;
    view: string;
    gameQuestions: Question[];
    currentIndex: number;
    score: number;
    hintsLeft: number;
    answers: AnswerRecord[];
    mistakes: MistakeRecord[];
  }>) => {
    try {
      const stateToSave = {
        profile,
        soundEnabled,
        view,
        gameQuestions,
        currentIndex,
        score,
        hintsLeft,
        answers,
        mistakes,
        ...extraState,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch {
      // ignore
    }
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.setEnabled(next);
    persistState({ profile });
  };

  // Select 25 questions: 10 Nhận biết, 10 Thông hiểu, 5 Vận dụng
  const pickRandom25 = (): Question[] => {
    const n1 = QUESTIONS_BANK.filter((q) => q.level === 'Nhận biết')
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
    const n2 = QUESTIONS_BANK.filter((q) => q.level === 'Thông hiểu')
      .sort(() => 0.5 - Math.random())
      .slice(0, 10);
    const n3 = QUESTIONS_BANK.filter((q) => q.level === 'Vận dụng')
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    // Shuffle all 25 questions
    return [...n1, ...n2, ...n3].sort(() => 0.5 - Math.random());
  };

  // Start new 25-question session
  const handleStartGame = () => {
    const selected = pickRandom25();
    setGameQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setHintsLeft(3);
    setAnswers([]);
    setMistakes([]);
    setStartTime(Date.now());
    setView('playing');
    setHasSavedProgress(false);

    persistState({
      profile,
      view: 'playing',
      gameQuestions: selected,
      currentIndex: 0,
      score: 0,
      hintsLeft: 3,
      answers: [],
      mistakes: [],
    });
  };

  // Resume saved session
  const handleResumeGame = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.gameQuestions && parsed.gameQuestions.length > 0) {
          const freshQuestions = parsed.gameQuestions.map((q: Question) => {
            const match = QUESTIONS_BANK.find((b) => b.id === q.id);
            return match ? { ...match } : q;
          });
          const freshMistakes = (parsed.mistakes || []).map((m: MistakeRecord) => {
            const match = QUESTIONS_BANK.find((b) => b.id === m.question.id);
            return match ? { ...m, question: { ...match } } : m;
          });
          setGameQuestions(freshQuestions);
          setCurrentIndex(parsed.currentIndex || 0);
          setScore(parsed.score || 0);
          setHintsLeft(parsed.hintsLeft ?? 3);
          setAnswers(parsed.answers || []);
          setMistakes(freshMistakes);
          setStartTime(Date.now());
          setView('playing');
        }
      }
    } catch {
      handleStartGame();
    }
  };

  // Reset data completely
  const handleResetData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setProfile({ name: '', studentClass: '', school: '' });
    setGameQuestions([]);
    setCurrentIndex(0);
    setScore(0);
    setHintsLeft(3);
    setAnswers([]);
    setMistakes([]);
    setHasSavedProgress(false);
    setView('start');
  };

  const handleUseHint = () => {
    if (hintsLeft > 0) {
      setHintsLeft((prev) => prev - 1);
    }
  };

  const handleAnswerSubmitted = (isCorrect: boolean, userAnswer: string) => {
    const currentQ = gameQuestions[currentIndex];
    if (!currentQ) return;

    if (isCorrect) {
      setScore((prev) => prev + 10);
    } else {
      setMistakes((prev) => [
        ...prev,
        {
          question: currentQ,
          userAnswer,
          practiceSolved: false,
        },
      ]);
    }

    const newRecord: AnswerRecord = {
      questionId: currentQ.id,
      isCorrect,
      userAnswer,
      timeSpentSeconds: 50,
      usedHint: false,
    };

    setAnswers((prev) => [...prev, newRecord]);
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentIndex < gameQuestions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      persistState({ currentIndex: nextIdx });
    } else {
      // Finished all questions!
      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      setTotalTimeSeconds(totalElapsed);
      setView('results');
      sound.playFanfare();
      persistState({ view: 'results' });
    }
  };

  const handleDownloadSingleHtml = () => {
    sound.playClick();
    const htmlContent = generateSingleFileHtml();
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leisure-quest-unit-1.html';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {view === 'start' && (
        <StartScreen
          profile={profile}
          onUpdateProfile={(p) => {
            setProfile(p);
            persistState({ profile: p });
          }}
          onStartGame={handleStartGame}
          hasSavedProgress={hasSavedProgress}
          onResumeGame={handleResumeGame}
          onResetData={handleResetData}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'playing' && gameQuestions[currentIndex] && (
        <QuestionCard
          question={gameQuestions[currentIndex]}
          currentIndex={currentIndex}
          totalQuestions={gameQuestions.length}
          currentScore={score}
          remainingHints={hintsLeft}
          onUseHint={handleUseHint}
          onAnswerSubmitted={handleAnswerSubmitted}
          onNextQuestion={handleNextQuestion}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {view === 'results' && (
        <ResultScreen
          profile={profile}
          answers={answers}
          mistakes={mistakes}
          totalScore={score}
          maxScore={gameQuestions.length * 10}
          totalTimeSeconds={totalTimeSeconds}
          hintsUsed={3 - hintsLeft}
          onPlayAgain={handleStartGame}
          onOpenPractice={() => {
            sound.playClick();
            setView('practice');
          }}
          onDownloadSingleHtml={handleDownloadSingleHtml}
        />
      )}

      {view === 'practice' && (
        <PracticeMistakes
          mistakes={mistakes}
          onBackToResults={() => {
            sound.playClick();
            setView('results');
          }}
        />
      )}

      {/* Footer Branding Bar */}
      <footer className="w-full py-4 text-center border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto px-4">
          <span>LEISURE QUEST – UNIT 1 ADVENTURE</span>
          <span>•</span>
          <span>TIẾNG ANH 8 – GLOBAL SUCCESS</span>
          <span>•</span>
          <span>GIÁO VIÊN BIÊN SOẠN: <strong className="text-slate-300 font-semibold">VŨ THỊ MAI THU</strong></span>
        </div>
      </footer>
    </main>
  );
}
