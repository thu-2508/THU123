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
    tierTitle = 'XUẤT SẮC – Em đã nắm vững kiến thức Unit 1!';
    tierColor = 'from-amber-400 to-yellow-200 text-amber-300';
    lumiSummarySpeech = `Thật tuyệt vời ${profile.name}! Em đạt kết quả xuất sắc ${percentage}%. Toàn bộ kiến thức Unit 1: Leisure Time đã được em vận dụng rất thành thạo!`;
  } else if (percentage >= 70) {
    tierTitle = 'HOÀN THÀNH TỐT – Em hãy luyện thêm các câu đã làm sai nhé!';
    tierColor = 'from-emerald-400 to-teal-300 text-emerald-300';
    lumiSummarySpeech = `Chúc mừng ${profile.name}! Em đã hoàn thành tốt hành trình với ${percentage}%. Hãy vào "Phòng luyện lại" để khắc phục nốt các lỗi nhỏ nhé!`;
  } else if (percentage >= 50) {
    tierTitle = 'CẦN CỐ GẮNG – Em nên ôn lại từ vựng và cấu trúc chỉ sở thích.';
    tierColor = 'from-sky-400 to-indigo-300 text-sky-300';
    lumiSummarySpeech = `Em đã rất nỗ lực! Hãy chú ý ôn tập thêm phần ${weakestCat} và cấu trúc like/enjoy/prefer để bứt phá điểm số cao hơn nhé!`;
  } else {
    tierTitle = 'HÃY THỬ LẠI – Mỗi lần luyện tập là một bước tiến!';
    tierColor = 'from-rose-400 to-pink-300 text-rose-300';
    lumiSummarySpeech = `Đừng nản lòng nhé! Hãy xem lại phần giải thích chi tiết trong "Phòng luyện lại" và chơi lại một lượt nữa cùng Lumi!`;
  }

  // Generate parent notification text
  const parentNoticeText = `Học sinh ${profile.name} – lớp ${profile.studentClass} (Trường ${profile.school}) đã hoàn thành bài ôn tập Unit 1: Leisure Time với kết quả ${correctCount}/${totalCount} câu đúng (${totalScore}/${maxScore} điểm), đạt ${percentage}%. Nội dung cần luyện thêm: ${
    weakestCat ? weakestCat : 'Không có'
  }.`;

  const handleCopyParentReport = () => {
    sound.playClick();
    navigator.clipboard.writeText(parentNoticeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const minutes = Math.floor(totalTimeSeconds / 60);
  const seconds = totalTimeSeconds % 60;
  const timeFormatted = `${minutes} phút ${seconds} giây`;
  const currentDate = new Date().toLocaleDateString('vi-VN');

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center shadow-2xl space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold">
          <span>KẾT QUẢ HÀNH TRÌNH LEISURE QUEST</span>
        </div>

        <h1 className={`text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r ${tierColor} bg-clip-text text-transparent font-['Outfit',sans-serif]`}>
          {tierTitle}
        </h1>

        <p className="text-sm text-slate-300 max-w-xl mx-auto">
          Học sinh: <strong className="text-white">{profile.name}</strong> • Lớp:{' '}
          <strong className="text-sky-300">{profile.studentClass}</strong> • Trường:{' '}
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
          <span className="text-xs text-slate-400 block mb-1">Tổng điểm đạt được</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400">
            {totalScore}
            <span className="text-sm text-slate-500 font-normal"> / {maxScore}</span>
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Tỉ lệ chính xác</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400">
            {percentage}%
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Số câu Đúng / Sai</span>
          <div className="flex items-center justify-center gap-2 text-xl sm:text-2xl font-black">
            <span className="text-emerald-400">{correctCount}</span>
            <span className="text-slate-600">/</span>
            <span className="text-rose-400">{incorrectCount}</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 text-center">
          <span className="text-xs text-slate-400 block mb-1">Thời gian hoàn thành</span>
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
            Phân tích năng lực theo nhóm kiến thức Unit 1
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
                    {stats.correct}/{stats.total} câu ({rate}%)
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
          <strong className="text-amber-300 block font-bold">💡 Lời khuyên cá nhân hóa:</strong>
          {weakestCat === 'Prepositions' && (
            <p>Em nên ôn lại các giới từ đi kèm tính từ chỉ sở thích: <em>keen on, fond of, crazy about, interested in, be into</em>.</p>
          )}
          {weakestCat === 'Verb forms' && (
            <p>Ghi nhớ: Sau <em>fancy, adore, enjoy, dislike, detest, don't mind</em> luôn dùng động từ ở dạng <strong>V-ing</strong>.</p>
          )}
          {weakestCat === 'Sentence building' && (
            <p>Ôn lại cấu trúc so sánh sở thích: <em>prefer V-ing to V-ing</em> và <em>spend time + V-ing</em>.</p>
          )}
          {weakestCat === 'Vocabulary' && (
            <p>Em hãy ghi nhớ các từ vựng về hoạt động giải trí như <em>origami, DIY, board games, puzzles</em>.</p>
          )}
          {weakestCat === 'Communication' && (
            <p>Luyện tập cách nhận lời mời <em>"I'd love to!"</em> và từ chối lịch sự <em>"I'd love to, but..."</em>.</p>
          )}
          {weakestCat === 'Reading and writing' && (
            <p>Rèn luyện kỹ năng đọc lướt thông báo, biển báo và phân biệt <em>every day</em> (trạng từ) và <em>everyday</em> (tính từ).</p>
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
            Tin nhắn báo cáo kết quả gửi phụ huynh
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
          * Em hoặc phụ huynh có thể dán đoạn văn bản trên vào Zalo hoặc tin nhắn để lưu kết quả bài tập.
        </p>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={onPlayAgain}
          className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 hover:from-sky-400 hover:to-indigo-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-lg shadow-sky-500/25 transition active:scale-95 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>PLAY AGAIN (25 QUESTIONS)</span>
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
