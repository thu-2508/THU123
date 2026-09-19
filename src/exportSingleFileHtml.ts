import { QUESTIONS_BANK } from './data/questions';

export function generateSingleFileHtml(): string {
  const jsonQuestions = JSON.stringify(QUESTIONS_BANK);

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>LEISURE QUEST – UNIT 1 ADVENTURE | TIẾNG ANH 8</title>
  <meta name="description" content="Web App trò chơi ôn tập Tiếng Anh 8 Unit 1: Leisure Time - Giáo viên: Vũ Thị Mai Thu">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800;900&family=Outfit:wght@600;700;800;900&display=swap" rel="stylesheet">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'Be Vietnam Pro', sans-serif; background-color: #020617; color: #f8fafc; }
    h1, h2, h3, .font-heading { font-family: 'Outfit', sans-serif; }
    @media print {
      body * { visibility: hidden; }
      #certificate-printable, #certificate-printable * { visibility: visible; }
      #certificate-printable { position: absolute; left: 0; top: 0; width: 100%; border: none !important; }
    }
  </style>
</head>
<body class="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
  <div id="app-container" class="w-full"></div>

  <script>
    // ==========================================
    // 50 CÂU HỎI TIẾNG ANH 8 - UNIT 1: LEISURE TIME
    // GIÁO VIÊN: VŨ THỊ MAI THU
    // ==========================================
    const ALL_QUESTIONS = ${jsonQuestions};

    // ==========================================
    // SOUND MANAGER (WEB AUDIO API)
    // ==========================================
    class SoundFX {
      constructor() {
        this.ctx = null;
        this.enabled = true;
      }
      init() {
        if (!this.ctx) {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          if (AudioCtx) this.ctx = new AudioCtx();
        }
        if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
      }
      playCorrect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((f, idx) => {
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.08);
          g.gain.setValueAtTime(0.001, this.ctx.currentTime + idx * 0.08);
          g.gain.exponentialRampToValueAtTime(0.2, this.ctx.currentTime + idx * 0.08 + 0.02);
          g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.35);
          osc.connect(g);
          g.connect(this.ctx.destination);
          osc.start(this.ctx.currentTime + idx * 0.08);
          osc.stop(this.ctx.currentTime + idx * 0.08 + 0.4);
        });
      }
      playIncorrect() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(329.63, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(261.63, this.ctx.currentTime + 0.25);
        g.gain.setValueAtTime(0.12, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.32);
      }
      playTick() {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(700, this.ctx.currentTime);
        g.gain.setValueAtTime(0.05, this.ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(g);
        g.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.06);
      }
    }
    const sound = new SoundFX();

    // ==========================================
    // CONFETTI EFFECT
    // ==========================================
    function launchConfetti() {
      const canvas = document.createElement('canvas');
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.pointerEvents = 'none';
      canvas.style.zIndex = '9999';
      document.body.appendChild(canvas);
      const ctx = canvas.getContext('2d');
      const w = (canvas.width = window.innerWidth);
      const h = (canvas.height = window.innerHeight);
      const colors = ['#38bdf8', '#818cf8', '#a855f7', '#facc15', '#34d399'];
      const particles = [];
      for (let i = 0; i < 70; i++) {
        particles.push({
          x: w / 2 + (Math.random() - 0.5) * (w * 0.5),
          y: h * 0.4 + (Math.random() - 0.5) * 60,
          size: Math.random() * 8 + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 1.2) * 11,
          rot: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
          alpha: 1
        });
      }
      const start = Date.now();
      function loop() {
        const elapsed = Date.now() - start;
        if (elapsed > 2500) { canvas.remove(); return; }
        ctx.clearRect(0, 0, w, h);
        particles.forEach(p => {
          p.x += p.vx; p.y += p.vy; p.vy += 0.35; p.rot += p.vRot;
          p.alpha = Math.max(0, 1 - elapsed / 2500);
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rot);
          ctx.globalAlpha = p.alpha;
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
          ctx.restore();
        });
        requestAnimationFrame(loop);
      }
      loop();
    }

    // ==========================================
    // APP STATE & STORAGE
    // ==========================================
    const PRAISES = ['Excellent!', 'Great job!', 'Well done!', "You've got it!", 'Amazing work!'];
    
    let state = {
      view: 'start', // 'start' | 'playing' | 'results' | 'practice'
      profile: { name: '', studentClass: '', school: '' },
      gameQuestions: [],
      currentIndex: 0,
      score: 0,
      hintsLeft: 3,
      answers: [],
      mistakes: [],
      timeLeft: 50,
      timerId: null,
      isAnswered: false,
      isCorrect: false,
      userAnswer: '',
      praise: '',
      hintUsedCurrent: false,
      eliminatedOpts: [],
      startTime: null,
      totalTimeSeconds: 0
    };

    // Load from localStorage
    function loadSaved() {
      try {
        const raw = localStorage.getItem('leisure_quest_state');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.profile) state.profile = parsed.profile;
        }
      } catch (e) {}
    }
    function saveState() {
      try {
        localStorage.setItem('leisure_quest_state', JSON.stringify({
          profile: state.profile
        }));
      } catch (e) {}
    }

    // Pick 25 questions: 10 Nhận biết, 10 Thông hiểu, 5 Vận dụng
    function pick25Questions() {
      const n1 = ALL_QUESTIONS.filter(q => q.level === 'Nhận biết').sort(() => 0.5 - Math.random()).slice(0, 10);
      const n2 = ALL_QUESTIONS.filter(q => q.level === 'Thông hiểu').sort(() => 0.5 - Math.random()).slice(0, 10);
      const n3 = ALL_QUESTIONS.filter(q => q.level === 'Vận dụng').sort(() => 0.5 - Math.random()).slice(0, 5);
      return [...n1, ...n2, ...n3].sort(() => 0.5 - Math.random());
    }

    // Robot SVG Generator
    function renderLumi(mood = 'thinking', speech = '') {
      return \`
        <div class="flex items-center gap-3">
          <div class="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0">
            <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow">
              <rect x="16" y="16" width="68" height="52" rx="16" fill="#1e293b" stroke="#475569" stroke-width="2.5" />
              <rect x="22" y="24" width="56" height="34" rx="10" fill="#090d16" stroke="#334155" stroke-width="1.5" />
              <line x1="50" y1="18" x2="50" y2="8" stroke="#64748b" stroke-width="3" stroke-linecap="round" />
              <circle cx="50" cy="8" r="4.5" fill="\${mood === 'warning' ? '#facc15' : mood === 'correct' ? '#34d399' : '#38bdf8'}" />
              <circle cx="34" cy="35" r="4.5" fill="#38bdf8" />
              <circle cx="66" cy="35" r="4.5" fill="#38bdf8" />
              <circle cx="35" cy="33.5" r="1.5" fill="#fff" />
              <circle cx="67" cy="33.5" r="1.5" fill="#fff" />
              <path d="M44 47 Q50 51 56 47" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" fill="none" />
              <path d="M26 74 Q50 78 74 74 L80 90 Q50 94 20 90 Z" fill="#6366f1" opacity="0.85" />
            </svg>
            <div class="text-[10px] text-center font-bold text-sky-400">LUMI</div>
          </div>
          \${speech ? \`
            <div class="bg-slate-900 border border-sky-500/30 rounded-2xl px-4 py-2.5 max-w-sm sm:max-w-md shadow-lg">
              <p class="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">\${speech}</p>
            </div>
          \` : ''}
        </div>
      \`;
    }

    // ==========================================
    // RENDER FUNCTIONS
    // ==========================================
    function render() {
      const root = document.getElementById('app-container');
      if (!root) return;

      if (state.view === 'start') {
        root.innerHTML = renderStartView();
      } else if (state.view === 'playing') {
        root.innerHTML = renderPlayingView();
      } else if (state.view === 'results') {
        root.innerHTML = renderResultsView();
      } else if (state.view === 'practice') {
        root.innerHTML = renderPracticeView();
      }
    }

    function renderStartView() {
      return \`
        <div class="min-h-screen flex flex-col items-center justify-center p-4">
          <div class="max-w-xl w-full text-center space-y-6">
            <div>
              <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-2">
                🌟 SMART AI TUTOR • ENGLISH 8
              </div>
              <h1 class="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-indigo-300 tracking-tight">
                LEISURE QUEST
              </h1>
              <p class="text-sm sm:text-base font-semibold text-slate-300 uppercase tracking-wider mt-1">
                UNIT 1 ADVENTURE – LEISURE TIME
              </p>
              <div class="text-xs text-amber-300 font-medium mt-1">
                Curated by Teacher: <strong>VŨ THỊ MAI THU</strong>
              </div>
            </div>

            <div class="flex justify-center">
              \${renderLumi('greeting', 'Hello! I am Lumi 🤖. Enter your student info to begin the Unit 1 quest!')}
            </div>

            <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-left space-y-4">
              <div>
                <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                  Student Full Name <span class="text-rose-400">*</span>
                </label>
                <input id="input-name" type="text" value="\${state.profile.name}" placeholder="e.g. Alex Johnson" class="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400">
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Class <span class="text-rose-400">*</span>
                  </label>
                  <input id="input-class" type="text" value="\${state.profile.studentClass}" placeholder="e.g. 8A1" class="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400">
                </div>
                <div>
                  <label class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    School <span class="text-rose-400">*</span>
                  </label>
                  <input id="input-school" type="text" value="\${state.profile.school}" placeholder="e.g. Greenfield Secondary School" class="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400">
                </div>
              </div>

              <div id="start-error" class="hidden p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-medium">
                Please enter your full name, class, and school before starting!
              </div>

              <button onclick="startGame()" class="w-full py-4 rounded-xl bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-500 hover:from-sky-400 text-slate-950 font-black text-base tracking-wider shadow-lg shadow-sky-500/30 transition cursor-pointer">
                START QUEST
              </button>
            </div>
          </div>
        </div>
      \`;
    }

    function renderPlayingView() {
      const q = state.gameQuestions[state.currentIndex];
      if (!q) return '';

      const progress = Math.round(((state.currentIndex + 1) / state.gameQuestions.length) * 100);
      let lumiSpeech = \`Stage \${q.stage}: \${q.category}. Read carefully and do your best!\`;
      if (state.isAnswered) {
        lumiSpeech = state.isCorrect ? \`\${state.praise} Great job!\` : "Not quite right. Let's review the explanation below!";
      } else if (state.timeLeft <= 10) {
        lumiSpeech = \`Hurry up! Only \${state.timeLeft} seconds left!\`;
      }

      return \`
        <div class="max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
          <div class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl">
            <div class="flex justify-between items-center mb-3">
              <span class="px-3 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 text-xs sm:text-sm font-bold">
                Stage \${q.stage}: \${q.stageName}
              </span>
              <div class="flex gap-4">
                <span class="text-xs text-slate-400">Score: <strong class="text-amber-400 text-base">\${state.score}</strong></span>
                <span class="text-xs text-slate-400">Question: <strong class="text-sky-300 text-base">\${state.currentIndex + 1}/\${state.gameQuestions.length}</strong></span>
              </div>
            </div>
            <div class="w-full h-2 bg-slate-800 rounded-full overflow-hidden mb-3">
              <div class="h-full bg-gradient-to-r from-sky-500 to-indigo-500" style="width:\${progress}%"></div>
            </div>
            <div class="flex items-center justify-between text-xs">
              <span class="\${state.timeLeft <= 10 ? 'text-amber-400 font-bold animate-pulse' : 'text-slate-400'}">
                ⏱️ Time: \${state.timeLeft}s
              </span>
              <button onclick="useHint()" \${state.hintsLeft <= 0 || state.hintUsedCurrent || state.isAnswered ? 'disabled class="opacity-40 text-slate-500"' : 'class="text-amber-400 hover:underline cursor-pointer"'}>
                💡 HINT (\${state.hintsLeft})
              </button>
            </div>
          </div>

          <div class="flex justify-center sm:justify-start">
            \${renderLumi(state.isCorrect ? 'correct' : state.timeLeft <= 10 ? 'warning' : 'thinking', lumiSpeech)}
          </div>

          <div class="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-5 text-left">
            <h2 class="text-lg sm:text-xl font-bold text-slate-100 whitespace-pre-line">\${q.question}</h2>

            \${q.options ? \`
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                \${q.options.map((opt, i) => {
                  let cls = "p-4 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-left text-sm font-semibold cursor-pointer";
                  if (state.eliminatedOpts.includes(opt)) {
                    cls = "p-4 rounded-xl border border-slate-800 bg-slate-950 opacity-30 line-through cursor-not-allowed";
                  } else if (state.isAnswered) {
                    if (opt === q.answer) cls = "p-4 rounded-xl border border-emerald-500 bg-emerald-950/40 text-emerald-200 font-bold";
                    else if (state.userAnswer === opt) cls = "p-4 rounded-xl border border-rose-500 bg-rose-950/40 text-rose-200";
                  } else if (state.userAnswer === opt) {
                    cls = "p-4 rounded-xl border border-sky-400 bg-sky-950/40 text-sky-200 ring-2 ring-sky-400";
                  }
                  return \`<button onclick="selectOption('\${opt.replace(/'/g, "\\\\'")}')" \${state.isAnswered || state.eliminatedOpts.includes(opt) ? 'disabled' : ''} class="\${cls}">\${String.fromCharCode(65+i)}. \${opt}</button>\`;
                }).join('')}
              </div>
            \` : \`
              <div class="pt-2">
                <input id="blank-input" type="text" \${state.isAnswered ? 'disabled' : ''} value="\${state.userAnswer}" placeholder="Type your answer here..." class="w-full p-4 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 focus:outline-none focus:border-sky-400 text-base">
              </div>
            \`}

            <div class="pt-4 border-t border-slate-800 flex justify-between items-center">
              <span class="text-xs text-slate-400">* Complete your answer and click Submit</span>
              \${!state.isAnswered ? \`
                <button onclick="submitAnswer()" class="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm tracking-wide cursor-pointer">
                  SUBMIT
                </button>
              \` : \`
                <button onclick="nextQuestion()" class="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm tracking-wide cursor-pointer">
                  NEXT QUESTION ➔
                </button>
              \`}
            </div>

            \${state.isAnswered ? \`
              <div class="p-4 rounded-xl \${state.isCorrect ? 'bg-emerald-950/40 border border-emerald-500 text-emerald-200' : 'bg-rose-950/40 border border-rose-500 text-rose-200'} text-sm space-y-2">
                <div class="font-bold">\${state.isCorrect ? '✅ ' + state.praise + ' Correct!' : '❌ Not quite right. Please review below!'}</div>
                <div><strong>Correct Answer:</strong> <span class="text-amber-300 font-bold">\${q.answer}</span></div>
                <div class="text-slate-300"><strong>Detailed Explanation:</strong> \${q.explanation}</div>
                \${q.grammarFormula ? \`<div class="text-xs text-indigo-300"><strong>Grammar Rule:</strong> <code>\${q.grammarFormula}</code></div>\` : ''}
                \${q.example ? \`<div class="text-xs text-amber-200"><strong>Example:</strong> <em>\${q.example}</em></div>\` : ''}
              </div>
            \` : ''}
          </div>
        </div>
      \`;
    }

    function renderResultsView() {
      const correct = state.answers.filter(a => a.isCorrect).length;
      const total = state.answers.length || 1;
      const pct = Math.round((correct / total) * 100);
      const isPass = pct >= 70;

      return \`
        <div class="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
          <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-center space-y-4">
            <h1 class="text-2xl sm:text-4xl font-black text-amber-300 font-heading">
              \${pct >= 90 ? 'EXCELLENT – You have mastered Unit 1!' : pct >= 70 ? 'WELL DONE – Congratulations!' : 'NEED MORE PRACTICE – Keep reviewing the mistakes!'}
            </h1>
            <p class="text-sm text-slate-300">
              Student: <strong class="text-white">\${state.profile.name}</strong> • Class: <strong class="text-sky-300">\${state.profile.studentClass}</strong> • School: <strong class="text-teal-300">\${state.profile.school}</strong>
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div class="bg-slate-950 p-3 rounded-xl">
                <span class="text-xs text-slate-400 block">Score</span>
                <strong class="text-2xl text-amber-400 font-black">\${state.score} pts</strong>
              </div>
              <div class="bg-slate-950 p-3 rounded-xl">
                <span class="text-xs text-slate-400 block">Accuracy</span>
                <strong class="text-2xl text-emerald-400 font-black">\${pct}%</strong>
              </div>
              <div class="bg-slate-950 p-3 rounded-xl">
                <span class="text-xs text-slate-400 block">Correct / Wrong</span>
                <strong class="text-2xl text-sky-400 font-black">\${correct} / \${total - correct}</strong>
              </div>
              <div class="bg-slate-950 p-3 rounded-xl">
                <span class="text-xs text-slate-400 block">Hints Used</span>
                <strong class="text-2xl text-indigo-400 font-black">\${3 - state.hintsLeft}</strong>
              </div>
            </div>
          </div>

          \${isPass ? \`
            <div id="certificate-printable" class="bg-slate-950 border-8 border-sky-500 rounded-3xl p-8 text-center space-y-4 shadow-2xl">
              <div class="text-5xl">🏆</div>
              <h2 class="text-2xl sm:text-3xl font-black text-amber-300 font-heading">CERTIFICATE OF COMPLETION</h2>
              <div class="text-xs text-sky-400 font-bold uppercase tracking-widest">OFFICIAL CERTIFICATE OF ACHIEVEMENT</div>
              <p class="text-sm text-slate-400 italic">This certificate is proudly presented to:</p>
              <div class="text-2xl sm:text-4xl font-black text-white border-b-2 border-sky-400 pb-1 px-4 inline-block">\${state.profile.name}</div>
              <p class="text-sm text-slate-300">For successfully completing: <strong class="text-sky-400">LEISURE QUEST – UNIT 1 ADVENTURE</strong></p>
              <div class="flex justify-around bg-slate-900 p-3 rounded-xl text-xs sm:text-sm max-w-lg mx-auto">
                <div>Class: <strong>\${state.profile.studentClass}</strong></div>
                <div>Score: <strong>\${state.score}/250 (\${pct}%)</strong></div>
                <div>Date: <strong>\${new Date().toLocaleDateString('en-US')}</strong></div>
              </div>
              <div class="pt-4 border-t border-slate-800 flex justify-between text-xs max-w-lg mx-auto text-left">
                <div>Wise English Tutor 8</div>
                <div class="text-right"><strong class="text-amber-300 block text-sm">VU THI MAI THU</strong>Secondary English Teacher</div>
              </div>
            </div>
          \` : ''}

          <div class="flex flex-wrap justify-center gap-3">
            <button onclick="restartGame()" class="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-sm cursor-pointer">
              PLAY AGAIN (25 QUESTIONS)
            </button>
            \${state.mistakes.length > 0 ? \`
              <button onclick="openPractice()" class="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm cursor-pointer">
                PRACTICE MISTAKES (\${state.mistakes.length})
              </button>
            \` : ''}
            <button onclick="window.print()" class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-bold cursor-pointer">
              PRINT CERTIFICATE
            </button>
          </div>
        </div>
      \`;
    }

    function renderPracticeView() {
      return \`
        <div class="max-w-4xl mx-auto p-4 sm:p-6 space-y-4 text-left">
          <div class="flex justify-between items-center bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <h1 class="text-xl font-black text-amber-400">PRACTICE MISTAKES (\${state.mistakes.length} questions)</h1>
            <button onclick="state.view = 'results'; render();" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer">
              BACK TO RESULTS
            </button>
          </div>
          \${state.mistakes.map((m, i) => \`
            <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-2">
              <div class="text-xs text-sky-400 font-bold">Question \${i+1} - Stage \${m.question.stage}: \${m.question.category}</div>
              <div class="text-base font-semibold text-slate-100">\${m.question.question}</div>
              <div class="text-xs text-rose-300 bg-rose-950/40 p-2 rounded-lg">Your answer: <strong>\${m.userAnswer || 'No answer'}</strong></div>
              <div class="text-xs text-emerald-300 bg-emerald-950/40 p-2 rounded-lg">Correct answer: <strong>\${m.question.answer}</strong></div>
              <div class="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <strong>Explanation:</strong> \${m.question.explanation}
              </div>
            </div>
          \`).join('')}
        </div>
      \`;
    }

    // ==========================================
    // ACTION HANDLERS
    // ==========================================
    function startGame() {
      const nameEl = document.getElementById('input-name');
      const classEl = document.getElementById('input-class');
      const schoolEl = document.getElementById('input-school');
      const errEl = document.getElementById('start-error');

      if (!nameEl || !nameEl.value.trim() || !classEl || !classEl.value.trim() || !schoolEl || !schoolEl.value.trim()) {
        if (errEl) errEl.classList.remove('hidden');
        sound.playIncorrect();
        return;
      }

      state.profile = {
        name: nameEl.value.trim(),
        studentClass: classEl.value.trim(),
        school: schoolEl.value.trim()
      };
      saveState();

      state.gameQuestions = pick25Questions();
      state.currentIndex = 0;
      state.score = 0;
      state.hintsLeft = 3;
      state.answers = [];
      state.mistakes = [];
      state.startTime = Date.now();
      state.view = 'playing';

      loadCurrentQuestion();
    }

    function loadCurrentQuestion() {
      clearInterval(state.timerId);
      state.timeLeft = 50;
      state.isAnswered = false;
      state.isCorrect = false;
      state.userAnswer = '';
      state.hintUsedCurrent = false;
      state.eliminatedOpts = [];

      render();

      state.timerId = setInterval(() => {
        state.timeLeft--;
        if (state.timeLeft === 10) sound.playTick();
        if (state.timeLeft <= 0) {
          clearInterval(state.timerId);
          timeOutAnswer();
        } else {
          // Quick DOM timer update
          render();
        }
      }, 1000);
    }

    function selectOption(opt) {
      if (state.isAnswered) return;
      state.userAnswer = opt;
      render();
    }

    function useHint() {
      if (state.hintsLeft <= 0 || state.hintUsedCurrent || state.isAnswered) return;
      state.hintsLeft--;
      state.hintUsedCurrent = true;
      const q = state.gameQuestions[state.currentIndex];
      if (q.options) {
        const wrong = q.options.filter(o => o !== q.answer);
        state.eliminatedOpts = wrong.slice(0, 2);
      }
      render();
    }

    function submitAnswer() {
      if (state.isAnswered) return;
      clearInterval(state.timerId);

      const q = state.gameQuestions[state.currentIndex];
      if (!q.options) {
        const inp = document.getElementById('blank-input');
        if (inp) state.userAnswer = inp.value.trim();
      }

      if (!state.userAnswer) return;

      const norm = s => s.toLowerCase().replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
      const isRight = norm(state.userAnswer) === norm(q.answer) || (q.acceptableAnswers || []).some(a => norm(a) === norm(state.userAnswer));

      state.isAnswered = true;
      state.isCorrect = isRight;

      if (isRight) {
        state.score += 10;
        sound.playCorrect();
        launchConfetti();
        state.praise = PRAISES[Math.floor(Math.random() * PRAISES.length)];
      } else {
        sound.playIncorrect();
        state.mistakes.push({ question: q, userAnswer: state.userAnswer });
      }

      state.answers.push({ questionId: q.id, isCorrect: isRight, userAnswer: state.userAnswer });
      render();
    }

    function timeOutAnswer() {
      const q = state.gameQuestions[state.currentIndex];
      state.isAnswered = true;
      state.isCorrect = false;
      state.userAnswer = "Time's up";
      sound.playIncorrect();
      state.mistakes.push({ question: q, userAnswer: "Time's up" });
      state.answers.push({ questionId: q.id, isCorrect: false, userAnswer: "Time's up" });
      render();
    }

    function nextQuestion() {
      if (state.currentIndex < state.gameQuestions.length - 1) {
        state.currentIndex++;
        loadCurrentQuestion();
      } else {
        state.totalTimeSeconds = Math.round((Date.now() - state.startTime) / 1000);
        state.view = 'results';
        render();
      }
    }

    function restartGame() {
      startGame();
    }

    function openPractice() {
      state.view = 'practice';
      render();
    }

    // Initialize on window load
    window.onload = function() {
      loadSaved();
      render();
    };
  </script>
</body>
</html>`;
}
