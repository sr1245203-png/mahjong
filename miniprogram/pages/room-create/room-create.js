// pages/room-create/room-create.js
const BASE = [1, 2, 3, 5, 10];
const SCORES = [0, 50, 100, 200, 500];
const CEILING = [20, 30, 50, 100, 200];

Page({
  data: {
    baseOptions: BASE.map(v => v + '分'),
    scoreOptions: SCORES.map(v => v + '分'),
    ceilingOptions: CEILING.map(v => v + '分'),
    config: {
      baseIndex: 0, base: BASE[0],
      scoreIndex: 1, score: SCORES[1],
      multiplier: 2,
      ceilingIndex: 2, ceiling: CEILING[2],
    },
    patterns: [
      { name: '碰碰胡', key: 'pengpeng', val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
      { name: '清一色', key: 'qingyise', val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
      { name: '混一色', key: 'hunyise', val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
      { name: '平胡',   key: 'pinghu',   val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
      { name: '杠开',   key: 'gangkai',  val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
      { name: '七小对', key: 'qixiaodui',val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
      { name: '开宝',   key: 'kaibao',   val: 0, unit: '倍', options: ['关闭','2倍','3倍','4倍','5倍'], valIndex: 0 },
    ],
    specials: [
      { name: '无花果', key: 'wuhuaguo', val: 0, unit: '分', options: ['关闭','5分','10分','15分','20分'], valIndex: 0, vals: [0, 5, 10, 15, 20] },
      { name: '天胡',   key: 'tianhu',   val: 0, unit: '分', options: ['关闭','100分','150分','200分','300分'], valIndex: 0, vals: [0, 100, 150, 200, 300] },
      { name: '地胡',   key: 'dihu',     val: 0, unit: '分', options: ['关闭','100分','150分','200分','300分'], valIndex: 0, vals: [0, 100, 150, 200, 300] },
      { name: '花胡',   key: 'huahu',    val: 0, unit: '个', options: ['关闭','10个花','13个花','15个花','18个花'], valIndex: 0, vals: [0, 10, 13, 15, 18] },
    ],
  },

  onBaseChange(e) {
    this.setData({ 'config.baseIndex': e.detail.value, 'config.base': BASE[e.detail.value] });
  },
  onScoreChange(e) {
    this.setData({ 'config.scoreIndex': e.detail.value, 'config.score': SCORES[e.detail.value] });
  },
  onMultiplierChange(e) {
    this.setData({ 'config.multiplier': e.detail.value });
  },
  onCeilingChange(e) {
    this.setData({ 'config.ceilingIndex': e.detail.value, 'config.ceiling': CEILING[e.detail.value] });
  },
  onPatternChange(e) {
    const idx = e.currentTarget.dataset.index;
    const key = `patterns[${idx}]`;
    const valIdx = e.detail.value;
    const val = parseInt(this.data.patterns[idx].options[valIdx]) || 0;
    this.setData({ [key + '.valIndex']: valIdx, [key + '.val']: val });
  },
  onSpecialChange(e) {
    const idx = e.currentTarget.dataset.index;
    const key = `specials[${idx}]`;
    const valIdx = e.detail.value;
    const val = this.data.specials[idx].vals[valIdx] || 0;
    this.setData({ [key + '.valIndex']: valIdx, [key + '.val']: val });
  },

  createRoom() {
    const cfg = this.data.config;
    const pats = {};
    this.data.patterns.forEach(p => { pats[p.key] = p.val; });
    this.data.specials.forEach(s => { pats[s.key] = s.val; });
    pats.kaibao_ceiling = pats.kaibao > 0 ? 2 : 1;

    const params = {
      base: cfg.base,
      score: cfg.score,
      multiplier: cfg.multiplier,
      ceilingNormal: cfg.ceiling,
      ...pats,
    };

    getApp().globalData.roomConfig = params;

    wx.navigateTo({
      url: '/pages/waiting-room/waiting-room'
    });
  }
});
