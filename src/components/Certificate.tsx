import React, { useRef } from 'react';
import { StudentProfile } from '../types';
import { Award, Printer, Download, Share2, Check } from 'lucide-react';
import { sound } from '../utils/audio';

interface CertificateProps {
  profile: StudentProfile;
  score: number;
  totalScore: number;
  percentage: number;
  dateStr: string;
}

export const Certificate: React.FC<CertificateProps> = ({
  profile,
  score,
  totalScore,
  percentage,
  dateStr,
}) => {
  const certRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  const handleDownload = () => {
    sound.playClick();
    // Build an exportable printable HTML blob
    const certHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Certificate - ${profile.name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;800;900&family=Montserrat:wght@400;600;700&display=swap');
          body { margin: 0; padding: 20px; font-family: 'Montserrat', sans-serif; background: #0f172a; color: #1e293b; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .cert-container { width: 900px; padding: 50px; background: #ffffff; border: 12px solid #0284c7; outline: 3px dashed #f59e0b; outline-offset: -18px; border-radius: 20px; text-align: center; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); }
          .title { font-family: 'Cinzel', serif; font-size: 34px; font-weight: 900; color: #0369a1; letter-spacing: 2px; margin-bottom: 8px; }
          .subtitle { font-size: 15px; color: #64748b; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .presented { margin-top: 30px; font-size: 16px; color: #475569; font-style: italic; }
          .name { font-family: 'Cinzel', serif; font-size: 38px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #38bdf8; display: inline-block; padding: 0 40px 8px; margin: 15px 0; }
          .reason { font-size: 16px; color: #334155; margin: 15px 0; }
          .quest { font-weight: 800; color: #0284c7; font-size: 20px; }
          .details { margin: 30px 0; display: flex; justify-content: space-around; background: #f0f9ff; padding: 15px; border-radius: 12px; font-size: 15px; }
          .signature-area { margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; padding: 0 50px; }
          .seal { width: 90px; height: 90px; border-radius: 50%; background: #fef3c7; border: 3px solid #d97706; display: flex; align-items: center; justify-content: center; font-size: 36px; margin: 0 auto 10px; }
          .teacher { font-weight: 800; font-size: 18px; color: #0f172a; }
          .teacher-title { font-size: 13px; color: #64748b; }
          @media print {
            body { background: white; padding: 0; }
            .cert-container { width: 100%; box-shadow: none; border-width: 8px; }
          }
        </style>
      </head>
      <body>
        <div class="cert-container">
          <div class="seal">🏆</div>
          <div class="title">CERTIFICATE OF COMPLETION</div>
          <div class="subtitle">UNIT 1: LEISURE TIME – GLOBAL SUCCESS 8</div>
          <div class="presented">This certificate is proudly presented to:</div>
          <div class="name">${profile.name}</div>
          <div class="reason">For successfully completing the challenge quest:<br><strong class="quest">LEISURE QUEST – UNIT 1 ADVENTURE</strong></div>
          <div class="details">
            <div><strong>Class:</strong> ${profile.studentClass}</div>
            <div><strong>School:</strong> ${profile.school}</div>
            <div><strong>Score:</strong> ${score}/${totalScore} (${percentage}%)</div>
            <div><strong>Date:</strong> ${dateStr}</div>
          </div>
          <div class="signature-area">
            <div>
              <div style="font-size: 14px; color: #64748b;">Smart AI Tutor System</div>
              <div style="font-weight: 700; color: #0284c7;">LEISURE QUEST 8</div>
            </div>
            <div>
              <div style="height: 35px; border-bottom: 1.5px solid #94a3b8; width: 180px; margin-bottom: 6px;"></div>
              <div class="teacher">VŨ THỊ MAI THU</div>
              <div class="teacher-title">Secondary English Teacher</div>
            </div>
          </div>
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    const blob = new Blob([certHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Certificate-${profile.name.replace(/\s+/g, '_')}-Unit1.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Certificate Graphic Card */}
      <div
        ref={certRef}
        id="certificate-print"
        className="relative bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border-8 border-sky-500/80 rounded-3xl p-6 sm:p-10 text-center shadow-2xl overflow-hidden"
      >
        {/* Decorative corner ornaments */}
        <div className="absolute top-2 left-2 w-10 h-10 border-t-2 border-l-2 border-amber-400 rounded-tl-xl pointer-events-none" />
        <div className="absolute top-2 right-2 w-10 h-10 border-t-2 border-r-2 border-amber-400 rounded-tr-xl pointer-events-none" />
        <div className="absolute bottom-2 left-2 w-10 h-10 border-b-2 border-l-2 border-amber-400 rounded-bl-xl pointer-events-none" />
        <div className="absolute bottom-2 right-2 w-10 h-10 border-b-2 border-r-2 border-amber-400 rounded-br-xl pointer-events-none" />

        {/* Rosette Medal */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 mx-auto flex items-center justify-center text-3xl sm:text-4xl shadow-lg shadow-amber-500/30 mb-4 border-2 border-white/40">
          🏆
        </div>

        {/* Certificate Title */}
        <h2 className="text-xl sm:text-3xl md:text-4xl font-black text-amber-300 tracking-wider font-['Outfit',sans-serif] uppercase drop-shadow">
          CERTIFICATE OF COMPLETION
        </h2>
        <p className="text-xs sm:text-sm text-sky-300 font-semibold tracking-widest uppercase mt-1">
          OFFICIAL EXCELLENCE RECOGNITION
        </p>

        {/* Proudly presented */}
        <p className="text-xs sm:text-sm text-slate-300 italic mt-5">
          This certificate is proudly presented to:
        </p>

        {/* Student Name */}
        <div className="my-3">
          <span className="text-2xl sm:text-4xl font-extrabold text-white tracking-wide border-b-2 border-sky-400/80 pb-1 px-6 inline-block drop-shadow-md">
            {profile.name}
          </span>
        </div>

        {/* For completing */}
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          For successfully completing:
          <br />
          <strong className="text-base sm:text-xl text-sky-400 font-bold">
            LEISURE QUEST – UNIT 1 ADVENTURE
          </strong>
        </p>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 my-6 text-xs sm:text-sm max-w-2xl mx-auto">
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Class</span>
            <strong className="text-slate-100 font-bold">{profile.studentClass}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">School</span>
            <strong className="text-slate-100 font-bold truncate block">{profile.school}</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Score</span>
            <strong className="text-amber-300 font-bold">{score}/{totalScore} ({percentage}%)</strong>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] uppercase">Date</span>
            <strong className="text-slate-100 font-bold">{dateStr}</strong>
          </div>
        </div>

        {/* Signature & Teacher info */}
        <div className="flex items-center justify-between max-w-2xl mx-auto pt-4 border-t border-slate-800/80 text-left">
          <div>
            <div className="text-[11px] text-slate-400">Smart AI Tutor • English 8</div>
            <div className="text-xs font-bold text-sky-400">LEISURE QUEST 8</div>
          </div>

          <div className="text-right">
            <div className="text-sm sm:text-base font-extrabold text-amber-300">
              VŨ THỊ MAI THU
            </div>
            <div className="text-[11px] text-slate-400">Secondary English Teacher</div>
          </div>
        </div>
      </div>

      {/* Certificate Actions Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs sm:text-sm font-semibold flex items-center gap-2 transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-sky-400" />
          <span>PRINT CERTIFICATE</span>
        </button>

        <button
          onClick={handleDownload}
          className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD CERTIFICATE</span>
        </button>
      </div>
    </div>
  );
};
