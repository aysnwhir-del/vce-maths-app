/* ═══════════════════════════════════════════════════════════════
   VCE MATHS SUPPORT APP — APPLICATION LOGIC
   Implements the functional requirements from Task 2:
   1. User Accounts & Login (localStorage-based, per Task 5/6 decision)
   2. Study Notes
   3. Practice Question Bank
   4. Performance Tracking & Exam Impact Score
   5. Mistake Bank
   6. Bound Reference Generator
   7. Step-by-Step Hints
   8. Notifications & Reminders (due-review banner)
═══════════════════════════════════════════════════════════════ */

const STORE_KEY = 'vceMathsApp_v1';

/* ── PERSISTENCE ─────────────────────────────────────────────── */
function loadStore() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { console.warn('Could not load saved data', e); }
  return { users: {}, currentUser: null };
}
function saveStore() { localStorage.setItem(STORE_KEY, JSON.stringify(DB)); }

let DB = loadStore();

function currentUserData() {
  if (!DB.currentUser) return null;
  return DB.users[DB.currentUser];
}
function freshUserData(name, email) {
  return {
    name, email,
    progress: {},        // { topicId: { correct: n, total: n } }
    mistakeBank: [],      // [{ id, qid, added, nextReview, timesWrong }]
    boundRef: [],         // [{ tag, formula, topic }]
    formulaMiss: {},      // { formulaTag: count }
    notesRead: {},         // { topicId: true }
    lastSession: null,
    streak: 0,
    lastActiveDate: null, // 'YYYY-MM-DD'
  };
}

/* ── STREAK TRACKING ─────────────────────────────────────────── 
   Counts consecutive calendar days the student has opened the app.
   A gap of a day or more resets it back to 1. */
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function updateStreak() {
  const u = currentUserData();
  if (!u) return;
  const today = todayStr();
  if (u.lastActiveDate === today) return; // already counted today
  if (u.lastActiveDate) {
    const prev = new Date(u.lastActiveDate);
    const diffDays = Math.round((new Date(today) - prev) / 86400000);
    u.streak = diffDays === 1 ? u.streak + 1 : 1;
  } else {
    u.streak = 1;
  }
  u.lastActiveDate = today;
  saveStore();
}

/* ── APP STATE (in-memory, per session) ─────────────────────── */
const S = {
  screen: 'auth',
  authMode: 'login',
  quiz: { pool: [], idx: -1, current: null, currentEntryId: null, answered: false, score: {c:0,t:0}, hintsShown: 0, mode: 'practice', topic: null, diff: 'medium', streakCorrect: 0, streakWrong: 0, difficultyChanged: null, triedWrong: [] },
  activeNote: null,
  homeFilter: 'all',
  notesFilter: 'all',
  notesSearch: '',
  practiceFilter: 'all',
};

/* ── EXAM IMPACT SCORE ───────────────────────────────────────── */
function accuracyFor(topicId) {
  const p = currentUserData().progress[topicId];
  if (!p || p.total === 0) return null; // unpracticed
  return p.correct / p.total;
}
function examImpactScore(topicId) {
  const topic = TOPICS.find(t => t.id === topicId);
  const acc = accuracyFor(topicId);
  const weakness = acc === null ? 0.85 : (1 - acc); // unpracticed topics treated as moderately weak, not zero
  const raw = weakness * topic.examFreq * 2; // scale to roughly 0–10
  return Math.min(10, Math.round(raw * 10) / 10);
}
function priorityLevel(score) {
  if (score >= 6.5) return 'high';
  if (score >= 3.5) return 'med';
  return 'low';
}
function rankedTopics() {
  return TOPICS.map(t => ({ ...t, eis: examImpactScore(t.id), acc: accuracyFor(t.id) }))
               .sort((a,b) => b.eis - a.eis);
}
function overallEIS() {
  const ranked = rankedTopics();
  const avg = ranked.reduce((s,t) => s + t.eis, 0) / ranked.length;
  return Math.round((avg/10)*100); // display as a %
}

/* ── MISTAKE BANK ────────────────────────────────────────────── 
   Each wrong answer creates its own entry storing a full snapshot
   of that question (not just an id) — necessary because practice
   questions are now procedurally generated and unique each time,
   so there's no static question bank to "look up" later. */
function addToMistakeBank(q) {
  const u = currentUserData();
  const now = Date.now();
  u.mistakeBank.push({ id: 'm_'+now+'_'+Math.random().toString(36).slice(2,7), snapshot: q, added: now, nextReview: now + 86400000, timesWrong: 1 });
}
function removeMistakeEntry(entryId) {
  const u = currentUserData();
  u.mistakeBank = u.mistakeBank.filter(m => m.id !== entryId);
}
function rescheduleMistakeEntry(entryId) {
  const u = currentUserData();
  const entry = u.mistakeBank.find(m => m.id === entryId);
  if (entry) { entry.timesWrong += 1; entry.nextReview = Date.now() + entry.timesWrong * 2 * 86400000; }
}
function dueMistakes() {
  const u = currentUserData();
  const now = Date.now();
  return u.mistakeBank.filter(m => m.nextReview <= now);
}

/* ── BOUND REFERENCE GENERATOR ───────────────────────────────── */
function trackFormulaMiss(q) {
  if (!q.formulaTag) return;
  const u = currentUserData();
  u.formulaMiss[q.formulaTag] = (u.formulaMiss[q.formulaTag] || 0) + 1;
  if (u.formulaMiss[q.formulaTag] >= 2 && !u.boundRef.find(r => r.tag === q.formulaTag)) {
    u.boundRef.push({ tag: q.formulaTag, formula: FORMULAS[q.formulaTag], topic: q.topic });
  }
}

/* ── RECORD ANSWER ───────────────────────────────────────────── */
function recordAnswer(q, isCorrect) {
  const u = currentUserData();
  if (!u.progress[q.topic]) u.progress[q.topic] = { correct: 0, total: 0 };
  u.progress[q.topic].total += 1;
  if (isCorrect) {
    u.progress[q.topic].correct += 1;
    if (S.quiz.mode === 'review' && S.quiz.currentEntryId) removeMistakeEntry(S.quiz.currentEntryId);
  } else {
    if (S.quiz.mode === 'review' && S.quiz.currentEntryId) rescheduleMistakeEntry(S.quiz.currentEntryId);
    else addToMistakeBank(q);
    trackFormulaMiss(q);
  }
  saveStore();
}

/* ── TOAST ───────────────────────────────────────────────────── */
let toastTimer;
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
}

/* ── ROUTER ──────────────────────────────────────────────────── */
function show(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-' + id).classList.add('active');
  S.screen = id;
  window.scrollTo(0,0);
  updateNav(id);
  if (id === 'home') renderHome();
  if (id === 'notes') renderNotesList();
  if (id === 'boundref') renderBoundRef();
}
function updateNav(id) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('on', n.dataset.screen === id));
}

/* ══════════════════════════════════════════════════════════════
   AUTH
══════════════════════════════════════════════════════════════ */
function setAuthMode(mode) {
  S.authMode = mode;
  document.getElementById('tab-login').classList.toggle('on', mode==='login');
  document.getElementById('tab-signup').classList.toggle('on', mode==='signup');
  document.getElementById('field-name').style.display = mode==='signup' ? 'block' : 'none';
  document.getElementById('auth-submit').textContent = mode==='login' ? 'Log In' : 'Create Account';
  hideAuthMsgs();
}
function hideAuthMsgs() {
  document.getElementById('auth-err').style.display = 'none';
  document.getElementById('auth-ok').style.display = 'none';
}
function showAuthErr(msg) {
  const e = document.getElementById('auth-err');
  e.textContent = msg; e.style.display = 'block';
}
function submitAuth() {
  hideAuthMsgs();
  const email = document.getElementById('inp-email').value.trim().toLowerCase();
  const pass = document.getElementById('inp-pass').value;
  const name = document.getElementById('inp-name').value.trim();

  if (!email || !email.includes('@')) return showAuthErr('Please enter a valid email address.');
  if (pass.length < 4) return showAuthErr('Password must be at least 4 characters.');

  if (S.authMode === 'signup') {
    if (!name) return showAuthErr('Please enter your name.');
    if (DB.users[email]) return showAuthErr('An account with this email already exists. Try logging in instead.');
    DB.users[email] = { ...freshUserData(name, email), password: pass };
    DB.currentUser = email;
    saveStore();
    toast(`Welcome, ${name}!`);
    enterApp();
  } else {
    const u = DB.users[email];
    if (!u || u.password !== pass) return showAuthErr('Incorrect email or password.');
    DB.currentUser = email;
    saveStore();
    toast(`Welcome back, ${u.name}!`);
    enterApp();
  }
}
function logout() {
  DB.currentUser = null;
  saveStore();
  document.getElementById('inp-pass').value = '';
  show('auth');
}
function enterApp() {
  updateStreak();
  document.getElementById('avatar-initials').textContent = initials(currentUserData().name);
  show('home');
}
function openProfile() {
  const u = currentUserData();
  document.getElementById('profile-avatar-big').textContent = initials(u.name);
  document.getElementById('profile-name').textContent = u.name;
  document.getElementById('profile-email').textContent = u.email;
  document.getElementById('pwd-current').value = '';
  document.getElementById('pwd-new').value = '';
  document.getElementById('pwd-confirm').value = '';
  document.getElementById('pwd-err').style.display = 'none';
  document.getElementById('pwd-ok').style.display = 'none';
  show('profile');
}
function changePassword() {
  const u = currentUserData();
  const errEl = document.getElementById('pwd-err');
  const okEl = document.getElementById('pwd-ok');
  errEl.style.display = 'none'; okEl.style.display = 'none';

  const current = document.getElementById('pwd-current').value;
  const next = document.getElementById('pwd-new').value;
  const confirm = document.getElementById('pwd-confirm').value;

  if (u.password !== current) { errEl.textContent = 'Current password is incorrect.'; errEl.style.display = 'block'; return; }
  if (next.length < 4) { errEl.textContent = 'New password must be at least 4 characters.'; errEl.style.display = 'block'; return; }
  if (next !== confirm) { errEl.textContent = 'New password and confirmation do not match.'; errEl.style.display = 'block'; return; }
  if (next === current) { errEl.textContent = 'New password must be different from your current password.'; errEl.style.display = 'block'; return; }

  u.password = next;
  saveStore();
  document.getElementById('pwd-current').value = '';
  document.getElementById('pwd-new').value = '';
  document.getElementById('pwd-confirm').value = '';
  okEl.textContent = 'Password updated successfully.';
  okEl.style.display = 'block';
  toast('Password changed!');
}
function initials(name) {
  return name.split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();
}

/* ══════════════════════════════════════════════════════════════
   HOME SCREEN
══════════════════════════════════════════════════════════════ */
/* ── SUBJECT TABS (shared component) ─────────────────────────── */
function renderSubjectTabs(containerId, activeId, onSelect) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const tabs = [{ id: 'all', short: 'All' }, ...SUBJECTS];
  el.innerHTML = tabs.map(s => `
    <button class="subject-tab ${s.id===activeId?'on':''} sub-${s.id}" onclick="${onSelect}('${s.id}')">${s.short}</button>
  `).join('');
}

/* ── ANIMATED RING ────────────────────────────────────────────── */
let ringAnimId = null;
function drawRing(canvas, pct) {
  cancelAnimationFrame(ringAnimId);
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const size = 66;
  canvas.width = size*dpr; canvas.height = size*dpr;
  canvas.style.width = size+'px'; canvas.style.height = size+'px';
  ctx.scale(dpr,dpr);
  const cx = size/2, cy = size/2, r = size/2 - 5;

  const start = performance.now();
  const duration = 700;
  function frame(now) {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
    const current = pct * eased;

    ctx.clearRect(0,0,size,size);
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle = '#2dd4bf'; ctx.lineWidth = 6; ctx.lineCap='round';
    ctx.beginPath(); ctx.arc(cx,cy,r, -Math.PI/2, -Math.PI/2 + (current/100)*Math.PI*2); ctx.stroke();

    if (t < 1) ringAnimId = requestAnimationFrame(frame);
  }
  ringAnimId = requestAnimationFrame(frame);
}

function renderHome() {
  const u = currentUserData();
  const allRanked = rankedTopics();
  const pct = overallEIS();

  document.getElementById('home-username').textContent = u.name.split(' ')[0];
  document.getElementById('eis-pct').textContent = pct + '%';
  drawRing(document.getElementById('eis-canvas'), pct);

  // hero always recommends the single top-priority topic across ALL subjects
  const topPriority = allRanked[0];
  document.getElementById('btn-start-label').textContent = `▶  Start Practice — ${topPriority.name}`;
  document.getElementById('btn-start').onclick = () => openPractice(topPriority.id);

  const totalQ = Object.values(u.progress).reduce((s,p)=>s+p.total,0);
  document.getElementById('home-substat').textContent = `${totalQ} question${totalQ===1?'':'s'} answered so far`;
  const streakBadge = document.getElementById('streak-badge');
  if (u.streak >= 2) { streakBadge.style.display = 'inline-flex'; document.getElementById('streak-num').textContent = u.streak; }
  else { streakBadge.style.display = 'none'; }

  // subject tabs filter the topic list below
  renderSubjectTabs('home-subject-tabs', S.homeFilter, 'setHomeFilter');
  const ranked = S.homeFilter === 'all' ? allRanked : allRanked.filter(t => t.subject === S.homeFilter);

  const list = document.getElementById('topic-list');
  list.innerHTML = ranked.map(t => `
    <div class="t-row pri-${priorityLevel(t.eis)}" onclick="openPractice('${t.id}')">
      <div class="t-icon sub-${t.subject}">${t.icon}</div>
      <div class="t-info">
        <div class="t-name">${t.name}</div>
        <div class="t-meta">${t.acc===null ? 'Not started yet' : Math.round(t.acc*100)+'% correct'} · exam freq ${'★'.repeat(t.examFreq)}${'☆'.repeat(5-t.examFreq)}</div>
      </div>
      <div class="t-eis">
        <div class="t-eis-val ${priorityLevel(t.eis)}">${t.eis}</div>
        <div class="t-eis-lbl">${priorityLevel(t.eis)}</div>
      </div>
    </div>`).join('') || `<div class="empty-note">No topics in this subject yet.</div>`;

  // mistake bank card
  const due = dueMistakes();
  document.getElementById('mb-count').textContent = due.length
    ? `${due.length} question${due.length===1?'':'s'} due for review`
    : (u.mistakeBank.length ? `${u.mistakeBank.length} saved, none due yet` : 'No mistakes saved yet — nice!');
  document.getElementById('btn-review').style.opacity = due.length ? '1' : '0.45';
  document.getElementById('btn-review').onclick = () => due.length ? openReview() : toast('Nothing due for review right now.');

  // bound reference card
  document.getElementById('br-count').textContent = `${u.boundRef.length} formula${u.boundRef.length===1?'':'s'} auto-saved`;
}
function setHomeFilter(id) { S.homeFilter = id; renderHome(); }

/* ══════════════════════════════════════════════════════════════
   NOTES
══════════════════════════════════════════════════════════════ */
function renderNotesList() {
  const u = currentUserData();
  renderSubjectTabs('notes-subject-tabs', S.notesFilter, 'setNotesFilter');
  let topics = topicsFor(S.notesFilter);
  const q = S.notesSearch.trim().toLowerCase();
  if (q) {
    topics = topics.filter(t =>
      t.name.toLowerCase().includes(q) ||
      NOTES[t.id].title.toLowerCase().includes(q) ||
      NOTES[t.id].summary.toLowerCase().includes(q)
    );
  }
  const list = document.getElementById('notes-list');
  if (topics.length === 0) {
    list.innerHTML = `<div class="search-empty">No notes match "${S.notesSearch}". Try a different search or clear it.</div>`;
    return;
  }
  list.innerHTML = topics.map(t => `
    <div class="note-card" onclick="openNote('${t.id}')">
      <div class="note-icon sub-${t.subject}">${t.icon}</div>
      <div style="flex:1">
        <div class="note-title">${NOTES[t.id].title}</div>
        <div class="note-sub">${t.name}<span class="subject-pill sub-${t.subject}">${SUBJECTS.find(s=>s.id===t.subject).short}</span></div>
      </div>
      ${u.notesRead[t.id] ? '<span class="note-check">✓</span>' : ''}
    </div>`).join('') || `<div class="empty-note">No topics in this subject yet.</div>`;
}
function setNotesFilter(id) { S.notesFilter = id; renderNotesList(); }
function setNotesSearch(v) { S.notesSearch = v; renderNotesList(); }
function openNote(topicId) {
  S.activeNote = topicId;
  const n = NOTES[topicId];
  const u = currentUserData();
  u.notesRead[topicId] = true; saveStore();

  document.getElementById('notedetail-title').textContent = n.title;
  document.getElementById('notedetail-body').innerHTML = `
    <div class="lesson-card">
      <div class="lesson-head"><span>📘</span><span class="lesson-head-title">Overview</span></div>
      <div class="lesson-body">
        <p>${n.summary}</p>
        <ul class="key-points">${n.keyPoints.map(k=>`<li>${k}</li>`).join('')}</ul>
        <div class="formula-block">${n.formula}</div>
      </div>
    </div>
    <div class="lesson-card">
      <div class="lesson-head"><span>✏️</span><span class="lesson-head-title">Worked Example</span></div>
      <div class="lesson-body">
        <div class="example-block">
          <div class="example-label">Problem</div>
          <div style="font-family:'JetBrains Mono',monospace;font-size:0.88rem;color:var(--text)">${n.worked.problem}</div>
        </div>
        <div style="margin-top:14px">
          ${n.worked.steps.map((s,i)=>`<div class="step"><div class="step-n">${i+1}</div><div class="step-x">${s}</div></div>`).join('')}
        </div>
        <div class="formula-block" style="margin-top:10px">Answer: ${n.worked.answer}</div>
      </div>
    </div>
    <div class="lesson-card">
      <div class="lesson-head"><span>🎯</span><span class="lesson-head-title">VCE Exam Tip</span></div>
      <div class="lesson-body" style="padding-bottom:18px"><div class="tip-block">${n.tip}</div></div>
    </div>
    <button class="btn-teal-full" onclick="openPractice('${topicId}')">Ready to Practise? →</button>
  `;
  show('notedetail');
}

/* ══════════════════════════════════════════════════════════════
   PRACTICE / QUIZ
══════════════════════════════════════════════════════════════ */
function openPractice(topicId) {
  S.quiz.mode = 'practice';
  S.quiz.topic = topicId || TOPICS[0].id;
  S.quiz.diff = 'medium';
  S.practiceFilter = topicId ? subjectOf(topicId) : 'all';
  renderPracticeSetup();
  show('practice');
}
function openReview() {
  S.quiz.mode = 'review';
  const due = dueMistakes();
  S.quiz.pool = due; // array of mistake-bank entries, each with .snapshot and .id
  S.quiz.idx = -1;
  S.quiz.score = { c:0, t:0 };
  document.getElementById('practice-setup').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';
  document.getElementById('quiz-back-label').textContent = 'Mistake Bank Review';
  show('practice');
  nextQuestion();
}
function renderPracticeSetup() {
  document.getElementById('practice-setup').style.display = 'block';
  document.getElementById('quiz-area').style.display = 'none';
  document.getElementById('quiz-back-label').textContent = 'Practice';

  renderSubjectTabs('practice-subject-tabs', S.practiceFilter, 'setPracticeFilter');
  const topics = topicsFor(S.practiceFilter);
  // if current topic isn't in the filtered subject, snap to the first available one
  if (!topics.find(t => t.id === S.quiz.topic)) S.quiz.topic = topics[0] ? topics[0].id : TOPICS[0].id;

  const chipRow = document.getElementById('topic-chips');
  chipRow.innerHTML = topics.map(t => `<button class="chip ${t.id===S.quiz.topic?'on':''}" onclick="selectTopic('${t.id}')">${t.icon} ${t.name}</button>`).join('');

  ['easy','medium','hard'].forEach(d => {
    const b = document.getElementById('db-'+d);
    b.className = 'd-btn' + (S.quiz.diff===d ? ` on-${d}` : '');
  });

  document.getElementById('setup-count').innerHTML = `∞ unlimited questions — a new one is generated every time<br><span style="font-size:0.72rem">⚡ Difficulty adapts automatically as you practice</span>`;
  document.getElementById('btn-begin').disabled = false;
}
function setPracticeFilter(id) { S.practiceFilter = id; renderPracticeSetup(); }
function selectTopic(id) { S.quiz.topic = id; S.quiz.streakCorrect = 0; S.quiz.streakWrong = 0; renderPracticeSetup(); }
function selectDiff(d) { S.quiz.diff = d; S.quiz.streakCorrect = 0; S.quiz.streakWrong = 0; renderPracticeSetup(); }

function beginPractice() {
  S.quiz.score = { c:0, t:0 };
  S.quiz.streakCorrect = 0;
  S.quiz.streakWrong = 0;
  S.quiz.difficultyChanged = null;
  document.getElementById('practice-setup').style.display = 'none';
  document.getElementById('quiz-area').style.display = 'block';
  nextQuestion();
}

function nextQuestion() {
  if (S.quiz.mode === 'review') {
    S.quiz.idx += 1;
    if (S.quiz.idx >= S.quiz.pool.length) { renderQuizComplete(); return; }
    const entry = S.quiz.pool[S.quiz.idx];
    S.quiz.current = entry.snapshot;
    S.quiz.currentEntryId = entry.id;
  } else {
    // practice mode: generate a brand-new question every time — genuinely unlimited,
    // never runs out, matches the "unlimited bank of practice questions" requirement.
    S.quiz.idx += 1;
    S.quiz.current = generateQuestion(S.quiz.topic, S.quiz.diff);
    S.quiz.currentEntryId = null;
  }
  S.quiz.answered = false;
  S.quiz.hintsShown = 0;
  renderQuestion();
}

function exitPractice() {
  renderQuizComplete();
}

function renderQuizComplete() {
  const area = document.getElementById('q-area');
  const acc = S.quiz.score.t ? Math.round(S.quiz.score.c/S.quiz.score.t*100) : 0;
  const isReview = S.quiz.mode === 'review';
  const title = isReview ? 'Review complete!' : 'Session ended';
  const sub = S.quiz.score.t === 0
    ? "You didn't answer any questions this session."
    : `You scored ${S.quiz.score.c} / ${S.quiz.score.t} (${acc}%)`;
  const topicName = TOPICS.find(t => t.id === S.quiz.topic);

  area.innerHTML = `
    <div class="empty-state">
      <div class="ic">${acc >= 70 || S.quiz.score.t === 0 ? '🎉' : '💪'}</div>
      <p style="color:var(--text);font-size:1rem;font-weight:600;margin-bottom:6px">${title}</p>
      <p>${sub}</p>
    </div>`;
  document.getElementById('act-row').style.display = 'flex';
  document.getElementById('btn-next').style.display = 'none';
  document.getElementById('btn-exit').style.display = 'none';
  document.getElementById('btn-back-home').style.display = 'block';

  // offer "practice again" for practice-mode sessions with the same topic/difficulty
  let againBtn = document.getElementById('btn-practice-again');
  if (!isReview && topicName) {
    if (!againBtn) {
      againBtn = document.createElement('button');
      againBtn.id = 'btn-practice-again';
      againBtn.className = 'btn-teal';
      document.getElementById('act-row').appendChild(againBtn);
    }
    againBtn.style.display = 'inline-block';
    againBtn.textContent = `Practice ${topicName.name} Again`;
    againBtn.onclick = () => { S.quiz.score = {c:0,t:0}; S.quiz.idx = -1; S.quiz.streakCorrect=0; S.quiz.streakWrong=0; document.getElementById('btn-exit').style.display='inline-block'; nextQuestion(); };
  } else if (againBtn) {
    againBtn.style.display = 'none';
  }
}

function renderQuestion() {
  const q = S.quiz.current;
  S.quiz.triedWrong = [];
  document.getElementById('score-disp').textContent = `${S.quiz.score.c} / ${S.quiz.score.t}`;
  document.getElementById('act-row').style.display = 'flex';
  document.getElementById('btn-next').style.display = 'inline-block';
  document.getElementById('btn-back-home').style.display = 'none';
  document.getElementById('btn-exit').style.display = 'inline-block';
  document.getElementById('btn-next').disabled = true;
  document.getElementById('btn-next').textContent = 'Next →';
  const againBtn = document.getElementById('btn-practice-again');
  if (againBtn) againBtn.style.display = 'none';

  const topic = TOPICS.find(t=>t.id===q.topic);

  // adaptive difficulty banner — shows once, right after a bump, then clears
  let bannerHtml = '';
  if (S.quiz.mode === 'practice' && S.quiz.difficultyChanged) {
    const dc = S.quiz.difficultyChanged;
    bannerHtml = dc.dir === 'up'
      ? `<div class="difficulty-bump-toast"><span class="icon">🚀</span><span class="msg">3 correct in a row — stepped up to <b>${dc.diff.toUpperCase()}</b> difficulty!</span></div>`
      : `<div class="difficulty-bump-toast"><span class="icon">🎯</span><span class="msg">Let's rebuild — stepped back down to <b>${dc.diff.toUpperCase()}</b> difficulty.</span></div>`;
    S.quiz.difficultyChanged = null;
  }

  // streak progress dots (only meaningful mid-streak, during live practice)
  let streakHtml = '';
  if (S.quiz.mode === 'practice' && S.quiz.streakCorrect > 0) {
    const dots = [0,1,2].map(i => `<span class="dot ${i < S.quiz.streakCorrect ? 'on' : ''}"></span>`).join('');
    streakHtml = `<div class="streak-counter-row">${dots} ${S.quiz.streakCorrect}/3 correct — one more streak levels you up!</div>`;
  }

  document.getElementById('q-area').innerHTML = `
    ${bannerHtml}
    ${streakHtml}
    <div class="q-card">
      <div class="q-head">
        <span class="q-label">${topic.name}</span>
        <span class="q-diff ${q.difficulty}">${q.difficulty}</span>
      </div>
      <div class="q-body">
        <div class="q-text">${q.text}</div>
        <div class="q-freq">★ VCAA exam frequency: ${'★'.repeat(topic.examFreq)}${'☆'.repeat(5-topic.examFreq)}</div>
      </div>
    </div>
    <div class="hint-row">
      <button class="hbtn h1" id="hint-btn-1" onclick="showHint(1)">Hint 1</button>
      <button class="hbtn h2" id="hint-btn-2" onclick="showHint(2)">Hint 2</button>
      <button class="hbtn h3" onclick="revealAnswer()">Show Answer</button>
    </div>
    <div class="hint-box" id="hint-box"></div>
    <div class="opts">${q.options.map(o => `
      <button class="opt" data-l="${o.l}" onclick="pickAnswer('${o.l}')">
        <div class="opt-letter">${o.l}</div>
        <div class="opt-text">${o.v}</div>
        <div class="opt-icon"></div>
      </button>`).join('')}</div>
    <div class="difficulty-bump-toast" id="retry-msg" style="display:none;border-color:var(--gold)"></div>
    <div id="exp-area"></div>`;
}

function showHint(n) {
  const q = S.quiz.current;
  if (S.quiz.answered) return;
  S.quiz.hintsShown = Math.max(S.quiz.hintsShown, n);
  const box = document.getElementById('hint-box');
  box.style.display = 'block';
  box.textContent = '💡 ' + q.hints[n-1];
  document.getElementById('hint-btn-'+n).disabled = true;
}

function revealAnswer() {
  if (S.quiz.answered) return;
  pickAnswer(S.quiz.current.correct, true);
}

function pickAnswer(letter, wasRevealed) {
  if (S.quiz.answered) return;
  const q = S.quiz.current;
  const correct = q.correct;
  const isRightLetter = (letter === correct);

  // ── SECOND CHANCE ──
  // First wrong guess doesn't reveal the answer — it marks that option
  // as wrong and lets the student try one more option before the full
  // solution appears. Only applies to a genuine click, not "Show Answer".
  if (!wasRevealed && !isRightLetter && !S.quiz.triedWrong.includes(letter) && S.quiz.triedWrong.length === 0) {
    S.quiz.triedWrong.push(letter);
    const btn = document.querySelector(`.opt[data-l="${letter}"]`);
    if (btn) { btn.disabled = true; btn.classList.add('wrong'); btn.querySelector('.opt-icon').textContent = '✗'; }
    const retryEl = document.getElementById('retry-msg');
    retryEl.style.display = 'flex';
    retryEl.innerHTML = `<span class="icon">🤔</span><span class="msg">Not quite — that option's out. Give it one more shot!</span>`;
    return; // stay on the question, don't grade yet
  }

  // ── FINAL ATTEMPT (correct on 1st try, correct/wrong on 2nd try, or revealed) ──
  S.quiz.answered = true;
  const ok = isRightLetter && !wasRevealed;

  S.quiz.score.t += 1;
  if (ok) S.quiz.score.c += 1;
  recordAnswer(q, ok);

  // ── ADAPTIVE DIFFICULTY ──
  // 3 correct in a row bumps difficulty up; 2 wrong in a row (harder to
  // shake confidence than to reward mastery, hence the asymmetry) bumps
  // it back down. Only applies during live practice, not mistake review.
  if (S.quiz.mode === 'practice') {
    const order = ['easy','medium','hard'];
    const curIdx = order.indexOf(S.quiz.diff);
    if (ok) {
      S.quiz.streakCorrect += 1; S.quiz.streakWrong = 0;
      if (S.quiz.streakCorrect >= 3 && curIdx < 2) {
        S.quiz.diff = order[curIdx+1];
        S.quiz.streakCorrect = 0;
        S.quiz.difficultyChanged = { dir: 'up', diff: S.quiz.diff };
      }
    } else {
      S.quiz.streakWrong += 1; S.quiz.streakCorrect = 0;
      if (S.quiz.streakWrong >= 2 && curIdx > 0) {
        S.quiz.diff = order[curIdx-1];
        S.quiz.streakWrong = 0;
        S.quiz.difficultyChanged = { dir: 'down', diff: S.quiz.diff };
      }
    }
  }

  document.getElementById('retry-msg').style.display = 'none';
  document.querySelectorAll('.opt').forEach(b => {
    b.disabled = true;
    const l = b.dataset.l;
    if (l === correct) { b.classList.add('correct'); b.querySelector('.opt-icon').textContent = '✓'; }
    else if (l === letter && !ok) { b.classList.add('wrong'); b.querySelector('.opt-icon').textContent = '✗'; }
  });
  document.getElementById('score-disp').textContent = `${S.quiz.score.c} / ${S.quiz.score.t}`;

  const usedSecondChance = S.quiz.triedWrong.length > 0;
  const headLabel = ok
    ? (usedSecondChance ? '✓ Correct (2nd try)' : '✓ Correct')
    : (wasRevealed ? '👁 Answer Revealed' : '✗ Incorrect');

  const stepsHtml = q.steps.map((s,i) => `<div class="step"><div class="step-n">${i+1}</div><div class="step-x"><b style="color:var(--text);font-family:'DM Sans',sans-serif;font-weight:600">${s.t}</b><br>${s.x}</div></div>`).join('');
  document.getElementById('exp-area').innerHTML = `
    <div class="exp-card">
      <div class="exp-head">${headLabel} — Solution</div>
      <div class="exp-body">
        ${stepsHtml}
        <div class="final-box">🎯 ${q.final}</div>
      </div>
    </div>`;
  document.getElementById('btn-next').disabled = false;
}

/* ══════════════════════════════════════════════════════════════
   BOUND REFERENCE
══════════════════════════════════════════════════════════════ */
function renderBoundRef() {
  const u = currentUserData();
  const el = document.getElementById('boundref-list');
  if (!u.boundRef.length) {
    el.innerHTML = `<div class="empty-state"><div class="ic">📄</div><p>No formulas here yet. Formulas you get wrong twice are automatically added to your personal bound reference.</p></div>`;
    document.getElementById('print-btn').style.display = 'none';
    return;
  }
  document.getElementById('print-btn').style.display = 'block';
  el.innerHTML = u.boundRef.map(r => {
    const topic = TOPICS.find(t=>t.id===r.topic);
    return `<div class="ref-item">
      <div>
        <div class="ref-formula">${r.formula}</div>
        <div class="ref-topic">${topic ? topic.name : r.topic}</div>
      </div>
      <button class="ref-remove" onclick="removeRef('${r.tag}')">Remove</button>
    </div>`;
  }).join('');
}
function removeRef(tag) {
  const u = currentUserData();
  u.boundRef = u.boundRef.filter(r => r.tag !== tag);
  saveStore();
  renderBoundRef();
  toast('Removed from bound reference.');
}
function printRef() { window.print(); }

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
window.addEventListener('DOMContentLoaded', () => {
  if (DB.currentUser && DB.users[DB.currentUser]) {
    // Don't silently auto-enter — show a "continue as X" prompt instead.
    // This matters on shared/school computers: without this, whoever
    // opens the app next would be silently logged in as the previous
    // student with zero indication, which is exactly the bug this fixes.
    document.getElementById('continue-name').textContent = DB.users[DB.currentUser].name;
    document.getElementById('continue-card').style.display = 'block';
    document.getElementById('auth-card-real').style.display = 'none';
  } else {
    show('auth');
  }
});
function continueSession() {
  enterApp();
}
function switchAccount() {
  DB.currentUser = null;
  saveStore();
  document.getElementById('continue-card').style.display = 'none';
  document.getElementById('auth-card-real').style.display = 'block';
  document.getElementById('inp-email').value = '';
  document.getElementById('inp-pass').value = '';
  setAuthMode('login');
}
