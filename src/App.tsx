import React, { useState, useEffect, useRef } from 'react';
import { Question, StudentProfile, AnswerRecord, MistakeRecord, PartId } from './types';
import { QUESTIONS_BANK, PART_CONFIGS, getQuestionsForPart } from './data/questions';
import { StartScreen } from './components/StartScreen';
import { QuestionCard } from './components/QuestionCard';
import { ResultScreen } from './components/ResultScreen';
import { PracticeMistakes } from './components/PracticeMistakes';
import { sound } from './utils/audio';
import { generateSingleFileHtml } from './exportSingleFileHtml';

const STORAGE_KEY = 'leisure_quest_unit1_state';

interface CompletedPartInfo {
  score: number;
  maxScore: number;
  date: string;
}

export default function App() {
  const [view, setView] = useState<'start' | 'playing' | 'results' | 'practice'>('start');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const [profile, setProfile] = useState<StudentProfile>({
    name: '',
    studentClass: '',
    school: '',
  });

  const [activePart, setActivePart] = useState<PartId>('part1');
  const [gameQuestions, setGameQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [hintsLeft, setHintsLeft] = useState<number>(3);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [startTime, setStartTime] = useState<number>(0);
  const [totalTimeSeconds, setTotalTimeSeconds] = useState<number>(0);
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean>(false);
  const [sectionTimeLeft, setSectionTimeLeft] = useState<number>(600);
  const [completedPartScores, setCompletedPartScores] = useState<Record<string, CompletedPartInfo>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);

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
        if (parsed.activePart) setActivePart(parsed.activePart);
        if (parsed.completedPartScores) setCompletedPartScores(parsed.completedPartScores);
        if (parsed.mistakes) {
          const freshMistakes = parsed.mistakes.map((m: MistakeRecord) => {
            const fresh = QUESTIONS_BANK.find((b) => b.id === m.question.id);
            return fresh ? { ...m, question: { ...fresh } } : m;
          });
          setMistakes(freshMistakes);
        }

        if (parsed.gameQuestions && parsed.gameQuestions.length > 0) {
          const refreshed = parsed.gameQuestions.map((q: Question) => {
            const fresh = QUESTIONS_BANK.find((b) => b.id === q.id);
            return fresh ? { ...fresh } : q;
          });
          parsed.gameQuestions = refreshed;
          setGameQuestions(refreshed);
          setCurrentIndex(parsed.currentIndex || 0);
          setScore(parsed.score || 0);
          setHintsLeft(parsed.hintsLeft ?? 3);
          setAnswers(parsed.answers || []);
          if (parsed.sectionTimeLeft !== undefined) {
            setSectionTimeLeft(parsed.sectionTimeLeft);
          }

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
    activePart: PartId;
    gameQuestions: Question[];
    currentIndex: number;
    score: number;
    hintsLeft: number;
    answers: AnswerRecord[];
    mistakes: MistakeRecord[];
    sectionTimeLeft: number;
    completedPartScores: Record<string, CompletedPartInfo>;
  }>) => {
    try {
      const stateToSave = {
        profile,
        soundEnabled,
        view,
        activePart,
        gameQuestions,
        currentIndex,
        score,
        hintsLeft,
        answers,
        mistakes,
        sectionTimeLeft,
        completedPartScores,
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

  // Countdown timer for active section
  useEffect(() => {
    if (view !== 'playing') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setSectionTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          handleSectionTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [view]);

  // When time runs out for the whole section
  const handleSectionTimeOut = () => {
    sound.playIncorrect();
    const totalElapsed = Math.round((Date.now() - startTime) / 1000);
    setTotalTimeSeconds(totalElapsed);

    // Save part score
    const currentMax = gameQuestions.length * 10;
    const updated = {
      ...completedPartScores,
      [activePart]: {
        score,
        maxScore: currentMax,
        date: new Date().toLocaleDateString('vi-VN'),
      },
    };
    setCompletedPartScores(updated);

    setView('results');
    setHasSavedProgress(false);
    persistState({
      view: 'results',
      sectionTimeLeft: 0,
      completedPartScores: updated,
    });
  };

  // Start selected part
  const handleStartPart = (partId: PartId) => {
    const questions = getQuestionsForPart(partId);
    const config = PART_CONFIGS[partId];
    const initialTime = config ? config.timeLimitSeconds : 600;

    setActivePart(partId);
    setGameQuestions(questions);
    setCurrentIndex(0);
    setScore(0);
    setHintsLeft(3);
    setAnswers([]);
    setSectionTimeLeft(initialTime);
    setStartTime(Date.now());
    setView('playing');
    setHasSavedProgress(false);

    persistState({
      profile,
      view: 'playing',
      activePart: partId,
      gameQuestions: questions,
      currentIndex: 0,
      score: 0,
      hintsLeft: 3,
      answers: [],
      sectionTimeLeft: initialTime,
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
          setActivePart(parsed.activePart || 'part1');
          setGameQuestions(freshQuestions);
          setCurrentIndex(parsed.currentIndex || 0);
          setScore(parsed.score || 0);
          setHintsLeft(parsed.hintsLeft ?? 3);
          setAnswers(parsed.answers || []);
          setMistakes(freshMistakes);
          setSectionTimeLeft(parsed.sectionTimeLeft ?? 600);
          setStartTime(Date.now());
          setView('playing');
          setHasSavedProgress(false);
          return;
        }
      }
    } catch {
      // ignore
    }
    handleStartPart('part1');
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
    setCompletedPartScores({});
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
      setMistakes((prev) => {
        // Avoid duplicate mistakes for same question
        const filtered = prev.filter((m) => m.question.id !== currentQ.id);
        return [
          ...filtered,
          {
            question: currentQ,
            userAnswer,
            practiceSolved: false,
          },
        ];
      });
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
      // Finished all questions for this part!
      if (timerRef.current) clearInterval(timerRef.current);
      const totalElapsed = Math.round((Date.now() - startTime) / 1000);
      setTotalTimeSeconds(totalElapsed);

      // Record completed score for this part
      const finalScore = score;
      const maxPossible = gameQuestions.length * 10;
      const updated = {
        ...completedPartScores,
        [activePart]: {
          score: finalScore,
          maxScore: maxPossible,
          date: new Date().toLocaleDateString('vi-VN'),
        },
      };
      setCompletedPartScores(updated);

      setView('results');
      setHasSavedProgress(false);
      sound.playFanfare();
      persistState({
        view: 'results',
        completedPartScores: updated,
      });
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

  const currentPartConfig = PART_CONFIGS[activePart] || PART_CONFIGS['part1'];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {view === 'start' && (
        <StartScreen
          profile={profile}
          onUpdateProfile={(p) => {
            setProfile(p);
            persistState({ profile: p });
          }}
          onStartPart={handleStartPart}
          hasSavedProgress={hasSavedProgress}
          savedPartId={activePart}
          onResumeGame={handleResumeGame}
          onResetData={handleResetData}
          soundEnabled={soundEnabled}
          onToggleSound={handleToggleSound}
          completedPartScores={completedPartScores}
          mistakesCount={mistakes.length}
          onOpenPracticeMistakes={() => {
            sound.playClick();
            setView('practice');
          }}
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
          partTitle={currentPartConfig.title}
          partSubtitle={currentPartConfig.subtitle}
          sectionTimeLeft={sectionTimeLeft}
          sectionTotalSeconds={currentPartConfig.timeLimitSeconds}
          onBackToMenu={() => {
            sound.playClick();
            if (confirm('Are you sure you want to pause and return to the main menu? Your current progress will be saved.')) {
              setView('start');
              setHasSavedProgress(true);
              persistState({ view: 'playing' });
            }
          }}
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
          partTitle={currentPartConfig.title}
          onChooseAnotherPart={() => {
            sound.playClick();
            setView('start');
          }}
          onPlayAgain={() => handleStartPart(activePart)}
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
            setView(answers.length > 0 ? 'results' : 'start');
          }}
        />
      )}

      {/* Footer Branding Bar */}
      <footer className="w-full py-4 text-center border-t border-slate-900 bg-slate-950/90 text-xs text-slate-500">
        <div className="flex flex-wrap items-center justify-center gap-2 max-w-4xl mx-auto px-4">
          <span>LEISURE QUEST – UNIT 1: LEISURE TIME</span>
          <span>•</span>
          <span>ENGLISH 8 – GLOBAL SUCCESS</span>
          <span>•</span>
          <span>CURATED BY TEACHER: <strong className="text-slate-300 font-semibold">VŨ THỊ MAI THU</strong></span>
        </div>
      </footer>
    </main>
  );
}
