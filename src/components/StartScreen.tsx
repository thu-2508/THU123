import React, { useState } from 'react';
import { StudentProfile, PartId } from '../types';
import { PART_CONFIGS } from '../data/questions';
import { LumiRobot } from './LumiRobot';
import { 
  Sparkles, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Award, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Play, 
  Flame, 
  RefreshCw, 
  Compass, 
  ListChecks, 
  MessageSquare, 
  FileText, 
  PenTool,
  Info
} from 'lucide-react';
import { sound } from '../utils/audio';

interface CompletedScoreInfo {
  score: number;
  maxScore: number;
  date: string;
}

interface StartScreenProps {
  profile: StudentProfile;
  onUpdateProfile: (profile: StudentProfile) => void;
  onStartPart: (partId: PartId) => void;
  hasSavedProgress: boolean;
  savedPartId?: PartId;
  onResumeGame: () => void;
  onResetData: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  completedPartScores?: Record<string, CompletedScoreInfo>;
  mistakesCount?: number;
  onOpenPracticeMistakes?: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  onUpdateProfile,
  onStartPart,
  hasSavedProgress,
  savedPartId,
  onResumeGame,
  onResetData,
  soundEnabled,
  onToggleSound,
  completedPartScores = {},
  mistakesCount = 0,
  onOpenPracticeMistakes,
}) => {
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [guideExpanded, setGuideExpanded] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const validateProfile = (): boolean => {
    if (!profile.name.trim() || !profile.studentClass.trim() || !profile.school.trim()) {
      setErrorMsg('Please enter your Full Name, Class, and Secondary School before starting!');
      sound.playIncorrect();
      // Scroll smoothly to profile inputs
      const profileBox = document.getElementById('student-profile-box');
      if (profileBox) {
        profileBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return false;
    }
    setErrorMsg('');
    return true;
  };

  const handlePlayPart = (partId: PartId) => {
    if (!validateProfile()) return;
    sound.playClick();
    onStartPart(partId);
  };

  const getPartIcon = (id: PartId) => {
    switch (id) {
      case 'part1':
        return <ListChecks className="w-6 h-6 text-sky-400" />;
      case 'part2':
        return <MessageSquare className="w-6 h-6 text-emerald-400" />;
      case 'part3':
        return <FileText className="w-6 h-6 text-amber-400" />;
      case 'part4':
        return <PenTool className="w-6 h-6 text-indigo-400" />;
      default:
        return <Sparkles className="w-6 h-6 text-purple-400" />;
    }
  };

  const partKeys: PartId[] = ['part1', 'part2', 'part3', 'part4'];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-start p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-10 -left-20 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/3 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top action bar */}
      <header className="w-full max-w-5xl flex items-center justify-between py-2 mb-4 z-20">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Smart Secondary Practice System
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSound}
            className="p-2.5 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-sky-400 transition cursor-pointer"
            title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
          
          <button
            onClick={() => {
              sound.playClick();
              setShowGuideModal(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:text-white hover:border-amber-400 text-xs sm:text-sm font-semibold transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>DETAILED GUIDE</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-5xl w-full z-10 space-y-6 mb-12">
        {/* Hero Title Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs sm:text-sm font-semibold tracking-wide shadow-sm">
            <Sparkles className="w-4 h-4 text-sky-400 animate-spin" style={{ animationDuration: '8s' }} />
            <span>ENGLISH 8 • GLOBAL SUCCESS</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent font-['Outfit',sans-serif] drop-shadow-md">
            LEISURE QUEST
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-300 uppercase tracking-widest">
            Unit 1: Leisure Time – 4-Skill Mastery Quest
          </p>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-400 font-medium">
            <Award className="w-4 h-4 text-amber-400" />
            <span>Teacher / Author: <strong className="text-amber-300 font-bold">VŨ THỊ MAI THU</strong></span>
          </div>
        </div>

        {/* Lumi Greetings Box */}
        <div className="flex justify-center">
          <LumiRobot
            mood="greeting"
            speechText="Welcome to Leisure Quest Unit 1! The quest features 4 parts: Multiple Choice (15 Qs - 10 mins), Speaking (5 Qs - 5 mins), Reading (5 Qs - 5 mins), and Writing (5 Qs - 5 mins). Feel free to click and play any part first!"
          />
        </div>

        {/* Student Profile Input Card */}
        <div id="student-profile-box" className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm sm:text-base">
              <Compass className="w-5 h-5 text-sky-400" />
              <span>STUDENT INFORMATION</span>
            </div>
            <span className="text-xs text-slate-400 font-normal">
              * Please fill in your details for the Certificate of Completion
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Full Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => {
                  onUpdateProfile({ ...profile, name: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Alex Johnson / Nguyen Van An"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Class <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={profile.studentClass}
                onChange={(e) => {
                  onUpdateProfile({ ...profile, studentClass: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. 8A1"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Secondary School <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={profile.school}
                onChange={(e) => {
                  onUpdateProfile({ ...profile, school: e.target.value });
                  if (errorMsg) setErrorMsg('');
                }}
                placeholder="e.g. Chu Van An Secondary School"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-950/80 border border-slate-700/80 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 transition"
              />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs sm:text-sm font-semibold flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* 1. HƯỚNG DẪN CHƠI TRƯỚC KHI LÀM BÀI (GAME INSTRUCTIONS) */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/60 backdrop-blur-xl border border-sky-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-wide">
                  GAME INSTRUCTIONS & RULES
                </h2>
                <p className="text-xs text-slate-400">
                  Read the instructions carefully before starting to score your best!
                </p>
              </div>
            </div>

            <button
              onClick={() => setGuideExpanded(!guideExpanded)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition flex items-center gap-1 text-xs font-semibold cursor-pointer"
            >
              <span>{guideExpanded ? 'Collapse' : 'Show Details'}</span>
              {guideExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {guideExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1 text-left text-xs sm:text-sm text-slate-300">
              {/* Box 1: Bố cục & Lựa chọn tự do */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
                  <Play className="w-4 h-4" />
                  <span>4 Independent Parts</span>
                </div>
                <p className="text-slate-400 leading-relaxed text-xs">
                  The quest includes 4 parts: <strong>Multiple Choice (15 Qs)</strong>, <strong>Speaking (5 Qs)</strong>, <strong>Reading (5 Qs)</strong>, <strong>Writing (5 Qs)</strong>.
                </p>
                <div className="p-2 rounded bg-sky-500/10 text-sky-300 text-[11px] font-medium">
                  🎯 <strong>Free Choice:</strong> Click [START] on whichever part you want to practice first. No sequential order required!
                </div>
              </div>

              {/* Box 2: Thời gian & Điểm số */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>Time & Scoring</span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">⏱️</span>
                    <span>Multiple Choice: <strong>10 minutes</strong> (15 questions).</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-amber-400 font-bold">⏱️</span>
                    <span>Other parts: <strong>5 minutes each</strong> (5 questions).</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <span className="text-emerald-400 font-bold">⭐</span>
                    <span>Each correct answer: <strong>+10 points</strong>. No penalties for wrong answers.</span>
                  </li>
                </ul>
              </div>

              {/* Box 3: Ma trận đề thi & Hỗ trợ */}
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Flame className="w-4 h-4" />
                  <span>Matrix & Lifelines</span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[11px] bg-slate-900 px-2 py-1 rounded">
                    <span className="text-slate-400">Standard Difficulty:</span>
                    <span className="text-amber-300 font-bold">70% Recog • 15% Comp • 15% Apply</span>
                  </div>
                  <p className="text-slate-400 text-xs">
                    💡 <strong>3 HINT Lifelines:</strong> 50:50 elimination and grammar clues.
                  </p>
                  <p className="text-slate-400 text-xs">
                    📜 <strong>Certificate:</strong> Score 70%+ to unlock your Certificate of Achievement.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 2. CHỌN PHẦN BẠN MUỐN CHƠI */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-100 tracking-wide flex items-center gap-2">
                <span>CHOOSE A PART TO PLAY</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30">
                  PLAY ANY PART FIRST
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Click [START PART] on whichever part you want to practice first. No fixed order required!
              </p>
            </div>

            {hasSavedProgress && (
              <button
                onClick={onResumeGame}
                className="px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4 text-emerald-400" />
                <span>RESUME SAVED PROGRESS</span>
              </button>
            )}
          </div>

          {/* 4 SECTION CARDS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {partKeys.map((partId) => {
              const cfg = PART_CONFIGS[partId];
              const completedInfo = completedPartScores[partId];

              // Card styling by part
              const colorTheme = {
                part1: {
                  border: 'hover:border-sky-400/70 border-slate-800',
                  accentBg: 'bg-sky-500/10 text-sky-300 border-sky-400/30',
                  buttonGradient: 'from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500',
                  headerGlow: 'text-sky-400',
                },
                part2: {
                  border: 'hover:border-emerald-400/70 border-slate-800',
                  accentBg: 'bg-emerald-500/10 text-emerald-300 border-emerald-400/30',
                  buttonGradient: 'from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500',
                  headerGlow: 'text-emerald-400',
                },
                part3: {
                  border: 'hover:border-amber-400/70 border-slate-800',
                  accentBg: 'bg-amber-500/10 text-amber-300 border-amber-400/30',
                  buttonGradient: 'from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500',
                  headerGlow: 'text-amber-400',
                },
                part4: {
                  border: 'hover:border-indigo-400/70 border-slate-800',
                  accentBg: 'bg-indigo-500/10 text-indigo-300 border-indigo-400/30',
                  buttonGradient: 'from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500',
                  headerGlow: 'text-indigo-400',
                },
              }[partId];

              return (
                <div
                  key={partId}
                  className={`bg-slate-900/80 backdrop-blur-xl border ${colorTheme.border} rounded-2xl p-5 sm:p-6 transition-all duration-200 hover:shadow-2xl hover:shadow-sky-950/30 flex flex-col justify-between text-left relative group`}
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 shadow-inner">
                          {getPartIcon(partId)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className={`text-base sm:text-lg font-black tracking-wide ${colorTheme.headerGlow}`}>
                              {cfg.title}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400 font-medium">
                            {cfg.englishTitle}
                          </p>
                        </div>
                      </div>

                      {/* Completed badge if already finished */}
                      {completedInfo ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold shrink-0">
                          <Check className="w-3.5 h-3.5" />
                          <span>{completedInfo.score}/{completedInfo.maxScore} pts</span>
                        </span>
                      ) : (
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold border ${colorTheme.accentBg} shrink-0`}>
                          Max {cfg.maxScore} pts
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-4">
                      {cfg.description}
                    </p>

                    {/* Metadata tags */}
                    <div className="grid grid-cols-2 gap-2 mb-5">
                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-sky-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">QUESTIONS</div>
                          <div className="text-xs sm:text-sm font-black text-slate-100">{cfg.questionCount} questions</div>
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase font-semibold">TIME LIMIT</div>
                          <div className="text-xs sm:text-sm font-black text-slate-100">{cfg.timeLimitMinutes} mins</div>
                        </div>
                      </div>
                    </div>

                    {/* Level matrix info pill */}
                    <div className="p-2 rounded-xl bg-slate-950/50 border border-slate-800/60 text-[11px] text-slate-400 mb-5 flex items-center justify-between">
                      <span className="font-semibold text-slate-300">Knowledge Matrix:</span>
                      <span className="text-slate-300 font-mono font-medium">
                        {cfg.levelBreakdown.nhanBiet} Recog • {cfg.levelBreakdown.thongHieu} Comp • {cfg.levelBreakdown.vanDung} Apply
                      </span>
                    </div>
                  </div>

                  {/* Play Action Button */}
                  <button
                    onClick={() => handlePlayPart(partId)}
                    className={`w-full py-3.5 px-4 rounded-xl bg-gradient-to-r ${colorTheme.buttonGradient} text-slate-950 font-black text-sm tracking-wider shadow-lg transition transform hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 cursor-pointer`}
                  >
                    <Play className="w-4 h-4 fill-slate-950" />
                    <span>{completedInfo ? `RETRY ${cfg.title}` : `START ${cfg.title}`}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Master Full Quest Button: CHINH PHỤC CẢ 4 PHẦN */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900/90 to-indigo-950/40 border border-purple-500/30 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2 text-purple-300 font-black text-base">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <span>COMPLETE QUEST: ALL 4 PARTS (30 QUESTIONS)</span>
              </div>
              <p className="text-xs text-slate-400">
                Complete all 30 questions across 4 parts in 25 minutes (Max 300 pts) for full achievement certification.
              </p>
            </div>

            <button
              onClick={() => handlePlayPart('all')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-slate-950 font-black text-sm whitespace-nowrap shadow-lg shadow-purple-500/25 transition active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>PLAY ALL 4 PARTS</span>
            </button>
          </div>

          {/* Optional Mistakes Practice Shortcut if mistakes exist */}
          {mistakesCount > 0 && onOpenPracticeMistakes && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2 text-amber-300 text-xs sm:text-sm font-bold">
                <RefreshCw className="w-4 h-4 text-amber-400" />
                <span>You have {mistakesCount} mistake(s) from previous games.</span>
              </div>
              <button
                onClick={onOpenPracticeMistakes}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer"
              >
                PRACTICE MISTAKES
              </button>
            </div>
          )}
        </div>

        {/* Reset / Clear Data */}
        <div className="pt-2 text-center">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="text-xs text-slate-500 hover:text-slate-300 underline transition cursor-pointer"
          >
            Reset all data and start over
          </button>
        </div>
      </div>

      {/* Guide Detail Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-lg">
                <BookOpen className="w-5 h-5" />
                <span>LEISURE QUEST DETAILED GUIDE</span>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-300 text-left leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-400/20 space-y-1">
                <h4 className="font-bold text-sky-300 text-sm">1. Four Independent Parts:</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300 text-xs pl-1">
                  <li><strong>Part 1: Multiple Choice</strong> (15 questions - 10 mins): Vocabulary, prepositions, and verbs followed by V-ing.</li>
                  <li><strong>Part 2: Speaking</strong> (5 questions - 5 mins): Conversational exchanges, asking/answering about hobbies, invitations, and polite refusal.</li>
                  <li><strong>Part 3: Reading</strong> (5 questions - 5 mins): Reading comprehension for notices, emails, posters, and short passages.</li>
                  <li><strong>Part 4: Writing</strong> (5 questions - 5 mins): Word arrangement, drag-and-drop unscramble, and sentence rewriting.</li>
                </ul>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-emerald-300 text-sm">2. Scoring System:</h4>
                <p className="text-xs text-slate-300">
                  Each correct answer earns <strong>+10 points</strong>. No penalties for incorrect answers.
                  Part 1 is worth up to 150 points; other parts are 50 points each.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-amber-300 text-sm">3. Pedagogical Standard Matrix:</h4>
                <p className="text-xs text-slate-300">
                  Adheres strictly to the standard ratio: <strong>70% Recognition</strong>, <strong>15% Comprehension</strong>, <strong>15% Application</strong>, aligned with English 8 Global Success Unit 1.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-purple-300 text-sm">4. Lifelines & Mistakes Practice:</h4>
                <p className="text-xs text-slate-300">
                  You have <strong>3 HINT lifelines</strong> per part to eliminate options or see grammar tips. You can also re-try any incorrect questions in the Practice Room.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <h4 className="font-bold text-yellow-300 text-sm">5. Certificate of Achievement:</h4>
                <p className="text-xs text-slate-300">
                  Score <strong>70% or higher</strong> to earn your official Certificate of Completion featuring your name, class, school, and teacher's signature!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm transition cursor-pointer"
            >
              GOT IT, READY TO PLAY!
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
            <h3 className="text-lg font-bold text-slate-100">Reset All Data?</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              This will clear student info, completed test scores, and mistake history on this browser.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer"
              >
                CANCEL
              </button>
              <button
                onClick={() => {
                  onResetData();
                  setShowResetConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition cursor-pointer"
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
