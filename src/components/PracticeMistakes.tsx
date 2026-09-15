import React, { useState } from 'react';
import { MistakeRecord } from '../types';
import { LumiRobot } from './LumiRobot';
import { RefreshCw, CheckCircle2, RotateCcw, Award, Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface PracticeMistakesProps {
  mistakes: MistakeRecord[];
  onBackToResults: () => void;
}

export const PracticeMistakes: React.FC<PracticeMistakesProps> = ({
  mistakes: initialMistakes,
  onBackToResults,
}) => {
  const [mistakesList, setMistakesList] = useState<MistakeRecord[]>(initialMistakes);
  const [isInteractiveMode, setIsInteractiveMode] = useState<boolean>(false);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOpt, setSelectedOpt] = useState<string>('');
  const [userTextInput, setUserTextInput] = useState<string>('');
  const [feedback, setFeedback] = useState<{ isCorrect: boolean; show: boolean }>({ isCorrect: false, show: false });

  if (mistakesList.length === 0) {
    return (
      <div className="max-w-2xl mx-auto p-8 text-center bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl my-8 space-y-4">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center text-3xl">
          🌟
        </div>
        <h2 className="text-2xl font-black text-slate-100">Chúc mừng em!</h2>
        <p className="text-slate-300">
          Em không có câu sai nào trong lượt chơi này! Em đã hoàn thành xuất sắc toàn bộ câu hỏi.
        </p>
        <button
          onClick={onBackToResults}
          className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition cursor-pointer"
        >
          BACK TO RESULTS
        </button>
      </div>
    );
  }

  const currentMistake = mistakesList[currentIdx];
  const activeQuestion = currentMistake?.question;

  const handleCheckAnswer = () => {
    if (!activeQuestion) return;

    let ans = '';
    if (activeQuestion.type === 'multiple-choice' || activeQuestion.type === 'drag-drop') {
      ans = selectedOpt;
    } else {
      ans = userTextInput.trim();
    }

    const norm = (s: string) => s.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '').trim();
    const isRight = norm(ans) === norm(activeQuestion.answer) || 
      (activeQuestion.acceptableAnswers || []).some(a => norm(a) === norm(ans));

    setFeedback({ isCorrect: isRight, show: true });

    if (isRight) {
      sound.playCorrect();
      triggerConfetti(false);
      // Mark as solved
      const updated = [...mistakesList];
      updated[currentIdx].practiceSolved = true;
      setMistakesList(updated);
    } else {
      sound.playIncorrect();
    }
  };

  const handleNextInteractive = () => {
    setSelectedOpt('');
    setUserTextInput('');
    setFeedback({ isCorrect: false, show: false });
    if (currentIdx < mistakesList.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      setIsInteractiveMode(false);
    }
  };

  const solvedCount = mistakesList.filter((m) => m.practiceSolved).length;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToResults}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
            title="Back to results"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-100 flex items-center gap-2">
              <span>PHÒNG LUYỆN LẠI</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {mistakesList.length} câu cần ôn
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Khắc phục lỗ hổng kiến thức – Luyện tập cho tới khi trả lời đúng
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!isInteractiveMode ? (
            <button
              onClick={() => {
                sound.playClick();
                setIsInteractiveMode(true);
                setCurrentIdx(0);
                setSelectedOpt('');
                setUserTextInput('');
                setFeedback({ isCorrect: false, show: false });
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-amber-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>INTERACTIVE PRACTICE</span>
            </button>
          ) : (
            <button
              onClick={() => setIsInteractiveMode(false)}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              VIEW SUMMARY LIST
            </button>
          )}
        </div>
      </div>

      {/* Lumi Guidance */}
      <div className="flex justify-center sm:justify-start">
        <LumiRobot
          mood="thinking"
          speechText={
            isInteractiveMode
              ? `Lumi is here with you! Solved: ${solvedCount}/${mistakesList.length} questions. Keep going!`
              : 'Here are the questions you missed. Read the explanation carefully before clicking Interactive Practice!'
          }
        />
      </div>

      {/* Mode 1: Interactive Re-quiz */}
      {isInteractiveMode && activeQuestion && (
        <div className="bg-slate-900/90 border border-amber-500/40 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-left">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
              Question {currentIdx + 1} / {mistakesList.length} (Stage {activeQuestion.stage}: {activeQuestion.category})
            </span>
            {currentMistake.practiceSolved && (
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CORRECT</span>
              </span>
            )}
          </div>

          <div className="text-lg sm:text-xl font-bold text-slate-100 whitespace-pre-line">
            {activeQuestion.question}
          </div>

          {/* Options / Input */}
          {activeQuestion.options ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeQuestion.options.map((opt, i) => (
                <button
                  key={i}
                  disabled={feedback.show && feedback.isCorrect}
                  onClick={() => {
                    sound.playClick();
                    setSelectedOpt(opt);
                  }}
                  className={`p-4 rounded-xl border text-sm font-semibold text-left transition cursor-pointer ${
                    selectedOpt === opt
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/30'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-slate-200'
                  }`}
                >
                  <span className="mr-2 font-mono text-slate-400">{String.fromCharCode(65 + i)}.</span>
                  <span>{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                disabled={feedback.show && feedback.isCorrect}
                value={userTextInput}
                onChange={(e) => setUserTextInput(e.target.value)}
                placeholder="Type your answer here..."
                className="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 text-base"
              />
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleCheckAnswer}
              disabled={feedback.show && feedback.isCorrect}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-black text-sm transition cursor-pointer"
            >
              CHECK ANSWER
            </button>

            {feedback.show && (
              <button
                onClick={handleNextInteractive}
                className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm flex items-center gap-2 transition cursor-pointer"
              >
                <span>{currentIdx < mistakesList.length - 1 ? 'NEXT QUESTION' : 'COMPLETE PRACTICE'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Feedback Box */}
          {feedback.show && (
            <div
              className={`p-4 rounded-xl border text-sm space-y-2 ${
                feedback.isCorrect
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200'
                  : 'bg-rose-950/40 border-rose-500 text-rose-200'
              }`}
            >
              <div className="font-bold flex items-center gap-2">
                {feedback.isCorrect ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Great job! You have mastered this question!</span>
                  </>
                ) : (
                  <span>Not quite right. Try again or check the hint below:</span>
                )}
              </div>
              <p className="text-slate-300">
                <strong>Detailed Explanation:</strong> {activeQuestion.explanation}
              </p>
              {activeQuestion.grammarFormula && (
                <p className="text-amber-300 text-xs">
                  <strong>Grammar Rule:</strong> {activeQuestion.grammarFormula}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Full Review List */}
      {!isInteractiveMode && (
        <div className="space-y-4">
          {mistakesList.map((m, idx) => (
            <div
              key={idx}
              className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3 transition hover:border-slate-700"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-sky-400 border border-slate-700">
                    Question {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-400">
                    Stage {m.question.stage}: {m.question.category}
                  </span>
                </div>
                {m.practiceSolved ? (
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>PRACTICE SOLVED</span>
                  </span>
                ) : (
                  <span className="text-xs font-medium text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-500/30">
                    NEEDS REVIEW
                  </span>
                )}
              </div>

              <div className="text-sm sm:text-base font-semibold text-slate-100 whitespace-pre-line">
                {m.question.question}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-lg bg-rose-950/30 border border-rose-500/30 text-rose-300">
                  <span className="font-bold block text-rose-400">Your answer:</span>
                  <span>{m.userAnswer || '(Empty)'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300">
                  <span className="font-bold block text-emerald-400">Correct answer:</span>
                  <span>{m.question.answer}</span>
                </div>
              </div>

              <div className="text-xs sm:text-sm text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                <div>
                  <strong className="text-sky-300">Detailed Explanation:</strong> {m.question.explanation}
                </div>
                {m.question.grammarFormula && (
                  <div>
                    <strong className="text-indigo-300">Grammar Rule:</strong> <code>{m.question.grammarFormula}</code>
                  </div>
                )}
                {m.question.example && (
                  <div>
                    <strong className="text-amber-300">Example:</strong> <em>{m.question.example}</em>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
