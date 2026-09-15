import React, { useState } from 'react';
import { StudentProfile } from '../types';
import { LumiRobot } from './LumiRobot';
import { Sparkles, BookOpen, Volume2, VolumeX, RotateCcw, Award, Compass, HelpCircle } from 'lucide-react';
import { sound } from '../utils/audio';

interface StartScreenProps {
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  onStartGame: () => void;
  hasSavedProgress: boolean;
  onResumeGame: () => void;
  onResetData: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  onUpdateProfile,
  onStartGame,
  hasSavedProgress,
  onResumeGame,
  onResetData,
  soundEnabled,
  onToggleSound,
}) => {
  const [showGuide, setShowGuide] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleStart = () => {
    if (!profile.name.trim() || !profile.studentClass.trim() || !profile.school.trim()) {
      setErrorMsg('Em hãy nhập đầy đủ họ tên, lớp và trường trước khi bắt đầu nhé!');
      sound.playIncorrect();
      return;
    }
    setErrorMsg('');
    sound.playClick();
    onStartGame();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleStart();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 overflow-hidden">
      {/* Dynamic atmospheric background lights */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-10 right-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls bar */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
        <button
          onClick={onToggleSound}
          className="p-2.5 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-sky-400 transition"
          title={soundEnabled ? 'Mute sound' : 'Unmute sound'}
        >
          {soundEnabled ? <Volume2 className="w-5 h-5 text-sky-400" /> : <VolumeX className="w-5 h-5 text-slate-500" />}
        </button>
        <button
          onClick={() => {
            sound.playClick();
            setShowGuide(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/80 border border-slate-700/60 text-slate-300 hover:text-white hover:border-sky-400 text-sm font-medium transition cursor-pointer"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>GUIDE</span>
        </button>
      </div>

      <div className="max-w-xl w-full z-10 my-8">
        {/* Title Badge & Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-semibold mb-3 tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 animate-spin" style={{ animationDuration: '6s' }} />
            <span>GIA SƯ THÔNG THÁI TIẾNG ANH 8</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent font-['Outfit',sans-serif] drop-shadow-sm leading-tight">
            LEISURE QUEST
          </h1>
          <p className="text-sm sm:text-base font-semibold text-slate-300 mt-1 uppercase tracking-wider">
            Unit 1 Adventure – Leisure Time
          </p>

          <div className="mt-2 text-xs font-medium text-slate-400 flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Giáo viên biên soạn: <strong className="text-amber-300">VŨ THỊ MAI THU</strong></span>
          </div>
        </div>

        {/* Lumi Greetings Box */}
        <div className="mb-6 flex justify-center">
          <LumiRobot
            mood="greeting"
            speechText="Chào em! Mình là Lumi 🤖. Chào mừng em đến với hành trình chinh phục 5 chặng kiến thức Unit 1: Leisure Time. Hãy nhập thông tin để nhận huy hiệu và cùng khám phá nhé!"
          />
        </div>

        {/* Card Form */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-sky-950/40">
          <div className="flex items-center gap-2 mb-5 text-slate-200 font-semibold text-base border-b border-slate-800 pb-3">
            <Compass className="w-5 h-5 text-sky-400" />
            <span>Thông tin nhà thám hiểm</span>
          </div>

          <div className="space-y-4 text-left" onKeyDown={handleKeyDown}>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Họ và tên học sinh <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => {
                  onUpdateProfile({ ...profile, name: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="Ví dụ: Nguyễn Văn An"
                className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Lớp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.studentClass}
                  onChange={(e) => {
                    onUpdateProfile({ ...profile, studentClass: e.target.value });
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Ví dụ: 8A1"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Trường <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={profile.school}
                  onChange={(e) => {
                    onUpdateProfile({ ...profile, school: e.target.value });
                    if (errorMsg) setErrorMsg('');
                  }}
                  placeholder="Ví dụ: THCS Chu Văn An"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950/70 border border-slate-700/70 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
                />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-medium flex items-center gap-2">
                <span>⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="pt-3 flex flex-col gap-3">
              {hasSavedProgress ? (
                <>
                  <button
                    onClick={onResumeGame}
                    className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold text-base tracking-wide shadow-lg shadow-emerald-500/25 transition transform active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>RESUME QUEST</span>
                  </button>
                  <button
                    onClick={handleStart}
                    className="w-full py-3 px-6 rounded-xl bg-sky-600/30 hover:bg-sky-600/50 border border-sky-500/40 text-sky-200 font-bold text-sm tracking-wide transition cursor-pointer"
                  >
                    START NEW QUEST (25 QUESTIONS)
                  </button>
                </>
              ) : (
                <button
                  onClick={handleStart}
                  className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-500 hover:from-sky-400 hover:via-teal-300 hover:to-indigo-400 text-slate-950 font-black text-base tracking-wider shadow-lg shadow-sky-500/30 transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>START QUEST</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-center text-slate-400 pt-1">
              Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700">Enter</kbd> when done to start quickly
            </p>
          </div>
        </div>

        {/* Reset / Clear Data */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-slate-500 hover:text-slate-300 underline transition cursor-pointer"
          >
            Reset data and start over
          </button>
        </div>
      </div>

      {/* Guide Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                <span>QUEST GUIDE</span>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <ul className="space-y-2.5 text-sm text-slate-300 text-left leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="text-sky-400 font-bold">⏱️</span>
                <span><strong>50 seconds per question</strong> countdown to think and answer.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-400 font-bold">⭐</span>
                <span><strong>Correct answer</strong> earns <strong>+10 points</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-slate-400 font-bold">🛡️</span>
                <span><strong>Incorrect answer</strong> never deducts previous points.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-400 font-bold">💡</span>
                <span>You can use <strong>up to 3 hints</strong> per session (50:50 elimination, grammar tip).</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-indigo-400 font-bold">📖</span>
                <span>Read detailed <strong>explanations and grammar formulas</strong> after each question.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-teal-400 font-bold">🔄</span>
                <span>After completing, you can <strong>practice your mistakes</strong> in the Practice Room.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-amber-300 font-bold">📜</span>
                <span>Score <strong>70% or above</strong> to earn the official <strong>Certificate of Completion</strong>!</span>
              </li>
            </ul>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm transition mt-2 cursor-pointer"
            >
              GOT IT, READY TO START!
            </button>
          </div>
        </div>
      )}

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-slate-100">Confirm Reset Data?</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              This will clear all saved progress, mistake history, and scores stored in this browser.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition cursor-pointer"
              >
                RESET DATA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
