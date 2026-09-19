import React, { useState } from 'react';
import { StudentProfile, Category, AnswerRecord, MistakeRecord } from '../types';
import { LumiRobot } from './LumiRobot';
import { Certificate } from './Certificate';
import { Award, RotateCcw, RefreshCw, Copy, Check, BarChart3, Clock, Lightbulb, FileCode, CheckCircle2, XCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface ResultScreenProps {
  profile: StudentProfile;
  answers: AnswerRecord[];
  mistakes: MistakeRecord[];
  totalScore: number;
  maxScore: number;
  totalTimeSeconds: number;
  hintsUsed: number;
  onPlayAgain: () => void;
  onOpenPractice: () => void;
  onDownloadSingleHtml: () => void;
  partTitle?: string;
  onChooseAnotherPart?: () => void;
}

export const ResultScreen: React.FC<ResultScreenProps> = ({
  profile,
  answers,
  mistakes,
  totalScore,
  maxScore,
  totalTimeSeconds,
  hintsUsed,
  onPlayAgain,
  onOpenPractice,
  onDownloadSingleHtml,
  partTitle,
  onChooseAnotherPart,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  const correctCount = answers.filter((a) => a.isCorrect).length;
  const incorrectCount = answers.filter((a) => !a.isCorrect).length;
  const totalCount = answers.length || 1;
  const percentage = Math.round((correctCount / totalCount) * 100);

  // Group performance by category
  const categories: Category[] = [
    'Vocabulary',
    'Prepositions',
    'Verb forms',
    'Communication',
    'Sentence building',
    'Reading and writing',
  ];

  const categoryStats: Record<Category, { total: number; correct: number }> = {
    'Vocabulary': { total: 0, correct: 0 },
    'Prepositions': { total: 0, correct: 0 },
    'Verb forms': { total: 0, correct: 0 },
    'Communication': { total: 0, correct: 0 },
    'Sentence building': { total: 0, correct: 0 },
    'Reading and writing': { total: 0, correct: 0 },
  };

  answers.forEach((ans) => {
    // Find category from mistakes or general bank
    const mistake = mistakes.find((m) => m.question.id === ans.questionId);
    let cat: Category = 'Vocabulary';
    if (mistake) {
      cat = mistake.question.category;
    } else {
      // Find from questionsBank in a lookup or default
      if (ans.questionId >= 1 && ans.questionId <= 10) cat = 'Vocabulary';
      else if (ans.questionId <= 20) cat = 'Prepositions';
      else if (ans.questionId <= 30) cat = 'Communication';
      else if (ans.questionId <= 40) cat = 'Sentence building';
      else cat = 'Reading and writing';
    }

    if (categoryStats[cat]) {
      categoryStats[cat].total += 1;
      if (ans.isCorrect) {
        categoryStats[cat].correct += 1;
      }
    }
  });

  // Find weakest category
  let weakestCat: Category = 'Vocabulary';
  let lowestRate = 101;
  for (const c of categories) {
    const stats = categoryStats[c];
    if (stats.total > 0) {
      const rate = (stats.correct / stats.total) * 100;
      if (rate < lowestRate) {
        lowestRate = rate;
        weakestCat = c;
      }
    }
  }

  // Tier assessment
  let tierTitle = '';
  let tierColor = '';
  let lumiSummarySpeech = '';

  if (percentage >= 90) {
    tierTitle = 'EXCELLENT – You have mastered Unit 1!';
    tierColor = 'from-amber-400 to-yellow-200 text-amber-300';
    lumiSummarySpeech = `Outstanding job, ${profile.name}! You scored an impressive ${percentage}%. You have thoroughly mastered Unit 1: Leisure Time!`;
  } else if (percentage >= 70) {
    tierTitle = 'WELL DONE – Practice your mistakes to reach 100%!';
    tierColor = 'from-emerald-400 to-teal-300 text-emerald-300';
    lumiSummarySpeech = `Congratulations, ${profile.name}! You did great with ${percentage}%. Try the Practice Mistakes room to review any small errors!`;
  } else if (percentage >= 50) {
    tierTitle = 'GOOD EFFORT – Review vocabulary and liking verbs!';
    tierColor = 'from-sky-400 to-indigo-300 text-sky-300';
    lumiSummarySpeech = `Great effort, ${profile.name}! Pay extra attention to ${weakestCat} and verbs like enjoy/prefer to boost your score higher!`;
  } else {
    tierTitle = 'KEEP TRYING – Every practice makes you better!';
    tierColor = 'from-rose-400 to-pink-300 text-rose-300';
    lumiSummarySpeech = `Never give up! Review the detailed explanations in Practice Mistakes and try another round with Lumi!`;
  }

  // Generate parent notification text
  const parentNoticeText = `Student ${profile.name} – Class ${profile.studentClass} (${profile.school}) has completed Unit 1: Leisure Time quest with ${correctCount}/${totalCount} correct answers (${totalScore}/${maxScore} pts), achieving ${percentage}%. Area to practice: ${
    weakestCat ? weakestCat : 'None'
  }.`;

  const handleCopyParentReport = () => {
    sound.playClick();
    navigator.clipboard.writeText(parentNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  const timeFormatted = `${minutes}m ${seconds}s`;
  const currentDate = new Date().toLocaleDateString('en-US');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold">
          <span>{partTitle ? `RESULTS: ${partTitle}` : 'LEISURE QUEST RESULTS'}</span>
        </div>

        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r ${tierColor} bg-clip-text text-transparent font-['Outfit',sans-serif]`}>
          {tierTitle}
        </h1>

        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Student: <strong className="text-white">{profile.name}</strong> • Class:{' '}
          <strong className="text-sky-300">{profile.studentClass}</strong> • School:{' '}
          <strong className="text-teal-300">{profile.school}</strong>
        </p>

        {/* Lumi closing comment */}
        <div className="flex justify-center pt-2">
          <LumiRobot
            mood={percentage >= 70 ? 'celebrate' : 'thinking'}
            speechText={lumiSummarySpeech}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Total Score Earned</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            {totalScore}
            <span className="text-sm text-slate-500 font-normal"> / {maxScore}</span>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Accuracy Rate</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">
            {percentage}%
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Correct / Incorrect</span>
          <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black">
            <span className="text-emerald-400">{correctCount}</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400">{incorrectCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Time Completed</span>
          <div className="flex items-center justify-center gap-1.5 text-sm sm:text-base font-bold text-slate-200 mt-1">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>{timeFormatted}</span>
          </div>
        </div>
      </div>

      {/* Breakdown by Category */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 text-left shadow-xl space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <BarChart3 className="w-5 h-5 text-sky-400" />
          <h2 className="text-base font-bold text-slate-100">
            Performance Analysis by Unit 1 Skill Area
          </h2>
        </div>

        <div className="space-y-3">
          {categories.map((cat) => {
            const stats = categoryStats[cat];
            const rate = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 100;

            return (
              <div key={cat} className="space-y-1.5">
                <div className="flex justify-between text-xs sm:text-sm font-semibold">
                  <span className="text-slate-300">{cat}</span>
                  <span className="text-slate-400">
                    {stats.correct}/{stats.total} questions ({rate}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      rate >= 80 ? 'bg-emerald-400' : rate >= 50 ? 'bg-sky-400' : 'bg-rose-400'
                    }`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Personalized Advice */}
        <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm text-slate-300 space-y-1">
          <strong className="text-amber-300 block font-bold">💡 Personalized Advice:</strong>
          {weakestCat === 'Prepositions' && (
            <p>Review prepositions following adjectives of liking: <em>keen on, fond of, crazy about, interested in, be into</em>.</p>
          )}
          {weakestCat === 'Verb forms' && (
            <p>Remember: Verbs of liking/disliking like <em>fancy, adore, enjoy, dislike, detest, don't mind</em> are followed by <strong>V-ing</strong>.</p>
          )}
          {weakestCat === 'Sentence building' && (
            <p>Review comparative leisure structures: <em>prefer V-ing to V-ing</em> and <em>spend time + V-ing</em>.</p>
          )}
          {weakestCat === 'Vocabulary' && (
            <p>Remember leisure activity vocabulary such as <em>origami, DIY, board games, puzzles</em>.</p>
          )}
          {weakestCat === 'Communication' && (
            <p>Practice accepting invitations (<em>"I'd love to!"</em>) and polite refusals (<em>"I'd love to, but..."</em>).</p>
          )}
          {weakestCat === 'Reading and writing' && (
            <p>Practice skimming notices, posters, and differentiating <em>every day</em> (adverbial) vs <em>everyday</em> (adjective).</p>
          )}
        </div>
      </div>

      {/* Certificate Section (if percentage >= 70%) */}
      {percentage >= 70 && (
        <div className="space-y-3">
          <Certificate
            profile={profile}
            score={totalScore}
            totalScore={maxScore}
            percentage={percentage}
            dateStr={currentDate}
          />
        </div>
      )}

      {/* Parent Report Share Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-left space-y-3 shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-bold text-slate-200">
            Parent Progress Report Message
          </span>
          <button
            onClick={handleCopyParentReport}
            className="px-3.5 py-1.5 rounded-xl bg-sky-500/20 hover:bg-sky-500/30 border border-sky-400/50 text-sky-300 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED!' : 'COPY REPORT FOR PARENTS'}</span>
          </button>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 font-mono select-all">
          {parentNoticeText}
        </div>
        <p className="text-[11px] text-slate-500">
          * You or your parents can copy this report to messages or notes to save your progress.
        </p>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        {onChooseAnotherPart && (
          <button
            onClick={onChooseAnotherPart}
            className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-black text-sm flex items-center gap-2 transition active:scale-95 cursor-pointer shadow-md"
          >
            <span>🏠 CHOOSE ANOTHER PART</span>
          </button>
        )}

        <button
          onClick={onPlayAgain}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RETRY THIS PART ({answers.length} QUESTIONS)</span>
        </button>

        {mistakes.length > 0 && (
          <button
            onClick={onOpenPractice}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-amber-500/25 transition active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>PRACTICE MISTAKES ({mistakes.length} QUESTIONS)</span>
          </button>
        )}

        <button
          onClick={onDownloadSingleHtml}
          className="px-5 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer"
          title="Download entire app as a single standalone HTML file to run offline without internet"
        >
          <FileCode className="w-4 h-4 text-emerald-400" />
          <span>DOWNLOAD STANDALONE HTML (.HTML)</span>
        </button>
      </div>
    </div>
  );
};
