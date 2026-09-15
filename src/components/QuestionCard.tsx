import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, Lightbulb, ArrowRight, Clock, HelpCircle, Sparkles, AlertCircle } from 'lucide-react';
import { LumiRobot, LumiMood } from './LumiRobot';
import { sound } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  currentScore: number;
  remainingHints: number;
  onUseHint: () => void;
  onAnswerSubmitted: (isCorrect: boolean, userAnswer: string) => void;
  onNextQuestion: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

const PRAISE_LIST = [
  'Excellent!',
  'Great job!',
  'Well done!',
  "You've got it!",
  'Amazing work!'
];

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  currentIndex,
  totalQuestions,
  currentScore,
  remainingHints,
  onUseHint,
  onAnswerSubmitted,
  onNextQuestion,
  soundEnabled,
  onToggleSound,
}) => {
  // Timer (50 seconds)
  const [timeLeft, setTimeLeft] = useState<number>(50);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isTimedOut, setIsTimedOut] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [praiseText, setPraiseText] = useState<string>('');
  
  // Hint state for current question
  const [hintActive, setHintActive] = useState<boolean>(false);
  const [eliminatedOptions, setEliminatedOptions] = useState<string[]>([]);

  // User input states depending on question type
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textInput, setTextInput] = useState<string>('');
  const [reorderedWords, setReorderedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const [dragSlotAnswer, setDragSlotAnswer] = useState<string>('');
  const [dialogueItems, setDialogueItems] = useState<string[]>([]);
  const [matchingConnections, setMatchingConnections] = useState<Record<string, string>>({});
  const [selectedLeftMatch, setSelectedLeftMatch] = useState<string | null>(null);

  // Initialize or reset question state
  useEffect(() => {
    setTimeLeft(50);
    setIsAnswered(false);
    setIsTimedOut(false);
    setIsCorrect(false);
    setSelectedOption('');
    setTextInput('');
    setHintActive(false);
    setEliminatedOptions([]);
    setDragSlotAnswer('');
    setSelectedLeftMatch(null);
    setMatchingConnections({});

    if (question.type === 'reorder-words' && question.scrambledItems) {
      setReorderedWords([]);
      setAvailableWords([...question.scrambledItems]);
    }

    if (question.type === 'reorder-dialogue' && question.scrambledItems) {
      setDialogueItems([...question.scrambledItems]);
    }
  }, [question.id]);

  // Countdown timer loop
  useEffect(() => {
    if (isAnswered) return;

    if (timeLeft <= 0) {
      handleTimeOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev === 11) {
          sound.playTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  const handleTimeOut = () => {
    if (isAnswered) return;
    setIsTimedOut(true);
    setIsAnswered(true);
    setIsCorrect(false);
    sound.playIncorrect();
    onAnswerSubmitted(false, "Time's up (No answer)");
  };

  // Trigger hint
  const handleApplyHint = () => {
    if (remainingHints <= 0 || hintActive || isAnswered) return;
    onUseHint();
    setHintActive(true);
    sound.playClick();

    if (question.type === 'multiple-choice' && question.options) {
      // eliminate two incorrect choices
      const wrongOpts = question.options.filter((opt) => opt !== question.answer);
      const toEliminate = wrongOpts.slice(0, 2);
      setEliminatedOptions(toEliminate);
    }
  };

  // Helper normalizer for text comparison
  const normalizeText = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[.,/#!$%^&*;:{}=\-_`~()?]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  // Submission handler
  const handleSubmitAnswer = () => {
    if (isAnswered) return;

    let userAns = '';
    let correct = false;

    if (question.type === 'multiple-choice') {
      if (!selectedOption) return;
      userAns = selectedOption;
      correct = selectedOption === question.answer;
    } else if (question.type === 'fill-blank') {
      if (!textInput.trim()) return;
      userAns = textInput.trim();
      const normInput = normalizeText(textInput);
      const normAnswer = normalizeText(question.answer);
      const acceptable = (question.acceptableAnswers || []).map(normalizeText);

      correct = normInput === normAnswer || acceptable.includes(normInput);
    } else if (question.type === 'reorder-words') {
      if (reorderedWords.length === 0) return;
      userAns = reorderedWords.join(' ');
      const normReorder = normalizeText(userAns);
      const normAnswer = normalizeText(question.answer);
      const acceptable = (question.acceptableAnswers || []).map(normalizeText);

      correct = normReorder === normAnswer || acceptable.includes(normReorder);
    } else if (question.type === 'drag-drop') {
      if (!dragSlotAnswer) return;
      userAns = dragSlotAnswer;
      correct = dragSlotAnswer === question.answer;
    } else if (question.type === 'reorder-dialogue') {
      userAns = dialogueItems.join(' -> ');
      if (question.correctOrder) {
        correct = JSON.stringify(dialogueItems) === JSON.stringify(question.correctOrder);
      } else {
        correct = userAns === question.answer;
      }
    } else if (question.type === 'matching') {
      if (!question.matchingPairs || Object.keys(matchingConnections).length < question.matchingPairs.length) {
        return;
      }
      userAns = Object.entries(matchingConnections)
        .map(([lId, rId]) => `${lId}-${rId}`)
        .join(', ');
      correct = userAns === question.answer;
    }

    setIsAnswered(true);
    setIsCorrect(correct);

    if (correct) {
      sound.playCorrect();
      triggerConfetti(false);
      const randomPraise = PRAISE_LIST[Math.floor(Math.random() * PRAISE_LIST.length)];
      setPraiseText(randomPraise);
    } else {
      sound.playIncorrect();
    }

    onAnswerSubmitted(correct, userAns);
  };

  // Determine Lumi mood and speech text
  let lumiMood: LumiMood = 'thinking';
  let lumiSpeech = '';

  if (isAnswered) {
    if (isCorrect) {
      lumiMood = 'correct';
      lumiSpeech = `${praiseText} Excellent work! Let's review the key point together!`;
    } else if (isTimedOut) {
      lumiMood = 'warning';
      lumiSpeech = "Time's up! Don't worry, check the detailed explanation below to master this!";
    } else {
      lumiMood = 'incorrect';
      lumiSpeech = "Not quite right. Keep going and check the grammar rule below!";
    }
  } else if (timeLeft <= 10) {
    lumiMood = 'warning';
    lumiSpeech = `Hurry up! Only ${timeLeft} seconds left!`;
  } else {
    lumiMood = 'thinking';
    lumiSpeech = `Stage ${question.stage}: ${question.category}. Read the question carefully and give your best answer!`;
  }

  // Level badge color & label
  const getLevelLabel = () => {
    switch (question.level) {
      case 'Nhận biết':
        return 'Knowledge';
      case 'Thông hiểu':
        return 'Comprehension';
      case 'Vận dụng':
        return 'Application';
      default:
        return question.level;
    }
  };

  const getLevelBadgeClass = () => {
    switch (question.level) {
      case 'Nhận biết':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Thông hiểu':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/40';
      case 'Vận dụng':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-700 text-slate-300';
    }
  };

  const progressPercent = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const timerRatio = Math.max(0, timeLeft / 50);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 sm:py-6">
      {/* Top Header Information Bar */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl mb-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {/* Stage & Index info */}
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-xl bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs sm:text-sm font-bold">
              Stage {question.stage}: {question.stageName.split('(')[0].trim()}
            </span>
            <span className={`px-2.5 py-0.5 rounded-lg border text-xs font-semibold ${getLevelBadgeClass()}`}>
              {getLevelLabel()}
            </span>
          </div>

          {/* Score & Counter */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-slate-400 block font-medium">Score</span>
              <span className="text-lg font-black text-amber-400">{currentScore} pts</span>
            </div>
            <div className="text-right pl-3 border-l border-slate-800">
              <span className="text-xs text-slate-400 block font-medium">Progress</span>
              <span className="text-sm font-extrabold text-sky-300">
                {currentIndex + 1} / {totalQuestions}
              </span>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden mb-3">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Timer Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300 min-w-[70px]">
            <Clock className={`w-4 h-4 ${timeLeft <= 10 ? 'text-amber-400 animate-bounce' : 'text-sky-400'}`} />
            <span className={timeLeft <= 10 ? 'text-amber-400 font-extrabold' : ''}>{timeLeft}s</span>
          </div>

          <div className="flex-1 h-2.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${
                timeLeft <= 10 ? 'bg-amber-400' : 'bg-sky-400'
              }`}
              style={{ width: `${timerRatio * 100}%` }}
            />
          </div>

          {/* Hint button */}
          <button
            onClick={handleApplyHint}
            disabled={remainingHints <= 0 || hintActive || isAnswered}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              remainingHints > 0 && !hintActive && !isAnswered
                ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 hover:bg-amber-500/30 cursor-pointer'
                : 'bg-slate-800/60 border border-slate-700/50 text-slate-500 cursor-not-allowed'
            }`}
            title="Use 1 hint"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>HINT ({remainingHints})</span>
          </button>
        </div>
      </div>

      {/* Lumi Robot Companion Dialogue */}
      <div className="mb-4 flex justify-center sm:justify-start">
        <LumiRobot mood={lumiMood} speechText={lumiSpeech} />
      </div>

      {/* Main Question Card Container */}
      <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-8 shadow-2xl space-y-6">
        {/* Question Header & Category */}
        <div className="space-y-3 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-800 text-sky-400 border border-slate-700">
              Category: {question.category}
            </span>
            {hintActive && (
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                Hint Used
              </span>
            )}
          </div>

          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-100 leading-relaxed whitespace-pre-line">
            {question.question}
          </h2>

          {question.subText && (
            <p className="text-sm text-slate-400 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              {question.subText}
            </p>
          )}
        </div>

        {/* Hint Display Box (if activated) */}
        {hintActive && (
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-400/30 text-amber-200 text-xs sm:text-sm space-y-1.5 text-left">
            <div className="font-bold flex items-center gap-1.5 text-amber-300">
              <Lightbulb className="w-4 h-4" />
              <span>Lumi's Hint:</span>
            </div>
            {question.grammarFormula && (
              <p>Grammar Rule: <strong>{question.grammarFormula}</strong></p>
            )}
            {question.example && (
              <p>Similar example: <em>{question.example}</em></p>
            )}
            {question.type === 'fill-blank' && (
              <p>Starts with: <strong>{question.answer[0]?.toUpperCase()}...</strong> ({question.answer.length} characters)</p>
            )}
            {question.type === 'multiple-choice' && (
              <p>Eliminated 2 incorrect choices!</p>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* INTERACTIVE CONTROLS BY QUESTION TYPE */}
        {/* ========================================================== */}

        {/* 1. Multiple Choice */}
        {question.type === 'multiple-choice' && question.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {question.options.map((opt, idx) => {
              const isEliminated = eliminatedOptions.includes(opt);
              const isSelected = selectedOption === opt;
              const isOptionCorrect = opt === question.answer;

              let btnStyle = 'bg-slate-800/70 border-slate-700/80 text-slate-200 hover:bg-slate-800 hover:border-sky-400';

              if (isEliminated) {
                btnStyle = 'opacity-30 bg-slate-900 border-slate-800 text-slate-600 cursor-not-allowed line-through';
              } else if (isAnswered) {
                if (isOptionCorrect) {
                  btnStyle = 'bg-emerald-500/20 border-emerald-400 text-emerald-200 font-bold';
                } else if (isSelected && !isOptionCorrect) {
                  btnStyle = 'bg-rose-500/20 border-rose-400 text-rose-200 font-bold';
                } else {
                  btnStyle = 'opacity-40 bg-slate-900 border-slate-800 text-slate-500';
                }
              } else if (isSelected) {
                btnStyle = 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-400/30 font-bold';
              }

              return (
                <button
                  key={idx}
                  disabled={isEliminated || isAnswered}
                  onClick={() => {
                    sound.playClick();
                    setSelectedOption(opt);
                  }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3 cursor-pointer ${btnStyle}`}
                >
                  <span className="w-6 h-6 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 flex-shrink-0 mt-0.5">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm sm:text-base leading-snug flex-1">{opt}</span>
                  {isAnswered && isOptionCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  )}
                  {isAnswered && isSelected && !isOptionCorrect && (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* 2. Fill in the Blank */}
        {question.type === 'fill-blank' && (
          <div className="space-y-4 pt-2 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Type your answer:
              </label>
              <input
                type="text"
                disabled={isAnswered}
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isAnswered && textInput.trim()) {
                    handleSubmitAnswer();
                  }
                }}
                placeholder="Type your answer here..."
                className={`w-full p-4 rounded-xl bg-slate-950 border text-base font-medium focus:outline-none transition ${
                  isAnswered
                    ? isCorrect
                      ? 'border-emerald-400 bg-emerald-950/20 text-emerald-200'
                      : 'border-rose-400 bg-rose-950/20 text-rose-200'
                    : 'border-slate-700 text-slate-100 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20'
                }`}
              />
            </div>
            <p className="text-xs text-slate-500">
              💡 Case-insensitive, extra spaces are automatically trimmed, and flexible punctuation is supported.
            </p>
          </div>
        )}

        {/* 3. Reorder Words */}
        {question.type === 'reorder-words' && (
          <div className="space-y-4 pt-2 text-left">
            {/* Built sentence slot */}
            <div className="min-h-[64px] p-4 rounded-xl bg-slate-950/80 border-2 border-dashed border-slate-700 flex flex-wrap gap-2 items-center">
              {reorderedWords.length === 0 ? (
                <span className="text-slate-500 text-sm italic">
                  Click words below to arrange into a sentence...
                </span>
              ) : (
                reorderedWords.map((word, wIdx) => (
                  <button
                    key={wIdx}
                    disabled={isAnswered}
                    onClick={() => {
                      if (isAnswered) return;
                      sound.playClick();
                      setReorderedWords(reorderedWords.filter((_, i) => i !== wIdx));
                      setAvailableWords([...availableWords, word]);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-sky-500/20 border border-sky-400/60 text-sky-200 text-sm font-semibold hover:bg-rose-500/20 hover:border-rose-400 hover:text-rose-200 transition cursor-pointer"
                    title="Click to remove"
                  >
                    {word} ✕
                  </button>
                ))
              )}
            </div>

            {/* Word bank pool */}
            <div className="space-y-1.5">
              <div className="text-xs text-slate-400 font-semibold">Word bank (click to select):</div>
              <div className="flex flex-wrap gap-2">
                {availableWords.map((word, aIdx) => (
                  <button
                    key={aIdx}
                    disabled={isAnswered}
                    onClick={() => {
                      if (isAnswered) return;
                      sound.playClick();
                      setReorderedWords([...reorderedWords, word]);
                      setAvailableWords(availableWords.filter((_, i) => i !== aIdx));
                    }}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-sky-600/30 border border-slate-700 hover:border-sky-400 text-slate-200 text-sm font-medium transition active:scale-95 cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>

            {reorderedWords.length > 0 && !isAnswered && (
              <button
                onClick={() => {
                  sound.playClick();
                  setAvailableWords([...(question.scrambledItems || [])]);
                  setReorderedWords([]);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 transition underline cursor-pointer"
              >
                RESET WORDS
              </button>
            )}
          </div>
        )}

        {/* 4. Drag and Drop */}
        {question.type === 'drag-drop' && (
          <div className="space-y-4 pt-2 text-left">
            {/* Sentence with blank slot */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-base sm:text-lg leading-relaxed text-slate-200">
              {question.dragTemplate?.split('___').map((part, pIdx, arr) => (
                <React.Fragment key={pIdx}>
                  <span>{part}</span>
                  {pIdx < arr.length - 1 && (
                    <span
                      onClick={() => {
                        if (!isAnswered && dragSlotAnswer) {
                          sound.playClick();
                          setDragSlotAnswer('');
                        }
                      }}
                      className={`inline-block mx-1.5 px-3 py-1 rounded-lg border-2 font-bold text-sm transition cursor-pointer ${
                        dragSlotAnswer
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                          : 'bg-slate-800 border-dashed border-slate-600 text-slate-500'
                      }`}
                    >
                      {dragSlotAnswer ? `${dragSlotAnswer} ✕` : '[ Select a word to place here ]'}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Word choices */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-400">Select the correct option:</span>
              <div className="flex flex-wrap gap-2.5">
                {question.dragPool?.map((word, dIdx) => (
                  <button
                    key={dIdx}
                    disabled={isAnswered || dragSlotAnswer === word}
                    onClick={() => {
                      sound.playClick();
                      setDragSlotAnswer(word);
                    }}
                    className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition cursor-pointer ${
                      dragSlotAnswer === word
                        ? 'bg-sky-500/20 border-sky-400 text-sky-300 ring-2 ring-sky-400/30'
                        : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
                    }`}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. Reorder Dialogue */}
        {question.type === 'reorder-dialogue' && (
          <div className="space-y-3 pt-2 text-left">
            <span className="text-xs text-slate-400 font-semibold">
              Use arrows ⬆ ⬇ to arrange the dialogue in order:
            </span>
            <div className="space-y-2">
              {dialogueItems.map((line, dIdx) => (
                <div
                  key={dIdx}
                  className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-sm text-slate-200"
                >
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-sky-400 font-bold text-xs flex items-center justify-center flex-shrink-0">
                    {dIdx + 1}
                  </span>
                  <span className="flex-1 font-medium">{line}</span>
                  {!isAnswered && (
                    <div className="flex items-center gap-1">
                      <button
                        disabled={dIdx === 0}
                        onClick={() => {
                          sound.playClick();
                          const newItems = [...dialogueItems];
                          const temp = newItems[dIdx];
                          newItems[dIdx] = newItems[dIdx - 1];
                          newItems[dIdx - 1] = temp;
                          setDialogueItems(newItems);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center transition cursor-pointer"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        disabled={dIdx === dialogueItems.length - 1}
                        onClick={() => {
                          sound.playClick();
                          const newItems = [...dialogueItems];
                          const temp = newItems[dIdx];
                          newItems[dIdx] = newItems[dIdx + 1];
                          newItems[dIdx + 1] = temp;
                          setDialogueItems(newItems);
                        }}
                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-300 font-bold flex items-center justify-center transition cursor-pointer"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Matching Pairs */}
        {question.type === 'matching' && question.matchingPairs && (
          <div className="space-y-4 pt-2 text-left">
            <span className="text-xs text-slate-400 font-semibold">
              Select an item in Column A, then match it with Column B:
            </span>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-sky-400 uppercase tracking-wider">Column A</div>
                {question.matchingPairs.map((pair) => {
                  const isConnected = !!matchingConnections[pair.leftId];
                  const isSelected = selectedLeftMatch === pair.leftId;

                  return (
                    <button
                      key={pair.leftId}
                      disabled={isAnswered}
                      onClick={() => {
                        sound.playClick();
                        setSelectedLeftMatch(pair.leftId);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-sm font-semibold transition cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? 'bg-sky-500/20 border-sky-400 text-sky-200 ring-2 ring-sky-400/40'
                          : isConnected
                          ? 'bg-indigo-950/40 border-indigo-500/50 text-indigo-200'
                          : 'bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <span>{pair.left}</span>
                      {isConnected && (
                        <span className="text-xs px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300">
                          Matched
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Right Column */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-teal-400 uppercase tracking-wider">Column B</div>
                {question.matchingPairs.map((pair) => {
                  const connectedLeft = Object.entries(matchingConnections).find(([, r]) => r === pair.rightId)?.[0];

                  return (
                    <button
                      key={pair.rightId}
                      disabled={isAnswered}
                      onClick={() => {
                        if (!selectedLeftMatch) return;
                        sound.playClick();
                        setMatchingConnections({
                          ...matchingConnections,
                          [selectedLeftMatch]: pair.rightId,
                        });
                        setSelectedLeftMatch(null);
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-sm font-medium transition cursor-pointer flex items-center justify-between ${
                        connectedLeft
                          ? 'bg-teal-950/40 border-teal-500/50 text-teal-200'
                          : 'bg-slate-800/70 border-slate-700 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      <span>{pair.right}</span>
                      {connectedLeft && (
                        <span className="text-xs px-2 py-0.5 rounded bg-teal-500/30 text-teal-300">
                          Matched with {question.matchingPairs?.find((p) => p.leftId === connectedLeft)?.left}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {Object.keys(matchingConnections).length > 0 && !isAnswered && (
              <button
                onClick={() => {
                  sound.playClick();
                  setMatchingConnections({});
                  setSelectedLeftMatch(null);
                }}
                className="text-xs text-slate-400 hover:text-rose-400 underline transition cursor-pointer"
              >
                CLEAR ALL CONNECTIONS
              </button>
            )}
          </div>
        )}

        {/* ========================================================== */}
        {/* ACTION BUTTONS: CONFIRM OR NEXT */}
        {/* ========================================================== */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {!isAnswered ? (
              <span>* Complete your answer and click Submit</span>
            ) : (
              <span className="text-emerald-400 font-medium">RESULT RECORDED FOR THIS QUESTION</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!isAnswered ? (
              <button
                onClick={handleSubmitAnswer}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-sky-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>SUBMIT</span>
              </button>
            ) : (
              <button
                onClick={onNextQuestion}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 transition active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <span>NEXT QUESTION</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ========================================================== */}
        {/* PEDAGOGICAL FEEDBACK PANEL */}
        {/* ========================================================== */}
        {isAnswered && (
          <div
            className={`p-5 rounded-2xl border text-left space-y-3 transition-all duration-300 ${
              isCorrect
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-base">
              {isCorrect ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span className="text-emerald-300 font-extrabold">{praiseText} Correct!</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                  <span className="text-rose-300 font-extrabold">
                    {isTimedOut ? "Time's up!" : "Not quite right. Let's review the answer below!"}
                  </span>
                </>
              )}
            </div>

            <div className="space-y-2 text-sm text-slate-200 bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              <div>
                <strong className="text-sky-300">Correct Answer:</strong>{' '}
                <span className="font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                  {question.answer}
                </span>
              </div>

              <div>
                <strong className="text-sky-300">Detailed Explanation:</strong> {question.explanation}
              </div>

              {question.grammarFormula && (
                <div>
                  <strong className="text-indigo-300">Grammar Rule:</strong>{' '}
                  <code className="px-2 py-0.5 rounded bg-slate-950 text-indigo-200 font-mono text-xs">
                    {question.grammarFormula}
                  </code>
                </div>
              )}

              {question.example && (
                <div>
                  <strong className="text-amber-300">Example:</strong> <em>{question.example}</em>
                </div>
              )}

              {question.tip && (
                <div className="text-xs text-slate-300 pt-1 border-t border-slate-800/80 flex items-center gap-1.5">
                  <span className="text-amber-400 font-bold">💡 Memory Tip:</span>
                  <span>{question.tip}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
