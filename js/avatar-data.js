/** Avatar customization options & unlockable skins */

export const AVATAR_DEFAULT = {
  gender: 'neutral',
  hairStyle: 'short',
  hairColor: '#3d2314',
  eyeStyle: 'normal',
  skinColor: '#f5c8a0',
  outfit: 'casual',
  outfitColor: '#6c5ce7',
  accessory: 'none',
  skinId: 'default',
};

export const AVATAR_OPTIONS = {
  gender: [
    { id: 'male', label: 'Nam', icon: '♂' },
    { id: 'female', label: 'Nữ', icon: '♀' },
    { id: 'neutral', label: 'Trung', icon: '⚧' },
  ],
  hairStyle: [
    { id: 'short', label: 'Ngắn' },
    { id: 'long', label: 'Dài' },
    { id: 'spiky', label: 'Spiky' },
    { id: 'ponytail', label: 'Đuôi ngựa' },
    { id: 'curly', label: 'Xoăn' },
  ],
  hairColor: [
    '#1a1a1a', '#3d2314', '#8b4513', '#d4a574', '#e74c3c',
    '#9b59b6', '#3498db', '#2ecc71', '#f39c12', '#ecf0f1',
  ],
  eyeStyle: [
    { id: 'normal', label: 'Bình thường' },
    { id: 'wide', label: 'To tròn' },
    { id: 'determined', label: 'Quyết tâm' },
    { id: 'gentle', label: 'Hiền' },
  ],
  skinColor: [
    '#ffdfc4', '#f5c8a0', '#e0ac69', '#c68642', '#8d5524', '#5c3317',
  ],
  outfit: [
    { id: 'casual', label: 'Thường ngày' },
    { id: 'formal', label: 'Trang trọng' },
    { id: 'hoodie', label: 'Hoodie' },
    { id: 'uniform', label: 'Đồng phục' },
  ],
  outfitColor: [
    '#6c5ce7', '#e84393', '#00b894', '#0984e3', '#e17055', '#2d3436', '#fdcb6e',
  ],
  accessory: [
    { id: 'none', label: 'Không' },
    { id: 'glasses', label: 'Kính' },
    { id: 'cap', label: 'Mũ' },
    { id: 'scarf', label: 'Khăn' },
    { id: 'badge', label: 'Huy hiệu' },
  ],
};

export const SKINS = {
  default: {
    id: 'default',
    name: 'Mặc định',
    desc: 'Trang phục tự chọn',
    icon: '👤',
    unlock: 'always',
    outfitOverride: null,
    aura: 'none',
    animClass: '',
  },
  warrior: {
    id: 'warrior',
    name: 'Chiến binh',
    desc: 'Hoàn thành Chặng 1',
    icon: '⚔',
    unlock: 'stage1',
    outfitOverride: { outfit: 'uniform', outfitColor: '#c0392b' },
    aura: 'fire',
    animClass: 'skin-warrior',
  },
  scholar: {
    id: 'scholar',
    name: 'Học giả',
    desc: 'Hoàn thành Chặng 2',
    icon: '📚',
    unlock: 'stage2',
    outfitOverride: { outfit: 'formal', outfitColor: '#27ae60' },
    aura: 'glow',
    animClass: 'skin-scholar',
  },
  revolutionary: {
    id: 'revolutionary',
    name: 'Nhà cách mạng',
    desc: 'Hoàn thành toàn bộ',
    icon: '🚩',
    unlock: 'complete',
    outfitOverride: { outfit: 'uniform', outfitColor: '#8e44ad' },
    aura: 'flag',
    animClass: 'skin-revolutionary',
  },
  golden: {
    id: 'golden',
    name: 'Vàng rực rỡ',
    desc: 'Đạt 90% câu đúng',
    icon: '⭐',
    unlock: 'score90',
    outfitOverride: { outfit: 'formal', outfitColor: '#f39c12' },
    aura: 'golden',
    animClass: 'skin-golden',
  },
};

export const REACTIONS = {
  correct: ['Great!', 'Awesome!', 'Perfect!', 'Nice Job!', 'Tuyệt vời!', 'Xuất sắc!'],
  wrong: ['Oops!', 'Try Again!', 'Not Quite!', 'Chưa đúng!', 'Cố lên!'],
  streak: ['ON FIRE!', 'Unstoppable!', 'Siêu sao!', 'Bất bại!'],
  victory: ['Victory!', 'Chúc mừng!', 'Huyền thoại!'],
};

export const ACHIEVEMENTS = {
  first_win: { icon: '🏅', title: 'Lần đầu chiến thắng', desc: 'Hoàn thành quiz lần đầu' },
  perfect_stage: { icon: '🎯', title: 'Chặng hoàn hảo', desc: 'Đúng 5/5 câu trong 1 chặng' },
  streak5: { icon: '🔥', title: 'Chuỗi 5', desc: '5 câu đúng liên tiếp' },
  speed_demon: { icon: '⚡', title: 'Tốc độ cao', desc: 'Trả lời đúng với >50% thời gian' },
};
