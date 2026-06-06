const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../quiz.js'), 'utf8');
const m = src.match(/const STAGES=\[[\s\S]*?\];\n/);
const header = `/** Quiz data — Triết học Mác-Lênin */\n${m[0].replace('const STAGES=', 'export const STAGES=')}\n`;
const footer = `
export const CONFIG = {
  TIMER_SEC: 30,
  LOADING_MS: 900,
  POINTS_BASE: 100,
  POINTS_SPEED_BONUS: 50,
  LETTERS: ['A','B','C','D'],
  ANSWER_COLORS: ['#e21b3c','#1368ce','#d89e00','#26890c'],
  ANSWER_SHAPES: ['▲','◆','●','■'],
};

export const FAKE_LB = [
  { name: 'Minh Phúc', s: 1450 },
  { name: 'Thanh Hà', s: 1320 },
  { name: 'Quốc Bảo', s: 1200 },
  { name: 'Lan Anh', s: 1050 },
];

export const RANKS = [
  { min: 90, grade: 'S', msg: 'Xuất sắc! Bạn là bậc thầy triết học!' },
  { min: 70, grade: 'A', msg: 'Rất giỏi! Kiến thức vững vàng!' },
  { min: 50, grade: 'B', msg: 'Khá tốt! Cố gắng thêm nhé!' },
  { min: 30, grade: 'C', msg: 'Trung bình — ôn lại lý thuyết!' },
  { min: 0, grade: 'D', msg: 'Cần ôn tập thêm chương trình!' },
];

export const getTotalQuestions = () => STAGES.reduce((n, st) => n + st.questions.length, 0);
`;
fs.writeFileSync(path.join(__dirname, '../js/data.js'), header + footer);
console.log('Built js/data.js');
