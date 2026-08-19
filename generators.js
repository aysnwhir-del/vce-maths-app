/* ═══════════════════════════════════════════════════════════════
   generators.js — Procedural Question Generation
   Every call produces a fresh, randomised, mathematically-verified
   question. This is what makes the practice bank genuinely
   unlimited (Functional Requirement: "unlimited bank of practice
   questions") rather than a fixed pool that runs out.
═══════════════════════════════════════════════════════════════ */

function rnd(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function rsign() { return Math.random() < 0.5 ? -1 : 1; }
function rndNZ(a, b) { let n; do { n = rnd(a,b); } while (n === 0); return n; }
function sup(n) { if (n === 1) return ''; return { 2:'²', 3:'³', 4:'⁴' }[n] || ('^' + n); }
function pmTerm(n, withVar) {           // e.g. pmTerm(-5,'x') -> "− 5x", pmTerm(3,'') -> "+ 3", pmTerm(1,'x') -> "+ x"
  const v = withVar || '';
  const abs = Math.abs(n);
  const coefStr = (abs === 1 && v !== '') ? '' : String(abs);
  return (n >= 0 ? '+ ' : '− ') + coefStr + v;
}
function fmt2(n) { return (Math.round(n * 100) / 100).toString(); }

/* Pythagorean triples used for "clean" magnitude/modulus questions */
const PYTHAG = [[3,4,5],[6,8,10],[5,12,13],[8,15,17],[9,12,15],[7,24,25],[20,21,29]];

function shuffleOptions(correctVal, distractors) {
  const letters = ['A','B','C','D'];
  const seen = new Set([correctVal]);
  const uniqueDistractors = [];
  for (const d of distractors) { if (!seen.has(d)) { seen.add(d); uniqueDistractors.push(d); } }
  if (uniqueDistractors.length < 3) {
    console.warn('[generators] fewer than 3 unique distractors produced — check this generator:', correctVal, distractors);
    let pad = 1;
    while (uniqueDistractors.length < 3) { const v = correctVal + ` (≈${pad})`; if (!seen.has(v)) { seen.add(v); uniqueDistractors.push(v); } pad++; }
  }
  const vals = [correctVal, ...uniqueDistractors.slice(0,3)];
  for (let i = vals.length-1;i>0;i--) { const j = Math.floor(Math.random()*(i+1)); [vals[i],vals[j]]=[vals[j],vals[i]]; }
  const correctIdx = vals.indexOf(correctVal);
  return { options: letters.map((l,i)=>({ l, v: vals[i] })), correct: letters[correctIdx] };
}
function buildQ(text, correctVal, distractors, formulaTag, hints, steps, final) {
  const { options, correct } = shuffleOptions(correctVal, distractors);
  return { id: 'gen_' + Math.random().toString(36).slice(2,9), text, options, correct, formulaTag, hints, steps, final };
}

/* ═══════════════ GENERATORS — one per topic ═══════════════ */
const GENERATORS = {

  /* ---------- METHODS: CALCULUS ---------- */
  calculus(diff) {
    if (diff === 'easy') {
      const a = rnd(2,6), b = rsign()*rnd(1,9), c = rsign()*rnd(1,9);
      const text = `Find the derivative of f(x) = ${a}x² ${pmTerm(b,'x')} ${pmTerm(c,'')}`;
      const correct = `${2*a}x ${pmTerm(b,'')}`;
      const distractors = [ `${a}x ${pmTerm(b,'')}`, `${2*a}x ${pmTerm(b,'')} ${pmTerm(c,'')}`, `${2*a}x` ];
      return buildQ(text, correct, distractors, 'power_rule',
        ['Differentiate each term separately using the power rule.', 'Remember: the derivative of a constant is always 0.'],
        [{t:'Differentiate the x² term', x:`d/dx[${a}x²] = ${2*a}x`}, {t:'Differentiate the x term', x:`d/dx[${pmTerm(b,'x')}] = ${pmTerm(b,'')}`}, {t:'The constant term disappears', x:`d/dx[${pmTerm(c,'')}] = 0`}],
        `f′(x) = ${correct}`);
    }
    if (diff === 'medium') {
      const a = rnd(1,5), b = rsign()*rnd(1,8), c = rsign()*rnd(1,9);
      const text = `Find the derivative of f(x) = ${a}x³ ${pmTerm(b,'x²')} ${pmTerm(c,'x')}`;
      const correct = `${3*a}x² ${pmTerm(2*b,'x')} ${pmTerm(c,'')}`;
      const distractors = [ `${3*a}x² ${pmTerm(b,'x')} ${pmTerm(c,'')}`, `${a}x² ${pmTerm(2*b,'x')} ${pmTerm(c,'')}`, `${3*a}x² ${pmTerm(2*b,'x')}` ];
      return buildQ(text, correct, distractors, 'power_rule',
        ['Differentiate each term separately using the power rule.', `d/dx[${b>=0?'':'−'}${Math.abs(b)}x²] = ${pmTerm(2*b,'')}·x`],
        [{t:'Differentiate the x³ term', x:`d/dx[${a}x³] = ${3*a}x²`}, {t:'Differentiate the x² term', x:`d/dx[${pmTerm(b,'x²')}] = ${pmTerm(2*b,'x')}`}, {t:'Differentiate the x term', x:`d/dx[${pmTerm(c,'x')}] = ${pmTerm(c,'')}`}],
        `f′(x) = ${correct}`);
    }
    // hard — chain rule
    const k = rnd(2,4), m = rsign()*rnd(1,5), n = rnd(2,3);
    const base = `(${k}x ${pmTerm(m,'')})`;
    const text = `Find f′(x) for f(x) = ${base}${sup(n)}, giving your answer in the form a${base}${sup(n-1)}`;
    const coeff = n*k;
    const correct = `${coeff}${base}${sup(n-1)}`;
    const distractors = [ `${k}${base}${sup(n-1)}`, `${coeff}${base}${sup(n)}`, `${coeff+2}${base}${sup(n-1)}` ];
    return buildQ(text, correct, distractors, 'chain_rule',
      ['Use the chain rule: differentiate the outer function, then multiply by the derivative of the inner function.', `Outer derivative: ${n}${base}${sup(n-1)}, inner derivative: ${k}`],
      [{t:'Differentiate the outer function', x:`${n}${base}${sup(n-1)}`}, {t:'Multiply by the inner derivative', x:`× ${k}`}],
      `f′(x) = ${correct}`);
  },

  /* ---------- METHODS: PROBABILITY ---------- */
  probability(diff) {
    if (diff === 'easy') {
      const p1 = rnd(2,8), p2 = rnd(2,8); // tenths
      const ans = fmt2(p1*p2/100);
      const text = `Events A and B are independent, with P(A) = 0.${p1} and P(B) = 0.${p2}. Find P(A ∩ B).`;
      const distractors = [ fmt2((p1+p2)/10), fmt2(Math.abs(p1-p2)/10), fmt2(p1*p2/100 + 0.1) ];
      return buildQ(text, ans, distractors, 'independence',
        ['For independent events, P(A∩B) = P(A) × P(B).', `0.${p1} × 0.${p2}`],
        [{t:'Multiply the probabilities (independence)', x:`0.${p1} × 0.${p2} = ${ans}`}], `P(A∩B) = ${ans}`);
    }
    if (diff === 'medium') {
      const yT = rnd(4,9), xT = rnd(1,yT-1);
      const ans = fmt2(xT/yT);
      const text = `P(A ∩ B) = 0.${xT}, P(B) = 0.${yT}. Find P(A|B).`;
      const distractors = [ fmt2(yT/xT), fmt2(Math.min(0.99, xT/yT + 0.15)), fmt2(Math.max(0, xT/yT - 0.15)) ];
      return buildQ(text, ans, distractors, 'cond_prob',
        ['Use the conditional probability formula.', 'P(A|B) = P(A∩B) / P(B)'],
        [{t:'Substitute into the formula', x:`P(A|B) = 0.${xT} / 0.${yT}`}], `P(A|B) = ${ans}`);
    }
    // hard — addition rule
    const p1 = rnd(3,8), p2 = rnd(2,7), xT = rnd(1, Math.min(p1,p2));
    const ans = fmt2((p1+p2-xT)/10);
    const text = `P(A) = 0.${p1}, P(B) = 0.${p2}, P(A∩B) = 0.${xT}. Find P(A∪B).`;
    const distractors = [ fmt2((p1+p2)/10), fmt2((p1+p2+xT)/10), fmt2(p1*p2/100) ];
    return buildQ(text, ans, distractors, 'addition',
      ['Use the addition rule for probability.', 'P(A∪B) = P(A) + P(B) − P(A∩B)'],
      [{t:'Apply the addition rule', x:`0.${p1} + 0.${p2} − 0.${xT}`}], `P(A∪B) = ${ans}`);
  },

  /* ---------- METHODS: ALGEBRA ---------- */
  algebra(diff) {
    if (diff === 'easy') {
      const k = rnd(2,9);
      const text = `Solve x² − ${k*k} = 0`;
      const correct = `x = ±${k}`;
      const distractors = [ `x = ${k*k}`, `x = ${k} only`, `x = ±${k*k}` ];
      return buildQ(text, correct, distractors, 'discriminant',
        [`Rearrange to x² = ${k*k}.`, 'Taking a square root gives both a positive and negative solution.'],
        [{t:'Solve for x', x:`x² = ${k*k}  →  x = ±√${k*k}`}], `x = ${k} or x = −${k}`);
    }
    if (diff === 'medium') {
      let r1 = rnd(1,7)*rsign(), r2;
      do { r2 = rnd(1,7)*rsign(); } while (r2 === r1);
      const b = -(r1+r2), c = r1*r2;
      const [lo,hi] = r1<r2 ? [r1,r2] : [r2,r1];
      const text = `Solve x² ${pmTerm(b,'x')} ${pmTerm(c,'')} = 0 by factorising`;
      const correct = `x = ${lo}, ${hi}`;
      const distractors = [ `x = ${-lo}, ${-hi}`, `x = ${hi}, ${lo+1}`, `x = ${lo-1}, ${hi}` ];
      return buildQ(text, correct, distractors, 'quadratic_formula',
        [`Find two numbers that multiply to ${c} and add to ${b}.`, `Those numbers are ${r1} and ${r2}.`],
        [{t:'Factorise', x:`(x ${pmTerm(-r1,'')})(x ${pmTerm(-r2,'')}) = 0`}], `x = ${lo} or x = ${hi}`);
    }
    // hard — quadratic formula, non-monic
    const a = rnd(2,3);
    let r1 = rnd(1,5)*rsign(), r2;
    do { r2 = rnd(1,5)*rsign(); } while (r2 === r1);
    const b = -a*(r1+r2), c = a*r1*r2;
    const [lo,hi] = r1<r2 ? [r1,r2] : [r2,r1];
    const text = `Solve ${a}x² ${pmTerm(b,'x')} ${pmTerm(c,'')} = 0 using the quadratic formula`;
    const correct = `x = ${lo}, ${hi}`;
    const distractors = [ `x = ${-lo}, ${-hi}`, `x = ${lo}, ${hi+1}`, `x = ${lo*2}, ${hi}` ];
    return buildQ(text, correct, distractors, 'quadratic_formula',
      [`Identify a=${a}, b=${b}, c=${c} and substitute into the quadratic formula.`, 'Δ = b² − 4ac'],
      [{t:'Calculate the discriminant', x:`Δ = ${b}² − 4(${a})(${c})`}, {t:'Apply the quadratic formula', x:`x = (${-b} ± √Δ) / ${2*a}`}], `x = ${lo} or x = ${hi}`);
  },

  /* ---------- GENERAL: STATISTICS (z-scores) ---------- */
  general_statistics(diff) {
    const sigmas = [2,4,5,8,10];
    if (diff === 'easy') {
      const sigma = sigmas[rnd(0,sigmas.length-1)], z = [-2,-1,1,2][rnd(0,3)], mu = rnd(40,80);
      const x = mu + z*sigma;
      const text = `Scores are normally distributed with μ = ${mu}, σ = ${sigma}. Find the z-score for x = ${x}.`;
      const distractors = [ String(z*2), String(-z), fmt2((x-mu)/(sigma*2)) ];
      return buildQ(text, String(z), distractors, 'z_score',
        ['Use z = (x − μ) / σ.', `(${x} − ${mu}) / ${sigma}`],
        [{t:'Apply the z-score formula', x:`z = (${x} − ${mu}) / ${sigma}`}], `z = ${z}`);
    }
    if (diff === 'medium') {
      const level = [1,2,3][rnd(0,2)], pct = {1:'68%',2:'95%',3:'99.7%'}[level];
      const text = `For a normal distribution, approximately what % of data lies within ${level} standard deviation${level>1?'s':''} of the mean?`;
      const all = ['68%','95%','99.7%'];
      const distractors = [...all.filter(p => p !== pct), '50%'];
      return buildQ(text, pct, distractors, 'z_score',
        ['This is part of the 68–95–99.7 rule.', '1 SD = 68%, 2 SD = 95%, 3 SD = 99.7%'],
        [{t:'Recall the empirical rule', x:'68% (1 SD), 95% (2 SD), 99.7% (3 SD)'}], pct);
    }
    // hard — reverse: given z, find x
    const sigma = sigmas[rnd(0,sigmas.length-1)], z = [-2,-1.5,-1,1,1.5,2][rnd(0,5)], mu = rnd(40,80);
    const x = mu + z*sigma;
    const text = `Scores are normal with μ = ${mu}, σ = ${sigma}. A student scored z = ${z}. Find their raw score.`;
    const distractors = [ String(mu - z*sigma), String(mu + z*sigma*2), String(mu) ];
    return buildQ(text, String(x), distractors, 'z_score',
      ['Rearrange z = (x − μ)/σ to solve for x.', 'x = μ + zσ'],
      [{t:'Rearrange and substitute', x:`x = ${mu} + (${z} × ${sigma})`}], `x = ${x}`);
  },

  /* ---------- GENERAL: FINANCIAL MATHS ---------- */
  general_finance(diff) {
    if (diff === 'easy') {
      const k = rnd(2,20), r = rnd(2,10), t = rnd(1,5);
      const P = k*100, I = k*r*t;
      const text = `Find the simple interest on $${P} at ${r}% p.a. for ${t} year${t>1?'s':''}.`;
      const distractors = [ `$${r*t}`, `$${I+P}`, `$${I+3}` ];
      return buildQ(text, `$${I}`, distractors, 'simple_interest',
        ['Use I = P × r × t, with r as a decimal.', `I = ${P} × ${(r/100)} × ${t}`],
        [{t:'Substitute values', x:`I = ${P} × ${r/100} × ${t}`}], `I = $${I}`);
    }
    if (diff === 'medium') {
      const k = rnd(5,30), r = rnd(2,10), n = rnd(2,3);
      const P = k*100;
      const A = Math.round(P * Math.pow(1+r/100, n));
      const text = `$${P} is invested at ${r}% p.a. compound interest for ${n} years. Find the total value (nearest dollar).`;
      let simpleWrong = Math.round(P*(1+r/100*n));
      const seen = new Set([A]);
      function pushUnique(v) { while (seen.has(v)) v += 3; seen.add(v); return v; }
      simpleWrong = pushUnique(simpleWrong);
      const d2 = pushUnique(A+6);
      const d3 = pushUnique(A-4);
      const distractors = [ `$${simpleWrong}`, `$${d2}`, `$${d3}` ];
      return buildQ(text, `$${A}`, distractors, 'compound_interest',
        ['Use A = P(1+r)ⁿ with r as a decimal.', `A = ${P} × (1.${r<10?'0'+r:r})${sup(n)}`],
        [{t:'Substitute and calculate', x:`A = ${P} × (1+${r/100})${sup(n)}`}], `A ≈ $${A}`);
    }
    // hard — reverse: find rate
    const k = rnd(2,15), t = rnd(2,6), r = rnd(2,10);
    const P = k*100, I = k*r*t;
    const text = `An amount of $${P} earns $${I} simple interest over ${t} years. Find the annual interest rate.`;
    const distractors = [ `${r+1}%`, `${r+3}%`, `${Math.max(1,r-2)}%` ];
    return buildQ(text, `${r}%`, distractors, 'simple_interest',
      ['Rearrange I = Prt to solve for r.', 'r = I / (P × t)'],
      [{t:'Find interest earned', x:`Given I = $${I}`}, {t:'Solve for r', x:`r = ${I} / (${P}×${t})`}], `r = ${r}% p.a.`);
  },

  /* ---------- GENERAL: MATRICES ---------- */
  general_matrices(diff) {
    if (diff === 'easy') {
      let a,b,c,d,e,f,g,h,positions,posName,val;
      do {
        a=rndNZ(-9,9); b=rndNZ(-9,9); c=rndNZ(-9,9); d=rndNZ(-9,9);
        e=rndNZ(-9,9); f=rndNZ(-9,9); g=rndNZ(-9,9); h=rndNZ(-9,9);
        positions = [['top-left', a+e],['top-right', b+f],['bottom-left', c+g],['bottom-right', d+h]];
        [posName, val] = positions[rnd(0,3)];
      } while (val === 0);
      const text = `Given A=[[${a},${b}],[${c},${d}]] and B=[[${e},${f}],[${g},${h}]], find the ${posName} element of A+B.`;
      const distractors = [ String(val+1), String(val-1), String(-val) ];
      const pairMap = { 'top-left':[a,e], 'top-right':[b,f], 'bottom-left':[c,g], 'bottom-right':[d,h] };
      const [p1,p2] = pairMap[posName];
      return buildQ(text, String(val), distractors, 'determinant',
        ['Add matching positions (same row, same column) from each matrix.', `Look at the ${posName} entry in each matrix.`],
        [{t:`Add the ${posName} elements`, x:`${p1} + ${p2} = ${val}`}], `The ${posName} element of A+B is ${val}`);
    }
    if (diff === 'medium') {
      const a=rndNZ(-9,9), b=rndNZ(-9,9), c=rndNZ(-9,9), d=rndNZ(-9,9);
      const det=a*d-b*c;
      const text = `Find the determinant of [[${a},${b}],[${c},${d}]].`;
      const distractors = [ String(det+2), String(det-3), String(det+5) ];
      return buildQ(text, String(det), distractors, 'determinant',
        ['Use det = ad − bc for a 2×2 matrix [[a,b],[c,d]].', `a=${a}, b=${b}, c=${c}, d=${d}`],
        [{t:'Apply the determinant formula', x:`det = (${a}×${d}) − (${b}×${c})`}], `det = ${det}`);
    }
    // hard — determinant + invertibility
    let a,b,c,d,det;
    do { a=rndNZ(-9,9); b=rndNZ(-9,9); c=rndNZ(-9,9); d=rndNZ(-9,9); det=a*d-b*c; } while (det===0);
    const text = `Find the determinant of [[${a},${b}],[${c},${d}]], then state whether the matrix has an inverse.`;
    const correct = `${det}, has an inverse`;
    const distractors = [ `${det+2}, has an inverse`, `${det}, no inverse`, `0, no inverse` ];
    return buildQ(text, correct, distractors, 'determinant',
      ['Calculate the determinant first: det = ad − bc.', 'A matrix has an inverse only if its determinant is not zero.'],
      [{t:'Calculate determinant', x:`det = (${a}×${d}) − (${b}×${c}) = ${det}`}, {t:'Check invertibility', x:'Since det ≠ 0, the matrix has an inverse.'}], correct);
  },

  /* ---------- SPECIALIST: VECTORS ---------- */
  vectors(diff) {
    if (diff === 'easy') {
      const [x,y,mag] = PYTHAG[rnd(0,PYTHAG.length-1)];
      const xs = rsign(), ys = rsign();
      const text = `Find the magnitude of the vector a = ${x}i ${ys<0?'−':'+'} ${y}j`;
      const distractors = [ String(x+y), String(mag*2), String(x*y) ];
      return buildQ(text, String(mag), distractors, 'vector_mag',
        ['Use |a| = √(x² + y²).', `${x}² + ${y}²`],
        [{t:'Apply the magnitude formula', x:`|a| = √(${x}² + ${y}²) = √${x*x+y*y}`}], `|a| = ${mag}`);
    }
    if (diff === 'medium') {
      const x1=rndNZ(-6,6), y1=rndNZ(-6,6), x2=rndNZ(-6,6), y2=rndNZ(-6,6);
      const dot = x1*x2+y1*y2;
      const text = `Given a = ${x1}i ${y1<0?'−':'+'} ${Math.abs(y1)}j and b = ${x2}i ${y2<0?'−':'+'} ${Math.abs(y2)}j, find a·b`;
      const distractors = [ String(dot+2), String(dot+3), String(dot-2) ];
      return buildQ(text, String(dot), distractors, 'dot_product',
        ['Use a·b = a₁b₁ + a₂b₂.', 'Multiply the i-components together, then the j-components, then add.'],
        [{t:'Apply the dot product formula', x:`a·b = (${x1}×${x2}) + (${y1}×${y2})`}], `a·b = ${dot}`);
    }
    // hard — angle between vectors
    const [x1,y1,m1] = PYTHAG[rnd(0,PYTHAG.length-1)];
    const [x2,y2,m2] = PYTHAG[rnd(0,PYTHAG.length-1)];
    const dot = x1*x2 + y1*y2;
    const cosT = dot/(m1*m2);
    const angle = Math.round(Math.acos(Math.max(-1,Math.min(1,cosT))) * 180/Math.PI);
    const text = `Find the angle between a = ${x1}i + ${y1}j and b = ${x2}i + ${y2}j (nearest degree).`;
    const distractors = [ String(Math.min(89,angle+15)), String(Math.max(1,angle-10)), String(90) ];
    return buildQ(text, `${angle}°`, distractors, 'angle_between',
      ['Use cosθ = (a·b) / (|a||b|).', 'First find a·b, |a|, and |b| separately.'],
      [{t:'Find dot product', x:`a·b = ${dot}`}, {t:'Find magnitudes', x:`|a|=${m1}, |b|=${m2}`}, {t:'Solve for θ', x:`cosθ = ${dot}/${m1*m2} ≈ ${cosT.toFixed(2)}`}], `θ ≈ ${angle}°`);
  },

  /* ---------- SPECIALIST: COMPLEX NUMBERS ---------- */
  specialist_complex(diff) {
    if (diff === 'easy') {
      const a=rnd(-9,9)||3, b=rnd(-9,9)||2, c=rnd(-9,9)||1, d=rnd(-9,9)||-5;
      const re=a+c, im=b+d;
      const text = `Simplify (${a}${b<0?'−':'+'}${Math.abs(b)}i) + (${c}${d<0?'−':'+'}${Math.abs(d)}i)`;
      const correct = `${re}${im<0?'−':'+'}${Math.abs(im)}i`;
      const distractors = [ `${a-c}${b-d<0?'−':'+'}${Math.abs(b-d)}i`, `${re}${im<0?'+':'−'}${Math.abs(im)}i`, `${a*c}${b*d<0?'−':'+'}${Math.abs(b*d)}i` ];
      return buildQ(text, correct, distractors, 'complex_add',
        ['Add the real parts together, then add the imaginary parts together.', `Real: ${a}+${c}, Imaginary: ${b}+${d}`],
        [{t:'Add real parts', x:`${a}+${c}=${re}`}, {t:'Add imaginary parts', x:`${b}+${d}=${im}`}], correct);
    }
    if (diff === 'medium') {
      const [a,b,mod] = PYTHAG[rnd(0,PYTHAG.length-1)];
      const text = `Find the modulus of z = ${a}${rsign()<0?'−':'+'}${b}i`;
      const distractors = [ String(mod+2), String(mod+5), String(mod-1) ];
      return buildQ(text, String(mod), distractors, 'complex_mod',
        ['Use |a+bi| = √(a²+b²).', `${a}²+${b}²`],
        [{t:'Apply the modulus formula', x:`|z| = √(${a}²+${b}²) = √${a*a+b*b}`}], `|z| = ${mod}`);
    }
    // hard — multiply
    const a=rnd(-6,6)||2, b=rnd(-6,6)||3, c=rnd(-6,6)||1, d=rnd(-6,6)||-1;
    const re = a*c - b*d, im = a*d + b*c;
    const text = `Simplify (${a}${b<0?'−':'+'}${Math.abs(b)}i)(${c}${d<0?'−':'+'}${Math.abs(d)}i)`;
    const correct = `${re}${im<0?'−':'+'}${Math.abs(im)}i`;
    const distractors = [ `${a*c+b*d}${im<0?'−':'+'}${Math.abs(im)}i`, `${re}${im<0?'+':'−'}${Math.abs(im)}i`, `${a*c}${b*d<0?'−':'+'}${Math.abs(b*d)}i` ];
    return buildQ(text, correct, distractors, 'complex_mod',
      ['Expand using FOIL, remembering i² = −1.', `(${a})(${c}) + (${a})(${d}i) + (${b}i)(${c}) + (${b}i)(${d}i)`],
      [{t:'Expand the brackets', x:`${a*c} + ${a*d}i + ${b*c}i + ${b*d}i²`}, {t:'Substitute i² = −1 and simplify', x:`${a*c} − (${b*d}) = ${re}, combine i terms: ${im}i`}], correct);
  },

  /* ---------- SPECIALIST: MECHANICS ---------- */
  specialist_mechanics(diff) {
    if (diff === 'easy') {
      const m = rnd(2,20), a = rnd(1,10);
      const F = m*a;
      const text = `A ${m} kg object accelerates at ${a} m/s². Find the net force acting on it.`;
      const distractors = [ `${F+3}`, `${Math.max(1,F-2)}`, `${F+7}` ].map(v=>v+' N');
      return buildQ(text, `${F} N`, distractors, 'newtons_second',
        ['Use F = ma.', `m=${m}, a=${a}`],
        [{t:'Substitute into F=ma', x:`F = ${m} × ${a}`}], `F = ${F} N`);
    }
    if (diff === 'medium') {
      const m = rnd(2,15), a = rnd(2,8);
      const F = m*a;
      const text = `A net force of ${F} N acts on an object, producing an acceleration of ${a} m/s². Find the mass of the object.`;
      const distractors = [ `${m+3}`, `${Math.max(1,m-3)}`, `${m+5}` ].map(v=>v+' kg');
      return buildQ(text, `${m} kg`, distractors, 'newtons_second',
        ['Rearrange F=ma to solve for m.', 'm = F / a'],
        [{t:'Rearrange and substitute', x:`m = ${F} / ${a}`}], `m = ${m} kg`);
    }
    // hard — two opposing forces
    const m = rnd(2,12), aTarget = rnd(3,8);
    const netF = m*aTarget;
    const F2 = rnd(5,20), F1 = netF + F2;
    const text = `A ${m} kg object experiences two horizontal forces: ${F1} N forward and ${F2} N backward. Find its acceleration.`;
    const distractors = [ `${aTarget+2}`, `${Math.max(1,aTarget-2)}`, `${aTarget+4}` ].map(v=>v+' m/s²');
    return buildQ(text, `${aTarget} m/s²`, distractors, 'newtons_second',
      ['First find the net force by combining opposing forces.', `Net force = ${F1} − ${F2} = ${netF} N`],
      [{t:'Find net force', x:`F_net = ${F1} − ${F2} = ${netF} N`}, {t:'Apply F=ma to solve for a', x:`a = ${netF}/${m}`}], `a = ${aTarget} m/s²`);
  },

  /* ---------- GENERAL: SEQUENCES ---------- */
  general_sequences(diff) {
    if (diff === 'easy') {
      const a = rnd(1,9), d = rnd(2,9)*rsign(), n = rnd(4,8);
      const val = a + (n-1)*d;
      const text = `Find the ${n}th term of the arithmetic sequence with first term ${a} and common difference ${d}.`;
      const distractors = [ String(val+d), String(val-d), String(val+2*d) ];
      return buildQ(text, String(val), distractors, 'arithmetic_seq',
        ['Use tₙ = a + (n−1)d.', `a=${a}, d=${d}, n=${n}`],
        [{t:'Substitute into the formula', x:`t${n} = ${a} + (${n}−1)×${d}`}], `t${n} = ${val}`);
    }
    if (diff === 'medium') {
      const a = rnd(1,5), r = rnd(2,3), n = rnd(3,5);
      const val = a * Math.pow(r, n-1);
      const text = `Find the ${n}th term of the geometric sequence with first term ${a} and common ratio ${r}.`;
      const distractors = [ String(val + a), String(Math.round(val/r)), String(a * Math.pow(r,n)) ];
      return buildQ(text, String(val), distractors, 'geometric_seq',
        ['Use tₙ = a·rⁿ⁻¹.', `a=${a}, r=${r}, n=${n}`],
        [{t:'Substitute into the formula', x:`t${n} = ${a} × ${r}^${n-1}`}], `t${n} = ${val}`);
    }
    // hard — solve for n
    const a = rnd(1,9), d = rnd(2,6), nTarget = rnd(5,12);
    const val = a + (nTarget-1)*d;
    const text = `In the arithmetic sequence with first term ${a} and common difference ${d}, which term number equals ${val}?`;
    const distractors = [ String(nTarget+1), String(Math.max(1,nTarget-1)), String(nTarget+2) ];
    return buildQ(text, String(nTarget), distractors, 'arithmetic_seq',
      ['Set tₙ = a + (n−1)d equal to the target value and solve for n.', `${val} = ${a} + (n−1)×${d}`],
      [{t:'Rearrange for n', x:`n − 1 = (${val} − ${a}) / ${d}`}, {t:'Solve', x:`n = ${nTarget}`}], `n = ${nTarget}`);
  },

  /* ---------- GENERAL: TRIGONOMETRY ---------- */
  general_trig(diff) {
    if (diff === 'easy') {
      const [a,b,c] = PYTHAG[rnd(0,PYTHAG.length-1)];
      const text = `A right-angled triangle has legs of ${a} cm and ${b} cm. Find the hypotenuse.`;
      const distractors = [ String(c+2), String(Math.max(1,c-2)), String(c+4) ];
      return buildQ(text, `${c} cm`, distractors, 'pythagoras',
        ['Use Pythagoras: c² = a² + b².', `${a}² + ${b}²`],
        [{t:'Apply Pythagoras', x:`c² = ${a}² + ${b}² = ${a*a+b*b}`}], `c = ${c} cm`);
    }
    if (diff === 'medium') {
      const [a,b,c] = PYTHAG[rnd(0,PYTHAG.length-1)];
      const text = `A right-angled triangle has a hypotenuse of ${c} cm and one leg of ${a} cm. Find the other leg.`;
      const distractors = [ String(b+2), String(c-a), String(b-1) ];
      return buildQ(text, `${b} cm`, distractors, 'pythagoras',
        ['Rearrange Pythagoras: b² = c² − a².', `${c}² − ${a}²`],
        [{t:'Apply Pythagoras', x:`b² = ${c}² − ${a}² = ${c*c-a*a}`}], `b = ${b} cm`);
    }
    // hard — find an angle using inverse trig
    const [a,b,c] = PYTHAG[rnd(0,PYTHAG.length-1)];
    const angle = Math.round(Math.asin(a/c) * 180/Math.PI);
    const text = `A right-angled triangle has an opposite side of ${a} cm and a hypotenuse of ${c} cm. Find the angle θ (nearest degree).`;
    const distractors = [ String(Math.min(89,angle+8)), String(Math.max(1,angle-6)), String(90-angle) ];
    return buildQ(text, `${angle}°`, distractors, 'trig_ratio',
      ['Use sinθ = opposite/hypotenuse, then inverse sine.', `sinθ = ${a}/${c}`],
      [{t:'Set up the ratio', x:`sinθ = ${a}/${c} = ${(a/c).toFixed(2)}`}, {t:'Take inverse sine', x:`θ = sin⁻¹(${(a/c).toFixed(2)})`}], `θ ≈ ${angle}°`);
  },

  /* ---------- METHODS: INTEGRATION ---------- */
  methods_integration(diff) {
    if (diff === 'easy') {
      const a = rnd(2,9), n = rnd(1,4);
      const newN = n+1;
      const text = `Find ∫${a}x${n===1?'':sup(n)} dx`;
      const correct = `${a/newN===Math.floor(a/newN)?a/newN:a+'/'+newN}x${sup(newN)} + c`;
      const distractors = [ `${a}x${sup(newN)} + c`, `${a*newN}x${sup(newN)} + c`, `${a}x${sup(n)} + c` ];
      return buildQ(text, correct, distractors, 'power_rule_integ',
        ['Increase the power by 1, then divide by the new power.', `Power becomes ${newN}`],
        [{t:'Increase the power', x:`x${n===1?'':sup(n)} becomes x${sup(newN)}`}, {t:'Divide the coefficient by the new power', x:`${a}/${newN}`}], `${correct}`);
    }
    if (diff === 'medium') {
      const a = rnd(2,6), b = rnd(2,8);
      const text = `Find ∫(${a}x + ${b}) dx`;
      const halfA = a/2 === Math.floor(a/2) ? a/2 : a+'/2';
      const correct = `${halfA}x² + ${b}x + c`;
      const distractors = [ `${a}x² + ${b}x + c`, `${halfA}x² + ${b} + c`, `${halfA}x + ${b}x + c` ];
      return buildQ(text, correct, distractors, 'power_rule_integ',
        ['Integrate each term separately using the power rule.', `∫${a}x dx = ${halfA}x², ∫${b} dx = ${b}x`],
        [{t:'Integrate the x term', x:`∫${a}x dx = ${halfA}x²`}, {t:'Integrate the constant', x:`∫${b} dx = ${b}x`}], `${correct}`);
    }
    // hard — definite integral of a single power term, clean bounds
    const coeff = rnd(1,4)*2; // even, so /2 stays clean with n=1
    const upper = rnd(2,4);
    const val = coeff/2 * upper*upper;
    const text = `Evaluate ∫₀^${upper} ${coeff}x dx`;
    const distractors = [ String(val+upper), String(coeff*upper*upper), String(Math.max(1,val-2)) ];
    return buildQ(text, String(val), distractors, 'power_rule_integ',
      ['First find the antiderivative, then substitute the bounds.', `∫${coeff}x dx = ${coeff/2}x²`],
      [{t:'Antidifferentiate', x:`${coeff/2}x²`}, {t:'Substitute bounds 0 to ${upper}', x:`${coeff/2}×${upper}² − 0`}], `${val}`);
  },

  /* ---------- METHODS: EXPONENTIALS & LOGARITHMS ---------- */
  methods_explog(diff) {
    if (diff === 'easy') {
      const base = rnd(2,5), p1 = rnd(2,5), p2 = rnd(2,5);
      const text = `Simplify ${base}${sup(p1)} × ${base}${sup(p2)}`;
      const sum = p1+p2;
      const correct = `${base}${sup(sum)}`;
      const distractors = [ `${base}${sup(p1)}`, `${base*2}${sup(sum)}`, `${base}${sup(sum+1)}` ];
      return buildQ(text, correct, distractors, 'index_laws',
        ['Same base — add the powers.', `${p1} + ${p2}`],
        [{t:'Add the powers', x:`${p1} + ${p2} = ${sum}`}], `${base}${sup(sum)}`);
    }
    if (diff === 'medium') {
      const base = rnd(2,5), p1 = rnd(5,9), p2 = rnd(2,4);
      const text = `Simplify ${base}${sup(p1)} ÷ ${base}${sup(p2)}`;
      const diffP = p1-p2;
      const correct = `${base}${sup(diffP)}`;
      const distractors = [ `${base}${sup(p1+p2)}`, `${base}${sup(diffP+1)}`, `${base*2}${sup(diffP)}` ];
      return buildQ(text, correct, distractors, 'index_laws',
        ['Same base — subtract the powers.', `${p1} − ${p2}`],
        [{t:'Subtract the powers', x:`${p1} − ${p2} = ${diffP}`}], `${base}${sup(diffP)}`);
    }
    // hard — solve exponential equation aˣ = aⁿ
    const base = rnd(2,5), n = rnd(2,6);
    const text = `Solve for x: ${base}ˣ = ${base}${sup(n)}`;
    const distractors = [ String(n+1), String(Math.max(1,n-1)), String(n*2) ];
    return buildQ(text, `x = ${n}`, distractors, 'index_laws',
      ['If the bases are equal, the powers must be equal too.', `${base}ˣ = ${base}${sup(n)}`],
      [{t:'Match the powers directly', x:`x = ${n}`}], `x = ${n}`);
  },


  /* ---------- GENERAL: LINEAR RELATIONS & MODELLING ---------- */
  general_linear(diff) {
    if (diff === 'easy') {
      const x1 = rnd(0,4), y1 = rnd(1,10), x2 = x1 + rnd(1,5), m = rndNZ(-6,6);
      const y2 = y1 + m*(x2-x1);
      const text = `Find the gradient of the line through (${x1}, ${y1}) and (${x2}, ${y2}).`;
      const correct = String(m);
      const distractors = [ String(-m), String(m + 1), fmt2((y2+y1)/(x2+x1 || 1)) ];
      return buildQ(text, correct, distractors, 'gradient_formula',
        ['Gradient m = (y₂ − y₁) / (x₂ − x₁).', `(${y2} − ${y1}) / (${x2} − ${x1})`],
        [{t:'Substitute into the gradient formula', x:`m = (${y2} − ${y1}) / (${x2} − ${x1})`}, {t:'Simplify', x:`m = ${y2-y1} / ${x2-x1}`}],
        `m = ${correct}`);
    }
    if (diff === 'medium') {
      const m = rndNZ(-5,5), x0 = rnd(1,6), y0 = rnd(1,12);
      const c = y0 - m*x0;
      const text = `A line has gradient ${m} and passes through (${x0}, ${y0}). Find its equation in the form y = mx + c.`;
      const correct = `y = ${m}x ${pmTerm(c,'')}`;
      const distractors = [ `y = ${m}x`, `y = ${-m}x ${pmTerm(c,'')}`, `y = ${m}x ${pmTerm(c+2,'')}` ];
      return buildQ(text, correct, distractors, 'line_equation',
        ['Substitute the gradient and point into y = mx + c, then solve for c.', `${y0} = ${m}(${x0}) + c`],
        [{t:'Substitute the point', x:`${y0} = ${m}×${x0} + c`}, {t:'Solve for c', x:`c = ${y0} − ${m*x0} = ${c}`}],
        correct);
    }
    // hard — simultaneous linear equations (break-even style)
    const m1 = rnd(2,6), m2 = rndNZ(1, m1-1 >= 1 ? m1-1 : 1);
    const xSol = rnd(2,8);
    const c2 = (m1-m2)*xSol; // line1: y = m1 x, line2: y = m2 x + c2, intersect at xSol
    const ySol = m1*xSol;
    const text = `Two plans cost y = ${m1}x and y = ${m2}x + ${c2}. Find the value of x where the plans cost the same.`;
    const distractors = [ String(xSol+1), String(Math.max(1,xSol-1)), String(ySol) ];
    return buildQ(text, String(xSol), distractors, 'line_equation',
      ['Set the two expressions equal to each other and solve for x.', `${m1}x = ${m2}x + ${c2}`],
      [{t:'Set equal', x:`${m1}x = ${m2}x + ${c2}`}, {t:'Solve for x', x:`${m1-m2}x = ${c2}  →  x = ${xSol}`}],
      `x = ${xSol}`);
  },

  /* ---------- GENERAL: BIVARIATE DATA (CORRELATION) ---------- */
  general_bivariate(diff) {
    if (diff === 'easy') {
      const vals = [0.92, 0.81, 0.63, 0.41, -0.35, -0.68, -0.88, 0.08];
      const r = vals[rnd(0, vals.length-1)];
      const strength = Math.abs(r) >= 0.75 ? 'strong' : (Math.abs(r) >= 0.4 ? 'moderate' : 'weak');
      const dir = r > 0.05 ? 'positive' : (r < -0.05 ? 'negative' : 'no');
      const correct = `${strength}, ${dir}`;
      const text = `A scatterplot has Pearson's correlation coefficient r = ${r}. Classify the strength and direction of the relationship.`;
      const opts = ['strong, positive','moderate, positive','weak, positive','strong, negative','moderate, negative','weak, negative'].filter(o=>o!==correct);
      const distractors = [opts[0], opts[1], opts[2]];
      return buildQ(text, correct, distractors, 'correlation',
        ['|r| ≥ 0.75: strong. 0.4 ≤ |r| < 0.75: moderate. |r| < 0.4: weak.', 'Positive r: variables increase together. Negative r: one increases as the other decreases.'],
        [{t:'Check the size of r', x:`|${r}| indicates ${strength}`}, {t:'Check the sign', x:`r ${r>0?'> 0':'< 0'} means ${dir}`}],
        correct);
    }
    if (diff === 'medium') {
      const b = rnd(2,9), a = rnd(1,20)*rsign();
      const xVal = rnd(2,10);
      const yPred = a + b*xVal;
      const text = `The least-squares line is ŷ = ${a} ${pmTerm(b,'x')}. Predict ŷ when x = ${xVal}.`;
      const distractors = [ String(yPred + b), String(yPred - a), String(a + b) ];
      return buildQ(text, String(yPred), distractors, 'regression_line',
        ['Substitute x into the regression equation.', `${a} + ${b} × ${xVal}`],
        [{t:'Substitute x', x:`ŷ = ${a} + ${b}×${xVal}`}, {t:'Simplify', x:`ŷ = ${yPred}`}],
        `ŷ = ${yPred}`);
    }
    // hard — gradient of least-squares line from r, sy, sx
    const r = fmt2(rnd(3,9)/10);
    const sy = rnd(4,12), sx = rnd(2,8);
    const b = Math.round((r*sy/sx)*100)/100;
    const text = `Given r = ${r}, sy = ${sy}, sx = ${sx}, find the gradient of the least-squares line using b = r × (sy/sx).`;
    const distractors = [ fmt2(b+1), fmt2(Math.max(0,b-1)), fmt2(r*sx/sy) ];
    return buildQ(text, fmt2(b), distractors, 'regression_line',
      ['Use b = r × (sy / sx).', `${r} × (${sy}/${sx})`],
      [{t:'Substitute the values', x:`b = ${r} × (${sy}/${sx})`}, {t:'Simplify', x:`b ≈ ${fmt2(b)}`}],
      `b ≈ ${fmt2(b)}`);
  },

  /* ---------- GENERAL: GRAPHS & NETWORKS ---------- */
  general_networks(diff) {
    if (diff === 'easy') {
      const v = rnd(4,8), e = rnd(v, v+4);
      const f = 2 - v + e;
      const text = `A connected planar graph has ${v} vertices and ${e} edges. Use Euler's formula (v − e + f = 2) to find the number of faces, f.`;
      const distractors = [ String(f+1), String(Math.max(1,f-1)), String(v+e-2) ];
      return buildQ(text, String(f), distractors, 'euler_formula',
        ["Euler's formula: v − e + f = 2.", `f = 2 − v + e = 2 − ${v} + ${e}`],
        [{t:"Rearrange Euler's formula", x:'f = 2 − v + e'}, {t:'Substitute', x:`f = 2 − ${v} + ${e} = ${f}`}],
        `f = ${f}`);
    }
    if (diff === 'medium') {
      const legs = [rnd(2,6), rnd(2,6), rnd(2,6)];
      const total = legs.reduce((s,x)=>s+x,0);
      const text = `A path from A to D passes through B and C, with edge weights AB = ${legs[0]}, BC = ${legs[1]}, CD = ${legs[2]}. Find the total length of the path.`;
      const distractors = [ String(total+1), String(total-1), String(total+3) ];
      return buildQ(text, String(total), distractors, 'shortest_path',
        ['Add up the weights of every edge along the path.', `${legs[0]} + ${legs[1]} + ${legs[2]}`],
        [{t:'Sum the edge weights', x:`${legs[0]} + ${legs[1]} + ${legs[2]} = ${total}`}], `Total = ${total}`);
    }
    // hard — minimum spanning tree total weight (4 sorted candidate edges, cheapest 3 chosen)
    const w = [rnd(1,4), rnd(2,5), rnd(3,6), rnd(6,9)].sort((a,b)=>a-b);
    const mst = w[0]+w[1]+w[2];
    const text = `A network connecting 4 towns has candidate roads of length ${w[0]}, ${w[1]}, ${w[2]} and ${w[3]} km. Using a greedy algorithm, the cheapest 3 non-cycle-forming roads are chosen to connect all 4 towns. Find the minimum total length.`;
    const distractors = [ String(mst + w[3]), String(mst+2), String(w[3]+w[2]+w[1]) ];
    return buildQ(text, String(mst), distractors, 'euler_formula',
      ['A minimum spanning tree for 4 vertices needs exactly 3 edges — pick the 3 cheapest that avoid a cycle.', `${w[0]} + ${w[1]} + ${w[2]}`],
      [{t:'Sort and take the 3 cheapest edges', x:`${w[0]} + ${w[1]} + ${w[2]} = ${mst}`}], `Minimum total = ${mst} km`);
  },

  /* ---------- GENERAL: VARIATION ---------- */
  general_variation(diff) {
    if (diff === 'easy') {
      const k = rnd(2,9), x = rnd(2,9);
      const y = k*x;
      const newX = rnd(2,9);
      const text = `y varies directly with x. If y = ${y} when x = ${x}, find y when x = ${newX}.`;
      const correct = String(k*newX);
      const distractors = [ String(k*newX + k), String(y+newX), String(Math.round(y/newX)) ];
      return buildQ(text, correct, distractors, 'direct_variation',
        ['Direct variation: y = kx. First find k.', `k = ${y}/${x} = ${k}`],
        [{t:'Find the constant k', x:`k = ${y}/${x} = ${k}`}, {t:'Substitute the new x', x:`y = ${k} × ${newX}`}],
        `y = ${k*newX}`);
    }
    if (diff === 'medium') {
      const newX = rnd(2,10), ansNew = rnd(3,15);
      const k = newX * ansNew; // guarantees clean division by construction, no search loop needed
      const x = rndNZ(2,10);
      const y = fmt2(k/x);
      const text = `y varies inversely with x. If y = ${y} when x = ${x}, find y when x = ${newX}.`;
      const correct = String(ansNew);
      const distractors = [ String(k*newX), String(ansNew+2), String(x*newX) ];
      return buildQ(text, correct, distractors, 'inverse_variation',
        ['Inverse variation: y = k/x. First find k = xy.', `k = ${x} × ${y} = ${k}`],
        [{t:'Find the constant k', x:`k = xy = ${x} × ${y} = ${k}`}, {t:'Substitute the new x', x:`y = ${k} / ${newX}`}],
        `y = ${ansNew}`);
    }
    // hard — joint variation z = kxy
    const k = rnd(2,6), x = rnd(2,5), y = rnd(2,5);
    const z = k*x*y;
    const newX = rnd(2,5), newY = rnd(2,5);
    const newZ = k*newX*newY;
    const text = `z varies jointly with x and y (z = kxy). If z = ${z} when x = ${x} and y = ${y}, find z when x = ${newX} and y = ${newY}.`;
    const distractors = [ String(newZ + k), String(k*(newX+newY)), String(z + newX + newY) ];
    return buildQ(text, String(newZ), distractors, 'direct_variation',
      ['Find k = z / (xy) first, then substitute the new x and y.', `k = ${z} / (${x}×${y}) = ${k}`],
      [{t:'Find k', x:`k = ${z}/(${x}×${y}) = ${k}`}, {t:'Substitute new values', x:`z = ${k} × ${newX} × ${newY}`}],
      `z = ${newZ}`);
  },

  /* ---------- GENERAL: MEASUREMENT, SCALE & SIMILARITY ---------- */
  general_measurement(diff) {
    if (diff === 'easy') {
      const s1 = rnd(3,8), s2 = rnd(2,6)+s1, scale = fmt2(s2/s1);
      const otherSide = rnd(3,10);
      const corresponding = fmt2(otherSide * (s2/s1));
      const text = `Two similar triangles have corresponding sides ${s1} cm and ${s2} cm. If a second side on the smaller triangle is ${otherSide} cm, find the corresponding side on the larger triangle.`;
      const distractors = [ fmt2(Number(corresponding)+1), fmt2(Math.max(0.1,Number(corresponding)-1)), String(otherSide) ];
      return buildQ(text, corresponding, distractors, 'similar_scale',
        ['Find the scale factor first: larger ÷ smaller.', `Scale factor = ${s2}/${s1} = ${scale}`],
        [{t:'Find the scale factor', x:`${s2}/${s1} = ${scale}`}, {t:'Multiply the given side by the scale factor', x:`${otherSide} × ${scale}`}],
        `${corresponding} cm`);
    }
    if (diff === 'medium') {
      const k = rnd(2,4);
      const areaRatio = k*k;
      const smallArea = rnd(4,12);
      const bigArea = smallArea * areaRatio;
      const text = `Two similar shapes have a linear scale factor of ${k}. If the smaller shape has an area of ${smallArea} cm², find the area of the larger shape.`;
      const distractors = [ String(smallArea*k), String(smallArea + k), String(bigArea + areaRatio) ];
      return buildQ(text, String(bigArea), distractors, 'similar_area_ratio',
        ['Area scale factor = (linear scale factor)².', `${k}² = ${areaRatio}`],
        [{t:'Square the linear scale factor', x:`${k}² = ${areaRatio}`}, {t:'Multiply the smaller area', x:`${smallArea} × ${areaRatio}`}],
        `${bigArea} cm²`);
    }
    // hard — similar solids, volume ratio = k^3
    const k = rnd(2,3);
    const volRatio = k*k*k;
    const smallVol = rnd(3,10);
    const bigVol = smallVol * volRatio;
    const text = `Two similar solids have a linear scale factor of ${k}. If the smaller solid has a volume of ${smallVol} cm³, find the volume of the larger solid.`;
    const distractors = [ String(smallVol*k*k), String(bigVol+k), String(smallVol+volRatio) ];
    return buildQ(text, String(bigVol), distractors, 'similar_volume_ratio',
      ['Volume scale factor = (linear scale factor)³.', `${k}³ = ${volRatio}`],
      [{t:'Cube the linear scale factor', x:`${k}³ = ${volRatio}`}, {t:'Multiply the smaller volume', x:`${smallVol} × ${volRatio}`}],
      `${bigVol} cm³`);
  },

  /* ---------- METHODS: QUADRATICS ---------- */
  methods_quadratics(diff) {
    if (diff === 'easy') {
      const a = rnd(1,3), b = rsign()*rnd(1,9), c = rsign()*rnd(1,9);
      const disc = b*b - 4*a*c;
      const nature = disc > 0 ? 'two real solutions' : (disc === 0 ? 'one real solution' : 'no real solutions');
      const text = `For ${a}x² ${pmTerm(b,'x')} ${pmTerm(c,'')} = 0, find the discriminant Δ and state the nature of the roots.`;
      const correct = `Δ = ${disc} (${nature})`;
      const distractors = [ `Δ = ${disc+4} (${disc+4>0?'two real solutions':'no real solutions'})`, `Δ = ${-disc} (${-disc>0?'two real solutions':(-disc===0?'one real solution':'no real solutions')})`, `Δ = ${disc} (${nature==='two real solutions'?'one real solution':'two real solutions'})` ];
      return buildQ(text, correct, distractors, 'discriminant_nature',
        ['Δ = b² − 4ac.', 'Δ > 0: two solutions. Δ = 0: one solution. Δ < 0: no real solutions.'],
        [{t:'Substitute into Δ = b² − 4ac', x:`Δ = (${b})² − 4(${a})(${c})`}, {t:'Simplify', x:`Δ = ${disc}`}],
        correct);
    }
    if (diff === 'medium') {
      const h = rsign()*rnd(1,6), k = rsign()*rnd(1,9), a = rndNZ(1,3);
      const text = `Write y = ${a}(x ${pmTerm(-h,'')})² ${pmTerm(k,'')} — state the turning point (vertex).`;
      const correct = `(${h}, ${k})`;
      const distractors = [ `(${-h}, ${k})`, `(${h}, ${-k})`, `(${k}, ${h})` ];
      return buildQ(text, correct, distractors, 'vertex_form',
        ['Turning point form: y = a(x − h)² + k has vertex (h, k).', `Here x − h matches x ${pmTerm(-h,'')}, so h = ${h}.`],
        [{t:'Read off h', x:`h = ${h}`}, {t:'Read off k', x:`k = ${k}`}], `Vertex = (${h}, ${k})`);
    }
    // hard — Vieta's formulas: sum and product of roots
    const a = rndNZ(1,3), b = rsign()*rnd(2,10), c = rsign()*rnd(2,10);
    const sum = fmt2(-b/a), prod = fmt2(c/a);
    const text = `For ${a}x² ${pmTerm(b,'x')} ${pmTerm(c,'')} = 0, find the sum of the roots (using sum = −b/a).`;
    const distractors = [ fmt2(Number(sum)+1), fmt2(Number(sum)-1), fmt2(b/a) ];
    return buildQ(text, sum, distractors, 'vieta_quadratic',
      ['For ax² + bx + c = 0: sum of roots = −b/a, product of roots = c/a.', `−(${b})/${a}`],
      [{t:'Apply sum = −b/a', x:`sum = −(${b})/${a}`}, {t:'Simplify', x:`sum = ${sum}`}],
      `Sum = ${sum} (product = ${prod})`);
  },

  /* ---------- METHODS: COORDINATE GEOMETRY ---------- */
  methods_coordgeom(diff) {
    if (diff === 'easy') {
      const x1=rnd(-5,5), y1=rnd(-5,5), x2=x1+rndNZ(-6,6), y2=y1+rndNZ(-6,6);
      const dx = x2-x1, dy = y2-y1;
      const g = (function gcd(a,b){a=Math.abs(a);b=Math.abs(b);return b?gcd(b,a%b):a;})(dy,dx) || 1;
      const m = fmt2(dy/dx);
      const text = `Find the gradient of the line joining A(${x1}, ${y1}) and B(${x2}, ${y2}).`;
      const distractors = [ fmt2(-dy/dx), fmt2(dy/dx + 1), fmt2(dy/dx - 1) ];
      return buildQ(text, m, distractors, 'gradient_formula',
        ['Gradient m = (y₂ − y₁)/(x₂ − x₁).', `(${y2} − ${y1})/(${x2} − ${x1})`],
        [{t:'Substitute the coordinates', x:`m = (${y2}-${y1})/(${x2}-${x1})`}, {t:'Simplify', x:`m = ${m}`}], `m = ${m}`);
    }
    if (diff === 'medium') {
      const x1=rnd(-6,6), y1=rnd(-6,6), x2=rnd(-6,6), y2=rnd(-6,6);
      const mx = fmt2((x1+x2)/2), my = fmt2((y1+y2)/2);
      const text = `Find the midpoint of A(${x1}, ${y1}) and B(${x2}, ${y2}).`;
      const correct = `(${mx}, ${my})`;
      const distractors = [ `(${fmt2(x1+x2)}, ${fmt2(y1+y2)})`, `(${my}, ${mx})`, `(${fmt2((x1-x2)/2)}, ${fmt2((y1-y2)/2)})` ];
      return buildQ(text, correct, distractors, 'midpoint',
        ['Midpoint = ((x₁+x₂)/2, (y₁+y₂)/2).', `((${x1}+${x2})/2, (${y1}+${y2})/2)`],
        [{t:'Average the x-coordinates', x:`(${x1}+${x2})/2 = ${mx}`}, {t:'Average the y-coordinates', x:`(${y1}+${y2})/2 = ${my}`}],
        correct);
    }
    // hard — perpendicular gradient
    const p = rndNZ(-6,6), q = rndNZ(1,6);
    const m = fmt2(p/q);
    const perp = fmt2(-q/p);
    const text = `A line has gradient m = ${m}. Find the gradient of a line perpendicular to it.`;
    const distractors = [ m, fmt2(Number(perp)+1), fmt2(Number(perp)-1) ];
    return buildQ(text, perp, distractors, 'perp_gradient',
      ['Perpendicular gradients multiply to give −1: m₁ × m₂ = −1.', `m₂ = −1 / ${m}`],
      [{t:'Take the negative reciprocal', x:`m₂ = −1/(${m})`}, {t:'Simplify', x:`m₂ = ${perp}`}], `Perpendicular gradient = ${perp}`);
  },

  /* ---------- METHODS: POLYNOMIALS ---------- */
  methods_polynomials(diff) {
    if (diff === 'easy') {
      const a = rnd(1,4), d = rsign()*rnd(1,9), x0 = rnd(2,4);
      const val = a*x0*x0*x0 + d;
      const text = `For f(x) = ${a}x³ ${pmTerm(d,'')}, find f(${x0}).`;
      const distractors = [ String(val + a), String(a*x0*x0 + d), String(val - d) ];
      return buildQ(text, String(val), distractors, 'polynomial_eval',
        ['Substitute x = ' + x0 + ' directly into the function.', `${a}(${x0})³ ${pmTerm(d,'')}`],
        [{t:'Cube x and multiply by a', x:`${a}×${x0}³ = ${a*x0*x0*x0}`}, {t:'Add the constant', x:`${a*x0*x0*x0} ${pmTerm(d,'')} = ${val}`}],
        `f(${x0}) = ${val}`);
    }
    if (diff === 'medium') {
      const r1 = rnd(1,4), r2 = rnd(1,4)+r1, r3 = rndNZ(-4,-1);
      const text = `A cubic is written in factorised form as (x − ${r1})(x − ${r2})(x ${pmTerm(-r3,'')}) = 0. Find all solutions for x.`;
      const correct = `x = ${r1}, ${r2}, ${r3}`;
      const distractors = [ `x = ${-r1}, ${-r2}, ${-r3}`, `x = ${r1}, ${r2}`, `x = ${r1+1}, ${r2}, ${r3}` ];
      return buildQ(text, correct, distractors, 'cubic_factor',
        ['Set each bracket equal to zero and solve.', `x − ${r1} = 0, x − ${r2} = 0, x ${pmTerm(-r3,'')} = 0`],
        [{t:'Solve each factor', x:`x = ${r1}, x = ${r2}, x = ${r3}`}], correct);
    }
    // hard — Vieta's for a monic cubic: sum of roots = -b/a (x³+bx²+cx+d)
    const b = rsign()*rnd(2,9);
    const text = `For the monic cubic x³ ${pmTerm(b,'x²')} + cx + d = 0, find the sum of its three roots (using sum = −b).`;
    const sum = -b;
    const distractors = [ String(b), String(-b+2), String(-b-2) ];
    return buildQ(text, String(sum), distractors, 'vieta_cubic',
      ['For a monic cubic x³ + bx² + cx + d, the sum of the roots equals −b.', `sum = −(${b})`],
      [{t:'Apply the rule sum = −b', x:`sum = −(${b}) = ${sum}`}], `Sum of roots = ${sum}`);
  },

  /* ---------- METHODS: TRANSFORMATIONS ---------- */
  methods_transformations(diff) {
    if (diff === 'easy') {
      const x0 = rnd(1,6), y0 = rnd(1,9), k = rsign()*rnd(1,8);
      const text = `The point (${x0}, ${y0}) lies on y = f(x). Find the corresponding point on y = f(x) + ${k>=0?k:'('+k+')'}.`;
      const correct = `(${x0}, ${y0+k})`;
      const distractors = [ `(${x0+k}, ${y0})`, `(${x0}, ${y0-k})`, `(${x0}, ${y0})` ];
      return buildQ(text, correct, distractors, 'transform_translate',
        ['y = f(x) + k shifts every point up (or down) by k, x stays the same.', `New y-coordinate = ${y0} + (${k})`],
        [{t:'Add k to the y-coordinate', x:`${y0} + (${k}) = ${y0+k}`}], correct);
    }
    if (diff === 'medium') {
      const x0 = rnd(1,6), y0 = rnd(1,9), h = rsign()*rnd(1,6);
      const text = `The point (${x0}, ${y0}) lies on y = f(x). Find the corresponding point on y = f(x ${pmTerm(-h,'')}).`;
      const correct = `(${x0+h}, ${y0})`;
      const distractors = [ `(${x0-h}, ${y0})`, `(${x0}, ${y0+h})`, `(${x0+h}, ${y0+h})` ];
      return buildQ(text, correct, distractors, 'transform_translate',
        ['y = f(x − h) shifts every point right (or left) by h, y stays the same.', `New x-coordinate = ${x0} + (${h})`],
        [{t:'Add h to the x-coordinate', x:`${x0} + (${h}) = ${x0+h}`}], correct);
    }
    // hard — combined dilation + translation
    const x0 = rnd(1,5), y0 = rnd(1,6), a = rndNZ(2,3), k = rsign()*rnd(1,6);
    const newY = a*y0 + k;
    const text = `The point (${x0}, ${y0}) lies on y = f(x). Find the corresponding point on y = ${a}f(x) ${pmTerm(k,'')}.`;
    const correct = `(${x0}, ${newY})`;
    const distractors = [ `(${x0}, ${a*y0})`, `(${x0*a}, ${newY})`, `(${x0}, ${y0+k})` ];
    return buildQ(text, correct, distractors, 'transform_combined',
      ['Multiply the y-coordinate by the dilation factor first, then add the vertical shift.', `${a} × ${y0} + (${k})`],
      [{t:'Dilate: multiply y by a', x:`${a} × ${y0} = ${a*y0}`}, {t:'Translate: add k', x:`${a*y0} + (${k}) = ${newY}`}],
      correct);
  },

  /* ---------- METHODS: COUNTING METHODS ---------- */
  methods_counting(diff) {
    function fact(n){ let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
    function nPr(n,r){ return fact(n)/fact(n-r); }
    function nCr(n,r){ return fact(n)/(fact(r)*fact(n-r)); }
    if (diff === 'easy') {
      const n = rnd(4,7), r = rnd(2, n-1);
      const ans = nPr(n,r);
      const text = `How many ways can ${r} people be arranged in order from a group of ${n} (i.e. find ${n}P${r})?`;
      const distractors = [ String(nCr(n,r)), String(ans + n), String(nPr(n, Math.max(1,r-1))) ];
      return buildQ(text, String(ans), distractors, 'permutation',
        ['Use nPr = n! / (n−r)!, since order matters.', `${n}! / ${n-r}!`],
        [{t:'Apply the permutation formula', x:`${n}P${r} = ${n}!/${n-r}!`}, {t:'Evaluate', x:`= ${ans}`}], `${ans} ways`);
    }
    if (diff === 'medium') {
      const n = rnd(5,9), r = rnd(2, n-2);
      const ans = nCr(n,r);
      const text = `A team of ${r} is chosen from ${n} students, where order doesn't matter. Find the number of possible teams (${n}C${r}).`;
      const distractors = [ String(nPr(n,r)), String(ans + r), String(Math.max(1,ans - n)) ];
      return buildQ(text, String(ans), distractors, 'combination',
        ['Use nCr = n! / (r!(n−r)!), since order doesn\u2019t matter.', `${n}! / (${r}! × ${n-r}!)`],
        [{t:'Apply the combination formula', x:`${n}C${r} = ${n}!/(${r}!${n-r}!)`}, {t:'Evaluate', x:`= ${ans}`}], `${ans} teams`);
    }
    // hard — multiplication principle, multi-stage choice
    const a = rnd(2,5), b = rnd(2,5), c = rnd(2,4);
    const ans = a*b*c;
    const text = `A student picks 1 main dish from ${a} options, 1 side from ${b} options, and 1 drink from ${c} options. How many different combinations are possible?`;
    const distractors = [ String(a+b+c), String(a*b+c), String(ans+a) ];
    return buildQ(text, String(ans), distractors, 'counting_principle',
      ['Multiplication principle: multiply the number of options at each independent stage.', `${a} × ${b} × ${c}`],
      [{t:'Multiply the choices at each stage', x:`${a} × ${b} × ${c} = ${ans}`}], `${ans} combinations`);
  },

  /* ---------- METHODS: DISCRETE PROBABILITY DISTRIBUTIONS ---------- */
  methods_discrete(diff) {
    function fact(n){ let r=1; for(let i=2;i<=n;i++) r*=i; return r; }
    function nCr(n,r){ return fact(n)/(fact(r)*fact(n-r)); }
    if (diff === 'easy') {
      // E(X) for a simple 3-outcome distribution with clean tenths probabilities
      const x1=0,x2=1,x3=2;
      const p1 = rnd(2,4), p3 = rnd(2,4), p2 = 10-p1-p3;
      const ex = fmt2((x1*p1 + x2*p2 + x3*p3)/10);
      const text = `A discrete random variable X has P(X=0)=0.${p1}, P(X=1)=0.${p2}, P(X=2)=0.${p3}. Find E(X).`;
      const distractors = [ fmt2(Number(ex)+0.5), fmt2(Number(ex)-0.5), fmt2(Number(ex)+1) ];
      return buildQ(text, ex, distractors, 'expected_value',
        ['E(X) = Σ x·P(x) — multiply each value by its probability, then add.', `0×0.${p1} + 1×0.${p2} + 2×0.${p3}`],
        [{t:'Multiply each x by its probability', x:`0×0.${p1} + 1×0.${p2} + 2×0.${p3}`}, {t:'Add the results', x:`E(X) = ${ex}`}],
        `E(X) = ${ex}`);
    }
    if (diff === 'medium') {
      const n = rnd(3,5), k = rnd(1,n-1), p = 0.5;
      const prob = nCr(n,k) * Math.pow(p,k) * Math.pow(1-p,n-k);
      const ans = fmt2(prob);
      const text = `X ~ Binomial(n=${n}, p=0.5). Find P(X=${k}) using P(X=k) = ⁿCₖ pᵏ(1−p)ⁿ⁻ᵏ.`;
      const distractors = [ fmt2(prob+0.1), fmt2(Math.max(0,prob-0.1)), fmt2(nCr(n,k)/Math.pow(2,n) + 0.05) ];
      return buildQ(text, ans, distractors, 'binomial_prob',
        ['P(X=k) = ⁿCₖ × pᵏ × (1−p)ⁿ⁻ᵏ.', `${n}C${k} × 0.5${sup(k)} × 0.5${sup(n-k)}`],
        [{t:'Find the combination', x:`${n}C${k} = ${nCr(n,k)}`}, {t:'Multiply by the probabilities', x:`× 0.5${sup(n)} = ${ans}`}],
        `P(X=${k}) = ${ans}`);
    }
    // hard — binomial mean or variance
    const n = rnd(10,30), p = fmt2(rnd(2,8)/10);
    const mean = fmt2(n*p);
    const variance = fmt2(n*p*(1-p));
    const text = `X ~ Binomial(n=${n}, p=${p}). Find the mean E(X) = np.`;
    const distractors = [ variance, fmt2(Number(mean)+2), fmt2(Math.max(0.1,Number(mean)-2)) ];
    return buildQ(text, mean, distractors, 'binomial_mean_var',
      ['Mean of a binomial distribution: E(X) = np.', `${n} × ${p}`],
      [{t:'Multiply n by p', x:`${n} × ${p} = ${mean}`}], `E(X) = ${mean} (Var(X) = ${variance})`);
  },

  /* ---------- METHODS: CIRCULAR FUNCTIONS ---------- */
  methods_circular(diff) {
    if (diff === 'easy') {
      const degOptions = [30,45,60,90,120,135,150,180,270,360];
      const deg = degOptions[rnd(0,degOptions.length-1)];
      const gcdVal = (function gcd(a,b){return b?gcd(b,a%b):a;})(deg,180);
      const num = deg/gcdVal, den = 180/gcdVal;
      const fmtFrac = (n,d) => d===1 ? `${n}π` : (n===1 ? `π/${d}` : `${n}π/${d}`);
      const correct = fmtFrac(num,den);
      const text = `Convert ${deg}° to radians (as a multiple of π).`;
      const distractors = [ fmtFrac(den, num||1), fmtFrac(num, den+1), fmtFrac(num+1, den) ];
      return buildQ(text, correct, distractors, 'deg_to_rad',
        ['Multiply degrees by π/180.', `${deg} × π/180`],
        [{t:'Multiply by π/180', x:`${deg} × π/180`}, {t:'Simplify the fraction', x:`= ${correct}`}], `${correct} rad`);
    }
    if (diff === 'medium') {
      const table = [
        {ang:'π/6', sin:'1/2', cos:'√3/2'}, {ang:'π/4', sin:'√2/2', cos:'√2/2'},
        {ang:'π/3', sin:'√3/2', cos:'1/2'}, {ang:'π/2', sin:'1', cos:'0'},
        {ang:'0', sin:'0', cos:'1'}, {ang:'π', sin:'0', cos:'−1'},
      ];
      const pick = table[rnd(0,table.length-1)];
      const askSin = Math.random()<0.5;
      const correct = askSin ? pick.sin : pick.cos;
      const otherVals = [...new Set(table.filter(t=>t!==pick).map(t=> askSin? t.sin : t.cos).filter(v=>v!==correct))];
      const shuffled = otherVals.sort(()=>Math.random()-0.5);
      const text = `Find ${askSin?'sin':'cos'}(${pick.ang}) using the exact-value triangle / unit circle.`;
      const distractors = [shuffled[0], shuffled[1], shuffled[2]];
      return buildQ(text, correct, distractors, 'exact_trig_value',
        ['Use the standard exact-value triangles (30-60-90 and 45-45-90) or the unit circle.', `${askSin?'sin':'cos'}(${pick.ang}) is a standard exact value.`],
        [{t:'Recall the exact value', x:`${askSin?'sin':'cos'}(${pick.ang}) = ${correct}`}], correct);
    }
    // hard — period of y = a sin(nx)
    const n = rnd(2,6);
    const a = rnd(1,5);
    const period = n===1 ? '2π' : `2π/${n}`;
    const text = `Find the period of y = ${a===1?'':a}sin(${n}x).`;
    const distractors = [ `${n}π`, `π/${n}`, `2π×${n}` ];
    return buildQ(text, period, distractors, 'period_formula',
      ['The period of y = a·sin(nx) is 2π/n — the amplitude a does not affect the period.', `2π/${n}`],
      [{t:'Apply the period formula', x:`Period = 2π/${n}`}], `Period = ${period}`);
  },
  /* ---------- SPECIALIST: CIRCULAR FUNCTIONS ---------- */
  specialist_circular(diff) {
    if (diff === 'easy') {
      const sinSq = rnd(2,8); // tenths, sin²θ = sinSq/10
      const cosSq10 = 10 - sinSq;
      const text = `If sin²θ = 0.${sinSq}, find cos²θ.`;
      const correct = `0.${cosSq10}`;
      const wrongVals = [1,2,3,4,5,6,7,8,9].filter(v=>v!==cosSq10);
      for (let i=wrongVals.length-1;i>0;i--){const j=rnd(0,i);[wrongVals[i],wrongVals[j]]=[wrongVals[j],wrongVals[i]];}
      const distractors = [ `0.${wrongVals[0]}`, `0.${wrongVals[1]}`, `0.${wrongVals[2]}` ];
      return buildQ(text, correct, distractors, 'pythagorean_identity',
        ['Use sin²θ + cos²θ = 1.', `cos²θ = 1 − 0.${sinSq}`],
        [{t:'Rearrange the identity', x:`cos²θ = 1 − sin²θ`}, {t:'Substitute', x:`cos²θ = 1 − 0.${sinSq}`}], `cos²θ = 0.${cosSq10}`);
    }
    if (diff === 'medium') {
      const cosSq = rnd(1,7);
      const sinSq10 = 10 - cosSq;
      const text = `If cos²θ = 0.${cosSq}, find sin²θ.`;
      const correct = `0.${sinSq10}`;
      const wrongVals2 = [1,2,3,4,5,6,7,8,9].filter(v=>v!==sinSq10);
      for (let i=wrongVals2.length-1;i>0;i--){const j=rnd(0,i);[wrongVals2[i],wrongVals2[j]]=[wrongVals2[j],wrongVals2[i]];}
      const distractors = [ `0.${wrongVals2[0]}`, `0.${wrongVals2[1]}`, `0.${wrongVals2[2]}` ];
      return buildQ(text, correct, distractors, 'pythagorean_identity',
        ['Use sin²θ + cos²θ = 1.', `sin²θ = 1 − 0.${cosSq}`],
        [{t:'Rearrange the identity', x:`sin²θ = 1 − cos²θ`}, {t:'Substitute', x:`sin²θ = 1 − 0.${cosSq}`}], `sin²θ = 0.${sinSq10}`);
    }
    // hard — double angle
    const sinV = rnd(2,5), cosV = rnd(2,5); // tenths, representing sinθ=sinV/10 etc (illustrative, not required to be a real angle)
    const result = 2 * sinV * cosV; // 2sinθcosθ scaled ×100 -> represents sin(2θ) in hundredths form
    const text = `If sinθ = 0.${sinV} and cosθ = 0.${cosV}, find sin(2θ) using sin(2θ) = 2 sinθ cosθ.`;
    const correct = fmt2(result/100);
    const distractors = [ fmt2((sinV+cosV)/10), fmt2(result/100 + 0.1), fmt2(sinV*cosV/100) ];
    return buildQ(text, correct, distractors, 'double_angle',
      ['Use sin(2θ) = 2 sinθ cosθ.', `2 × 0.${sinV} × 0.${cosV}`],
      [{t:'Substitute into the double angle formula', x:`sin(2θ) = 2 × 0.${sinV} × 0.${cosV}`}], `sin(2θ) = ${correct}`);
  },

  /* ---------- SPECIALIST: RELATED RATES ---------- */
  specialist_rates(diff) {
    if (diff === 'easy') {
      const dydx = rnd(2,9), dxdt = rnd(2,9);
      const dydt = dydx*dxdt;
      const text = `If dy/dx = ${dydx} and dx/dt = ${dxdt}, find dy/dt.`;
      const distractors = [ String(dydt+dxdt), String(Math.max(1,dydt-dxdt)), String(dydt+2*dxdt) ];
      return buildQ(text, String(dydt), distractors, 'related_rate',
        ['Use dy/dt = dy/dx × dx/dt.', `${dydx} × ${dxdt}`],
        [{t:'Substitute into the chain rule for rates', x:`dy/dt = ${dydx} × ${dxdt}`}], `dy/dt = ${dydt}`);
    }
    if (diff === 'medium') {
      const dydt = rnd(20,80), dxdt = rnd(2,8);
      // ensure clean division
      const dydx = Math.round(dydt/dxdt);
      const dydtClean = dydx*dxdt;
      const text = `If dy/dt = ${dydtClean} and dx/dt = ${dxdt}, find dy/dx.`;
      const distractors = [ String(dydx+2), String(Math.max(1,dydx-2)), String(dydx+4) ];
      return buildQ(text, String(dydx), distractors, 'related_rate',
        ['Rearrange dy/dt = dy/dx × dx/dt to solve for dy/dx.', 'dy/dx = (dy/dt) ÷ (dx/dt)'],
        [{t:'Rearrange and substitute', x:`dy/dx = ${dydtClean} / ${dxdt}`}], `dy/dx = ${dydx}`);
    }
    // hard — a short applied scenario
    const r = rnd(2,6), drdt = rnd(1,4);
    // Area of circle A = πr², dA/dt = 2πr × dr/dt — use π≈3 for clean-ish integer-flavoured teaching example
    const dAdt = Math.round(2*Math.PI*r*drdt);
    const text = `A circle's radius is growing at ${drdt} cm/s. When r = ${r} cm, find the rate of change of area (dA/dt), given A = πr² (nearest whole number, using dA/dt = 2πr·dr/dt).`;
    const distractors = [ String(dAdt+5), String(Math.max(1,dAdt-5)), String(dAdt+10) ];
    return buildQ(text, String(dAdt), distractors, 'related_rate',
      ['Differentiate A = πr² to get dA/dr = 2πr, then apply the chain rule.', 'dA/dt = dA/dr × dr/dt = 2πr × dr/dt'],
      [{t:'Find dA/dr', x:`dA/dr = 2πr = 2π×${r}`}, {t:'Multiply by dr/dt', x:`dA/dt = 2π×${r}×${drdt}`}], `dA/dt ≈ ${dAdt} cm²/s`);
  },
};

function generateQuestion(topicId, difficulty) {
  const gen = GENERATORS[topicId];
  if (!gen) return null;
  const q = gen(difficulty);
  q.topic = topicId;
  q.difficulty = difficulty;
  return q;
}
