/* ═══════════════════════════════════════════════════════════════
   VCE MATHS SUPPORT APP — SEED DATA (v2)
   Organised into 3 VCE subjects: General Maths, Methods, Specialist.
   Real (author-written) content — matches the Legal constraint from
   Task 2 (no copyrighted VCAA exam questions reused).
═══════════════════════════════════════════════════════════════ */

const SUBJECTS = [
  { id: 'general',    name: 'General Maths', short: 'General',    color: 'gold'    },
  { id: 'methods',    name: 'Methods',       short: 'Methods',    color: 'teal'    },
  { id: 'specialist', name: 'Specialist',    short: 'Specialist', color: 'violet'  },
];

const TOPICS = [
  /* ---------------- GENERAL MATHS ---------------- */
  { id: 'general_statistics', subject: 'general', name: 'Statistics',      examFreq: 3, icon: 'σ' },
  { id: 'general_finance',    subject: 'general', name: 'Financial Maths', examFreq: 3, icon: '$' },
  { id: 'general_matrices',   subject: 'general', name: 'Matrices',        examFreq: 2, icon: '▦' },
  { id: 'general_sequences',  subject: 'general', name: 'Sequences',       examFreq: 3, icon: 'n' },
  { id: 'general_trig',       subject: 'general', name: 'Trigonometry',    examFreq: 3, icon: '△' },
  { id: 'general_linear',      subject: 'general', name: 'Linear Relations',       examFreq: 4, icon: 'm' },
  { id: 'general_bivariate',   subject: 'general', name: 'Bivariate Data',         examFreq: 3, icon: 'r' },
  { id: 'general_networks',    subject: 'general', name: 'Graphs & Networks',      examFreq: 2, icon: 'G' },
  { id: 'general_variation',   subject: 'general', name: 'Variation',              examFreq: 3, icon: 'k' },
  { id: 'general_measurement', subject: 'general', name: 'Measurement & Similarity', examFreq: 3, icon: 'M' },

  /* ---------------- METHODS ---------------- */
  { id: 'calculus',    subject: 'methods', name: 'Calculus',            examFreq: 5, icon: '∫' },
  { id: 'probability', subject: 'methods', name: 'Probability',         examFreq: 4, icon: 'P' },
  { id: 'algebra',     subject: 'methods', name: 'Functions & Algebra', examFreq: 3, icon: 'x' },
  { id: 'methods_integration', subject: 'methods', name: 'Integration',              examFreq: 4, icon: '∮' },
  { id: 'methods_explog',      subject: 'methods', name: 'Exponentials & Logarithms', examFreq: 4, icon: 'e' },
  { id: 'methods_quadratics',      subject: 'methods', name: 'Quadratics',           examFreq: 5, icon: 'q' },
  { id: 'methods_coordgeom',       subject: 'methods', name: 'Coordinate Geometry',  examFreq: 3, icon: 'L' },
  { id: 'methods_polynomials',     subject: 'methods', name: 'Polynomials',          examFreq: 4, icon: 'p' },
  { id: 'methods_transformations', subject: 'methods', name: 'Transformations',      examFreq: 3, icon: 'T' },
  { id: 'methods_counting',        subject: 'methods', name: 'Counting Methods',     examFreq: 3, icon: '!' },
  { id: 'methods_discrete',        subject: 'methods', name: 'Discrete Prob. Dist.', examFreq: 4, icon: 'B' },
  { id: 'methods_circular',        subject: 'methods', name: 'Circular Functions',   examFreq: 4, icon: '⊙' },

  /* ---------------- SPECIALIST ---------------- */
  { id: 'vectors',               subject: 'specialist', name: 'Vectors',         examFreq: 4, icon: '→' },
  { id: 'specialist_complex',    subject: 'specialist', name: 'Complex Numbers', examFreq: 4, icon: 'i' },
  { id: 'specialist_mechanics',  subject: 'specialist', name: 'Mechanics',       examFreq: 3, icon: 'F' },
  { id: 'specialist_circular',   subject: 'specialist', name: 'Circular Functions', examFreq: 3, icon: '◐' },
  { id: 'specialist_rates',      subject: 'specialist', name: 'Related Rates',      examFreq: 3, icon: 'δ' },
];

function topicsFor(subjectId) {
  return subjectId === 'all' ? TOPICS : TOPICS.filter(t => t.subject === subjectId);
}
function subjectOf(topicId) {
  const t = TOPICS.find(t => t.id === topicId);
  return t ? t.subject : null;
}
function subjectColor(subjectId) {
  const s = SUBJECTS.find(s => s.id === subjectId);
  return s ? s.color : 'teal';
}

/* ── STUDY NOTES ─────────────────────────────────────────────── */
const NOTES = {
  calculus: {
    title: 'Differentiation Basics',
    summary: 'Differentiation finds the gradient (rate of change) of a function at any point. It is the foundation for optimisation, rates of change, and curve sketching questions in VCE Methods and Specialist.',
    keyPoints: [
      'The derivative of xⁿ is n·xⁿ⁻¹ (the power rule).',
      'The derivative of a constant is always 0.',
      'Derivatives of a sum can be found term by term.',
      'The chain rule handles composite functions: differentiate the outer function, then multiply by the derivative of the inner function.',
    ],
    formula: 'd/dx [xⁿ] = n·xⁿ⁻¹',
    worked: { problem: 'Find the derivative of f(x) = 3x² + 2x − 5', steps: [
      'Differentiate each term separately using the power rule.',
      'd/dx[3x²] = 3 × 2 × x¹ = 6x',
      'd/dx[2x] = 2 × 1 × x⁰ = 2',
      'd/dx[−5] = 0 (constants disappear)',
    ], answer: 'f′(x) = 6x + 2' },
    tip: 'VCAA loves combining differentiation with optimisation (finding a maximum/minimum). Always check: does the question ask for the derivative itself, or a value where the derivative equals zero?',
  },
  probability: {
    title: 'Conditional Probability',
    summary: 'Conditional probability asks: given that one event has already happened, what is the probability of another event? It is written P(A|B), read as "probability of A given B".',
    keyPoints: [
      'P(A|B) = P(A ∩ B) / P(B)',
      'Independent events: P(A|B) = P(A) — knowing B tells you nothing new about A.',
      'Two events are independent exactly when P(A) × P(B) = P(A ∩ B).',
      'Tree diagrams and Venn diagrams are the two main tools for these questions.',
    ],
    formula: 'P(A|B) = P(A ∩ B) / P(B)',
    worked: { problem: 'A bag has 5 red and 3 blue marbles. Two are drawn without replacement. Find P(2nd is blue | 1st is blue).', steps: [
      'After drawing 1 blue marble, 2 blue marbles remain out of 7 total.',
      'P(2nd blue | 1st blue) = remaining blue ÷ remaining total',
    ], answer: 'P = 2/7' },
    tip: 'When you see "given that", it is almost always a conditional probability question — go straight to the P(A|B) formula. When you see "independent", multiply the probabilities directly.',
  },
  algebra: {
    title: 'Solving Quadratics',
    summary: 'A quadratic equation has the form ax² + bx + c = 0. It can be solved by factorising, completing the square, or using the quadratic formula.',
    keyPoints: [
      'The quadratic formula works for every quadratic, even ones that don\u2019t factorise nicely.',
      'The discriminant Δ = b² − 4ac tells you how many real solutions exist.',
      'Δ > 0: two real solutions.  Δ = 0: one real solution.  Δ < 0: no real solutions.',
    ],
    formula: 'x = (−b ± √(b² − 4ac)) / 2a',
    worked: { problem: 'Solve x² + 2x − 8 = 0', steps: [
      'Try factorising first: find two numbers that multiply to −8 and add to 2 → 4 and −2.',
      '(x + 4)(x − 2) = 0',
      'Set each bracket to zero: x + 4 = 0  or  x − 2 = 0',
    ], answer: 'x = −4  or  x = 2' },
    tip: 'Always try factorising before jumping to the quadratic formula — it\u2019s faster when it works, and VCAA often designs questions to factorise nicely.',
  },
  general_statistics: {
    title: 'Normal Distribution',
    summary: 'The normal distribution is a symmetric bell-shaped curve used to model continuous data like heights or test scores. It is defined by its mean (μ) and standard deviation (σ).',
    keyPoints: [
      'About 68% of data lies within 1 standard deviation of the mean.',
      'About 95% of data lies within 2 standard deviations of the mean.',
      'About 99.7% of data lies within 3 standard deviations of the mean (the "68-95-99.7 rule").',
      'z = (x − μ) / σ converts a raw score to a standardised z-score.',
    ],
    formula: 'z = (x − μ) / σ',
    worked: { problem: 'Test scores are normally distributed with μ = 70, σ = 8. Find the z-score for a mark of 82.', steps: [
      'Use z = (x − μ) / σ with x = 82, μ = 70, σ = 8.',
      'z = (82 − 70) / 8 = 12 / 8',
    ], answer: 'z = 1.5' },
    tip: 'A positive z-score means the value is above the mean; negative means below. Always sanity-check the sign of your answer against this.',
  },
  general_finance: {
    title: 'Simple & Compound Interest',
    summary: 'Simple interest grows by the same amount every period. Compound interest grows on an increasing balance, since interest is added to the principal each period. Always convert the interest rate to a decimal before substituting.',
    keyPoints: [
      'I = Prt — simple interest, where r is the annual rate as a decimal and t is time in years.',
      'A = P(1+r)ⁿ — total amount under compound interest, where n is the number of compounding periods.',
      'Compound interest earned = A − P.',
      'Never round intermediate steps — only round your final dollar answer.',
    ],
    formula: 'A = P(1 + r)ⁿ',
    worked: { problem: '$800 is invested at 5% p.a. compound interest for 2 years. Find the total value.', steps: [
      'Convert the rate to a decimal: r = 0.05',
      'Substitute into A = P(1+r)ⁿ: A = 800 × (1.05)²',
      'A = 800 × 1.1025',
    ], answer: 'A = $882' },
    tip: 'Read carefully whether the question asks for the total amount (A) or just the interest earned (A − P) — this is the single most common way marks are lost in this topic.',
  },
  general_matrices: {
    title: 'Matrix Operations',
    summary: 'A matrix is a rectangular array of numbers. In General Maths you mainly need to add/subtract matrices (combine matching positions) and find the determinant of a 2×2 matrix, which tells you whether it has an inverse.',
    keyPoints: [
      'Add or subtract matrices by combining the numbers in matching positions.',
      'For a 2×2 matrix [[a,b],[c,d]], the determinant is ad − bc.',
      'A matrix has an inverse only if its determinant is not zero.',
      'Matrices must be the same size to add or subtract them.',
    ],
    formula: 'det [[a,b],[c,d]] = ad − bc',
    worked: { problem: 'Find the determinant of [[4,1],[2,3]].', steps: [
      'Identify a=4, b=1, c=2, d=3.',
      'Apply det = ad − bc: det = (4×3) − (1×2)',
    ], answer: 'det = 10' },
    tip: 'A determinant of zero is a special case — it means the matrix cannot be inverted. VCAA sometimes asks you to state this explicitly.',
  },
  vectors: {
    title: 'Vector Basics & Dot Product',
    summary: 'A vector has both magnitude (size) and direction. In VCE, vectors are usually written in component form, e.g. a = 3i + 4j, and used to describe position, velocity, or force.',
    keyPoints: [
      'Magnitude of a = xi + yj is |a| = √(x² + y²)',
      'Dot product: a·b = a₁b₁ + a₂b₂',
      'Two vectors are perpendicular if a·b = 0',
      'The angle between two vectors: cos θ = (a·b) / (|a||b|)',
    ],
    formula: '|a| = √(x² + y²)   |   a·b = a₁b₁ + a₂b₂',
    worked: { problem: 'Find the magnitude of a = 3i + 4j', steps: [
      'Use |a| = √(x² + y²) with x = 3, y = 4.',
      '|a| = √(3² + 4²) = √(9 + 16) = √25',
    ], answer: '|a| = 5' },
    tip: 'Sketching the vector on a quick diagram (even a rough one) makes direction/angle questions much easier to check for silly sign errors.',
  },
  specialist_complex: {
    title: 'Complex Numbers',
    summary: 'A complex number has the form a + bi, where i = √−1. You add/subtract by combining real and imaginary parts separately, and multiply using normal expansion, remembering i² = −1.',
    keyPoints: [
      'Add or subtract complex numbers by combining real parts and imaginary parts separately.',
      'To multiply, expand normally (like brackets), then simplify using i² = −1.',
      'The modulus |a+bi| = √(a²+b²) is the "size" of a complex number.',
      'The conjugate of a+bi is a−bi — used to simplify division.',
    ],
    formula: '|a + bi| = √(a² + b²)',
    worked: { problem: 'Simplify (2+3i) + (4−i)', steps: [
      'Add the real parts: 2 + 4 = 6',
      'Add the imaginary parts: 3 + (−1) = 2',
    ], answer: '6 + 2i' },
    tip: 'The most common slip is forgetting that i² = −1 when expanding brackets — always double-check this step in multiplication questions.',
  },
  specialist_mechanics: {
    title: 'Newton\u2019s Second Law',
    summary: 'Mechanics in VCE Specialist connects force, mass, and acceleration. Newton\u2019s Second Law, F = ma, is the central formula — when multiple forces act, find the net force first.',
    keyPoints: [
      'F = ma, where F is net force (N), m is mass (kg), a is acceleration (m/s²).',
      'If multiple forces act along the same line, find the net force by adding/subtracting them first.',
      'A net force of zero means zero acceleration (the object moves at constant velocity, or stays still).',
      'Always keep units consistent: kilograms, metres, seconds, newtons.',
    ],
    formula: 'F = ma',
    worked: { problem: 'A 4 kg object has two horizontal forces acting on it: 18 N forward and 6 N backward. Find its acceleration.', steps: [
      'Find the net force: 18 − 6 = 12 N',
      'Apply F = ma, rearranged to a = F/m: a = 12 / 4',
    ], answer: 'a = 3 m/s²' },
    tip: 'Always find the net force first when more than one force is mentioned — using just one of the given forces in F=ma is the most common error in this topic.',
  },
  general_sequences: {
    title: 'Arithmetic & Geometric Sequences',
    summary: 'A sequence is a list of numbers following a pattern. Arithmetic sequences add the same amount each time; geometric sequences multiply by the same factor each time.',
    keyPoints: [
      'Arithmetic: tₙ = a + (n−1)d, where a is the first term and d is the common difference.',
      'Geometric: tₙ = a·rⁿ⁻¹, where r is the common ratio.',
      'Check the type first: subtract consecutive terms (arithmetic) or divide them (geometric) to find the pattern.',
      'n always refers to the term\u2019s position (1st, 2nd, 3rd…), not its value.',
    ],
    formula: 'tₙ = a + (n−1)d   |   tₙ = a·rⁿ⁻¹',
    worked: { problem: 'Find the 6th term of the arithmetic sequence 4, 7, 10, 13, …', steps: [
      'Identify a = 4 and d = 3 (each term increases by 3).',
      'Substitute into tₙ = a + (n−1)d with n = 6.',
      't₆ = 4 + (6−1)×3 = 4 + 15',
    ], answer: 't₆ = 19' },
    tip: 'A common mistake is using n instead of (n−1) in the formula — double check you\u2019re counting the number of steps taken, not the term number itself.',
  },
  general_trig: {
    title: 'Right-Angled Triangle Trigonometry',
    summary: 'For right-angled triangles, Pythagoras\u2019 theorem relates the three sides, and SOH-CAH-TOA relates an angle to two of the sides.',
    keyPoints: [
      'Pythagoras: c² = a² + b² (c is always the hypotenuse, the longest side).',
      'SOH: sinθ = opposite/hypotenuse',
      'CAH: cosθ = adjacent/hypotenuse',
      'TOA: tanθ = opposite/adjacent',
    ],
    formula: 'c² = a² + b²',
    worked: { problem: 'A right-angled triangle has legs of 6 cm and 8 cm. Find the hypotenuse.', steps: [
      'Apply Pythagoras: c² = 6² + 8²',
      'c² = 36 + 64 = 100',
    ], answer: 'c = 10 cm' },
    tip: 'Always identify the hypotenuse first (it\u2019s opposite the right angle) — using the wrong side as c is the most common error in this topic.',
  },
  methods_integration: {
    title: 'Integration Basics',
    summary: 'Integration is the reverse of differentiation. It\u2019s used to find the original function from its derivative, and later, areas under curves.',
    keyPoints: [
      '∫xⁿ dx = xⁿ⁺¹/(n+1) + c, for n ≠ −1.',
      'Always add the constant of integration, +c, for indefinite integrals.',
      'Integrate term by term, just like differentiation.',
      'A definite integral (with limits) does not need the +c, since it cancels out.',
    ],
    formula: '∫xⁿ dx = xⁿ⁺¹/(n+1) + c',
    worked: { problem: 'Find ∫4x³ dx', steps: [
      'Increase the power by 1: x³ becomes x⁴.',
      'Divide by the new power: 4x⁴/4 = x⁴.',
      'Add the constant of integration.',
    ], answer: 'x⁴ + c' },
    tip: 'Forgetting the +c on an indefinite integral is one of the most commonly lost marks in VCE — make it a habit to always write it.',
  },
  methods_explog: {
    title: 'Exponential & Logarithm Laws',
    summary: 'Index laws let you simplify expressions with powers; logarithms are the inverse of exponentials and follow their own set of laws.',
    keyPoints: [
      'aᵐ × aⁿ = aᵐ⁺ⁿ  (multiplying same base: add powers)',
      'aᵐ ÷ aⁿ = aᵐ⁻ⁿ  (dividing same base: subtract powers)',
      'log(ab) = log(a) + log(b)',
      'If aˣ = aⁿ (same base), then x = n.',
    ],
    formula: 'aᵐ × aⁿ = aᵐ⁺ⁿ',
    worked: { problem: 'Simplify 2⁵ × 2³', steps: [
      'Same base (2), so add the powers.',
      '2⁵ × 2³ = 2⁵⁺³ = 2⁸',
    ], answer: '2⁸ (= 256)' },
    tip: 'Index laws only work directly when the base is the same on both sides — check this before adding or subtracting powers.',
  },
  specialist_circular: {
    title: 'Circular Functions & Identities',
    summary: 'Circular (trigonometric) functions extend sin, cos and tan beyond right-angled triangles. VCE Specialist relies heavily on the Pythagorean identity and angle formulas.',
    keyPoints: [
      'Pythagorean identity: sin²θ + cos²θ = 1, true for every angle θ.',
      'Double angle: sin(2θ) = 2 sinθ cosθ',
      'Exact values worth memorising: sin(30°)=0.5, cos(60°)=0.5, sin(90°)=1.',
      'This identity lets you find cos²θ directly if you know sin²θ, and vice versa.',
    ],
    formula: 'sin²θ + cos²θ = 1',
    worked: { problem: 'If sinθ = 0.6, find cos²θ.', steps: [
      'Use sin²θ + cos²θ = 1.',
      'cos²θ = 1 − sin²θ = 1 − 0.6²',
      'cos²θ = 1 − 0.36',
    ], answer: 'cos²θ = 0.64' },
    tip: 'Remember sin²θ means (sinθ)², not sin(θ²) — mixing these up is a very common misread in exams.',
  },
  specialist_rates: {
    title: 'Related Rates of Change',
    summary: 'Related rates connect how fast two quantities change with respect to time, using the chain rule. If y depends on x, and x changes with time, this lets you find how fast y changes too.',
    keyPoints: [
      'dy/dt = dy/dx × dx/dt — the chain rule applied to rates.',
      'Identify what\u2019s given (a known rate) and what\u2019s being asked (an unknown rate).',
      'dy/dx usually comes from differentiating a relationship between y and x.',
      'Always keep track of units (e.g. cm/s, m²/s) to sanity-check your answer.',
    ],
    formula: 'dy/dt = dy/dx × dx/dt',
    worked: { problem: 'If dy/dx = 5 and dx/dt = 2, find dy/dt.', steps: [
      'Apply the chain rule for rates: dy/dt = dy/dx × dx/dt.',
      'Substitute the known values: dy/dt = 5 × 2',
    ], answer: 'dy/dt = 10' },
    tip: 'Write down which rate you know and which you want to find before substituting anything — related rates questions are mostly about correctly setting up this chain, not complex algebra.',
  },
  general_linear: {
    title: 'Linear Relations & Modelling',
    summary: 'A linear relation graphs as a straight line. It is defined by its gradient (steepness) and its y-intercept, and is widely used to model real-world costs, growth and comparisons.',
    keyPoints: [
      'Gradient: m = (y₂ − y₁) / (x₂ − x₁).',
      'Equation of a line: y = mx + c, where c is the y-intercept.',
      'A positive gradient slopes up left-to-right; a negative gradient slopes down.',
      'Two linear models can be compared by setting them equal to each other and solving — this finds the break-even point.',
    ],
    formula: 'y = mx + c',
    worked: { problem: 'A line has gradient 3 and passes through (2, 5). Find its equation.', steps: [
      'Substitute into y = mx + c: 5 = 3(2) + c',
      '5 = 6 + c',
      'c = −1',
    ], answer: 'y = 3x − 1' },
    tip: 'When comparing two cost/plan models, "same cost" always means setting the two y-expressions equal to each other — this is one of the most common General Maths exam scenarios.',
  },
  general_bivariate: {
    title: 'Investigating Relationships Between Two Numerical Variables',
    summary: 'Bivariate data analysis studies the relationship between two numerical variables using a scatterplot, the correlation coefficient r, and the least-squares regression line.',
    keyPoints: [
      "Pearson's correlation coefficient r ranges from −1 to 1.",
      '|r| ≥ 0.75: strong. 0.4 ≤ |r| < 0.75: moderate. |r| < 0.4: weak.',
      'The sign of r shows direction: positive means both variables increase together; negative means one increases as the other decreases.',
      'The least-squares line ŷ = a + bx is used to predict y-values, with gradient b = r × (sy/sx).',
    ],
    formula: 'b = r × (sy / sx)',
    worked: { problem: 'The least-squares line is ŷ = 10 + 2x. Predict ŷ when x = 5.', steps: [
      'Substitute x = 5 into the equation.',
      'ŷ = 10 + 2(5)',
    ], answer: 'ŷ = 20' },
    tip: 'A strong correlation does NOT prove one variable causes the other — VCAA regularly tests this "correlation is not causation" idea in short-answer questions.',
  },
  general_networks: {
    title: 'Graphs & Networks',
    summary: 'A network is made of vertices (points) connected by edges (lines), often with weights representing cost, time or distance. Networks are used to model shortest paths and minimum-cost connections.',
    keyPoints: [
      "Euler's formula for a connected planar graph: v − e + f = 2 (vertices, edges, faces).",
      'The degree of a vertex is the number of edges connected to it.',
      'A shortest path is found by adding the weights of the edges along a route.',
      'A minimum spanning tree connects every vertex using the smallest possible total edge weight, with no cycles.',
    ],
    formula: 'v − e + f = 2',
    worked: { problem: 'A connected planar graph has 6 vertices and 8 edges. Find the number of faces.', steps: [
      "Rearrange Euler's formula: f = 2 − v + e",
      'f = 2 − 6 + 8',
    ], answer: 'f = 4' },
    tip: 'For minimum spanning tree questions, always sort the edge weights from smallest to largest first, then add them one at a time, skipping any edge that would create a cycle.',
  },
  general_variation: {
    title: 'Variation (Direct, Inverse & Joint)',
    summary: 'Variation describes how one quantity changes in response to another. Direct variation means they grow together; inverse variation means one grows as the other shrinks.',
    keyPoints: [
      'Direct variation: y = kx — y increases proportionally with x.',
      'Inverse variation: y = k/x — y decreases as x increases.',
      'Joint variation: z = kxy — z depends on two variables at once.',
      'Always find the constant k first using the given information, then substitute the new value.',
    ],
    formula: 'y = kx   |   y = k/x',
    worked: { problem: 'y varies directly with x. If y = 20 when x = 4, find y when x = 7.', steps: [
      'Find k: k = y/x = 20/4 = 5',
      'Substitute the new x: y = 5 × 7',
    ], answer: 'y = 35' },
    tip: 'Read the question carefully for the word "directly" vs "inversely" — using the wrong formula shape (kx vs k/x) is the most common error in this topic.',
  },
  general_measurement: {
    title: 'Measurement, Scale & Similarity',
    summary: 'When two shapes or solids are similar, their linear measurements share a constant scale factor. Area and volume scale differently to length, which is a key VCE exam idea.',
    keyPoints: [
      'Linear scale factor k: corresponding lengths are multiplied by k.',
      'Area scale factor = k² — areas grow with the square of the scale factor.',
      'Volume scale factor = k³ — volumes grow with the cube of the scale factor.',
      'Always find the scale factor from the given corresponding lengths first.',
    ],
    formula: 'Area ratio = k²,  Volume ratio = k³',
    worked: { problem: 'Two similar solids have a linear scale factor of 2. The smaller volume is 12 cm³. Find the larger volume.', steps: [
      'Volume scale factor = 2³ = 8',
      'Multiply the smaller volume by 8.',
    ], answer: '96 cm³' },
    tip: 'A very common mistake is using the linear scale factor directly for an area or volume question — always square it for area, cube it for volume.',
  },
  methods_quadratics: {
    title: 'Quadratics — Discriminant, Turning Point & Roots',
    summary: 'Beyond solving ax² + bx + c = 0, VCE Methods asks you to describe the nature of the roots (using the discriminant), find the turning point, and use the relationships between roots and coefficients.',
    keyPoints: [
      'Discriminant: Δ = b² − 4ac. Δ > 0: two real roots. Δ = 0: one real root. Δ < 0: no real roots.',
      'Turning point form: y = a(x − h)² + k has vertex (h, k).',
      "Vieta's formulas: sum of roots = −b/a, product of roots = c/a.",
      'A positive leading coefficient a means the parabola opens upward (minimum turning point).',
    ],
    formula: 'Δ = b² − 4ac',
    worked: { problem: 'Find the discriminant of 2x² + 3x − 5 = 0 and state the nature of its roots.', steps: [
      'Δ = b² − 4ac = 3² − 4(2)(−5)',
      'Δ = 9 + 40 = 49',
    ], answer: 'Δ = 49 > 0, so two real solutions' },
    tip: "Vieta's formulas let you answer \"sum/product of roots\" questions instantly without solving the quadratic at all — much faster under exam pressure.",
  },
  methods_coordgeom: {
    title: 'Coordinate Geometry',
    summary: 'Coordinate geometry uses algebra to describe lines and points on the Cartesian plane — gradient, midpoint, distance, and the special relationship between perpendicular lines.',
    keyPoints: [
      'Gradient: m = (y₂ − y₁) / (x₂ − x₁).',
      'Midpoint: ((x₁+x₂)/2, (y₁+y₂)/2).',
      'Perpendicular lines: m₁ × m₂ = −1 (gradients are negative reciprocals).',
      'Parallel lines always have exactly the same gradient.',
    ],
    formula: 'm₁ × m₂ = −1 (perpendicular)',
    worked: { problem: 'A line has gradient 2/3. Find the gradient of a line perpendicular to it.', steps: [
      'Take the negative reciprocal of 2/3.',
    ], answer: 'm = −3/2' },
    tip: 'Perpendicular gradient questions are almost always solved in one line: flip the fraction and change the sign. Don\u2019t overcomplicate it.',
  },
  methods_polynomials: {
    title: 'Polynomials (Cubics & Quartics)',
    summary: 'Polynomials extend quadratics to higher powers of x. Key skills are evaluating a polynomial at a given x, working with factorised form, and using the sum/product of roots relationships.',
    keyPoints: [
      'To evaluate f(a), substitute x = a directly into the polynomial.',
      'A factorised cubic (x − p)(x − q)(x − r) = 0 has solutions x = p, q, r.',
      'For a monic cubic x³ + bx² + cx + d, the sum of its roots equals −b.',
      'The factor theorem: if f(a) = 0, then (x − a) is a factor of f(x).',
    ],
    formula: 'f(a) = 0  ⇒  (x − a) is a factor',
    worked: { problem: 'Solve (x − 2)(x − 5)(x + 3) = 0.', steps: [
      'Set each factor to zero.',
      'x − 2 = 0, x − 5 = 0, x + 3 = 0',
    ], answer: 'x = 2, 5, −3' },
    tip: 'When a cubic is already given in factorised form, don\u2019t expand it — just read the roots straight off each bracket.',
  },
  methods_transformations: {
    title: 'Transformations of Graphs',
    summary: 'A transformation changes the position or shape of a graph without changing its fundamental type. VCE Methods focuses on translations (shifts) and dilations (stretches).',
    keyPoints: [
      'y = f(x) + k: vertical translation — shifts every point up (k>0) or down (k<0).',
      'y = f(x − h): horizontal translation — shifts every point right (h>0) or left (h<0).',
      'y = a·f(x): vertical dilation — stretches (|a|>1) or compresses (|a|<1) away from the x-axis.',
      'Transformations combine in order: dilate first, then translate.',
    ],
    formula: 'y = a·f(x − h) + k',
    worked: { problem: 'The point (2, 5) lies on y = f(x). Find the image point on y = f(x) − 3.', steps: [
      'Only the y-coordinate changes for a vertical translation.',
      'New y = 5 − 3',
    ], answer: '(2, 2)' },
    tip: 'Track the x and y coordinates separately: horizontal changes (± h inside the brackets) only move x; vertical changes (± k outside, ×a outside) only move/scale y.',
  },
  methods_counting: {
    title: 'Counting Methods (Permutations & Combinations)',
    summary: 'Counting methods work out how many different arrangements or selections are possible, without listing every single one. The key question is always: does order matter?',
    keyPoints: [
      'Permutations (order matters): nPr = n! / (n − r)!',
      'Combinations (order doesn\u2019t matter): nCr = n! / (r!(n − r)!)',
      'Multiplication principle: if there are multiple independent stages, multiply the number of options at each stage.',
      '"Arrange" or "in order" signals permutations; "choose" or "select a group" signals combinations.',
    ],
    formula: 'nCr = n! / (r!(n−r)!)',
    worked: { problem: 'A committee of 3 is chosen from 8 people. How many possible committees are there?', steps: [
      'Order doesn\u2019t matter, so use combinations: 8C3',
      '8C3 = 8! / (3! × 5!)',
    ], answer: '56 committees' },
    tip: 'The single fastest way to pick the right formula: ask "if I picked the same people in a different order, would that count as a different outcome?" Yes → permutation. No → combination.',
  },
  methods_discrete: {
    title: 'Discrete Probability Distributions',
    summary: 'A discrete random variable takes specific separate values, each with its own probability. The binomial distribution is the key example — modelling a fixed number of independent yes/no trials.',
    keyPoints: [
      'Expected value: E(X) = Σ x·P(x).',
      'Binomial distribution X ~ Bi(n, p): a fixed number of n independent trials, each with success probability p.',
      'Binomial probability: P(X=k) = ⁿCₖ pᵏ(1−p)ⁿ⁻ᵏ.',
      'Binomial mean and variance: E(X) = np, Var(X) = np(1−p).',
    ],
    formula: 'P(X=k) = ⁿCₖ pᵏ(1−p)ⁿ⁻ᵏ',
    worked: { problem: 'X ~ Binomial(n=4, p=0.5). Find P(X=2).', steps: [
      'P(X=2) = 4C2 × 0.5² × 0.5²',
      '4C2 = 6',
    ], answer: 'P(X=2) = 6 × 0.25 × 0.25 = 0.375' },
    tip: 'Always check the three binomial conditions before using the formula: fixed number of trials, only two outcomes each time, and the same probability p every trial.',
  },
  methods_circular: {
    title: 'Circular Functions (Radians & the Unit Circle)',
    summary: 'VCE Methods works with angles in radians rather than degrees, and uses the exact values of sin and cos at standard angles (0, π/6, π/4, π/3, π/2…) constantly throughout the course.',
    keyPoints: [
      'Convert degrees to radians: multiply by π/180.',
      'Exact values worth memorising: sin(π/6)=1/2, sin(π/4)=√2/2, sin(π/3)=√3/2, sin(π/2)=1.',
      'The period of y = a sin(nx) or y = a cos(nx) is 2π/n — the amplitude a does not affect the period.',
      'The unit circle has radius 1, so cos(θ) and sin(θ) are literally the x and y coordinates of the point at angle θ.',
    ],
    formula: 'Period of a sin(nx) = 2π/n',
    worked: { problem: 'Find the period of y = 4 sin(3x).', steps: [
      'Only the coefficient of x (n=3) affects the period, not the amplitude (4).',
      'Period = 2π/n = 2π/3',
    ], answer: 'Period = 2π/3' },
    tip: 'Degrees vs radians mix-ups are one of the most common VCE Methods errors — check your calculator mode matches the units in the question before you start.',
  },
};

/* ── FORMULA BANK (for Bound Reference Generator) ───────────────
   Each formula the student gets wrong is tagged; when a formula
   tag reaches 2+ misses, it is auto-added to the bound reference. */
const FORMULAS = {
  power_rule:        'd/dx [xⁿ] = n·xⁿ⁻¹',
  chain_rule:         'dy/dx = dy/du × du/dx',
  cond_prob:          'P(A|B) = P(A ∩ B) / P(B)',
  addition:           'P(A∪B) = P(A) + P(B) − P(A∩B)',
  independence:       'A, B independent ⇔ P(A)×P(B) = P(A∩B)',
  vector_mag:         '|a| = √(x² + y²)',
  dot_product:        'a·b = a₁b₁ + a₂b₂',
  angle_between:       'cosθ = (a·b) / (|a||b|)',
  z_score:            'z = (x − μ) / σ',
  quadratic_formula:  'x = (−b ± √(b² − 4ac)) / 2a',
  discriminant:       'Δ = b² − 4ac',
  simple_interest:    'I = P × r × t',
  compound_interest:  'A = P(1 + r)ⁿ',
  determinant:        'det [[a,b],[c,d]] = ad − bc',
  complex_add:        'Add real & imaginary parts separately',
  complex_mod:        '|a + bi| = √(a² + b²)',
  newtons_second:      'F = ma',
  arithmetic_seq:      'tₙ = a + (n−1)d',
  geometric_seq:       'tₙ = a·rⁿ⁻¹',
  pythagoras:          'c² = a² + b²',
  trig_ratio:          'sinθ = opp/hyp, cosθ = adj/hyp, tanθ = opp/adj',
  power_rule_integ:    '∫xⁿ dx = xⁿ⁺¹/(n+1) + c',
  index_laws:          'aᵐ × aⁿ = aᵐ⁺ⁿ',
  log_laws:            'log(ab) = log(a) + log(b)',
  pythagorean_identity: 'sin²θ + cos²θ = 1',
  double_angle:        'sin(2θ) = 2 sinθ cosθ',
  related_rate:        'dy/dt = dy/dx × dx/dt',

  /* --- new tags (General Maths & Methods Units 1&2 expansion) --- */
  gradient_formula:    'm = (y₂ − y₁) / (x₂ − x₁)',
  line_equation:       'y = mx + c',
  midpoint:            '((x₁+x₂)/2, (y₁+y₂)/2)',
  perp_gradient:       'm₁ × m₂ = −1',
  correlation:         "Pearson's r: −1 ≤ r ≤ 1",
  regression_line:     'b = r × (sy / sx)',
  euler_formula:       'v − e + f = 2',
  shortest_path:       'Sum the edge weights along the route',
  direct_variation:    'y = kx',
  inverse_variation:   'y = k/x',
  similar_scale:       'Scale factor k = larger length ÷ smaller length',
  similar_area_ratio:  'Area ratio = k²',
  similar_volume_ratio: 'Volume ratio = k³',
  discriminant_nature: 'Δ = b² − 4ac (nature of roots)',
  vertex_form:         'y = a(x − h)² + k, vertex (h,k)',
  vieta_quadratic:     'sum = −b/a, product = c/a',
  polynomial_eval:     'Substitute x = a into f(x)',
  cubic_factor:        '(x−p)(x−q)(x−r)=0 ⇒ x = p, q, r',
  vieta_cubic:         'Monic cubic: sum of roots = −b',
  transform_translate: 'y = f(x−h)+k (horizontal h, vertical k)',
  transform_combined:  'y = a·f(x−h)+k',
  permutation:          'nPr = n! / (n−r)!',
  combination:          'nCr = n! / (r!(n−r)!)',
  counting_principle:  'Multiply the options at each independent stage',
  expected_value:      'E(X) = Σ x·P(x)',
  binomial_prob:       'P(X=k) = ⁿCₖ pᵏ(1−p)ⁿ⁻ᵏ',
  binomial_mean_var:   'E(X) = np, Var(X) = np(1−p)',
  deg_to_rad:          'radians = degrees × π/180',
  exact_trig_value:    'Standard unit-circle exact values',
  period_formula:      'Period of a·sin(nx) = 2π/n',
};

/* NOTE: The static QUESTIONS array that used to live here has been removed.
   Practice questions are now generated procedurally and unlimited — see
   generators.js. Static formula/topic/note content above is unaffected. */
