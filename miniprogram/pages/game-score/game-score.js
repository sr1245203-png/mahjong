// pages/game-score/game-score.js
Page({
  data: {
    round: 1,
    players: [],
    winnerId: null,
    flowerCount: 0,
    patterns: [],
    dianpaoPlayers: [],
    showDianpao: false,
    previewScore: 0,
    canConfirm: false,
    records: [],
    isRecording: false,
    voiceStatus: '',
  },

  // 本地状态（不用于渲染）
  _selectedDianpao: null,
  _lastScoreRound: 0,
  _recorder: null,

  // ======== 中文数字映射 ========
  _cnNum: {'零':'0','一':'1','二':'2','两':'2','三':'3','四':'4','五':'5','六':'6','七':'7','八':'8','九':'9','十':'10'},

  _toNum(s) {
    let r = s;
    for (const [cn, num] of Object.entries(this._cnNum)) r = r.replaceAll(cn, num);
    return r;
  },

  onLoad(options) {
    this.initPlayers(options);
    this.initPatterns(options);
  },

  initPlayers(options) {
    const names = (options.names || '我,小明,阿强,老王').split(',');
    const avatars = (options.avatars || '😎,🐱,🐶,🦁').split(',');
    const players = names.map((name, i) => ({
      id: 'p' + i, name, avatar: avatars[i] || '😎',
      score: parseInt(options.score) || 0,
    }));
    this.setData({ players });
    this._dianpaoPlayers = players.slice(1); // 除自己外
  },

  initPatterns(opts) {
    const p = [
      { name: '无花果', display: opts.wuhuaguo ? opts.wuhuaguo + '分' : '关闭', key: 'wuhuaguo', val: parseInt(opts.wuhuaguo) || 0, fixed: true, selected: false },
      { name: '天胡', display: opts.tianhu ? opts.tianhu + '分' : '关闭', key: 'tianhu', val: parseInt(opts.tianhu) || 0, natural: true, selected: false },
      { name: '地胡', display: opts.dihu ? opts.dihu + '分' : '关闭', key: 'dihu', val: parseInt(opts.dihu) || 0, natural: true, selected: false },
      { name: '花胡', display: opts.huahu ? opts.huahu + '个花' : '关闭', key: 'huahu', val: parseInt(opts.huahu) || 0, huahu: true, selected: false },
      { name: '自摸', display: '×3', key: 'zimo', zimo: true, selected: false },
      { name: '门清', display: '×1', key: 'menqing', menqing: true, selected: false },
    ];
    // 倍数牌型
    const multKeys = ['开宝','碰碰胡','清一色','混一色','平胡','杠开','七小对'];
    multKeys.forEach(k => {
      const v = parseInt(opts[k]) || 0;
      if (v > 0) p.push({ name: k, display: v + '倍', key: k, multiplier: v, selected: false });
    });
    this.setData({ patterns: p });
  },

  // ======== 选择胡牌人 ========
  selectWinner(e) {
    const id = e.currentTarget.dataset.id;
    this.setData({ winnerId: id, showDianpao: false });
    this._selectedDianpao = null;
    this.updateDianpao();
    this.updatePreview();
  },

  // ======== 花数调整 ========
  changeFlower(e) {
    const delta = parseInt(e.currentTarget.dataset.delta);
    let f = this.data.flowerCount + delta;
    if (f < 0) f = 0;
    this.setData({ flowerCount: f });
    this.updateDianpao();
    this.updatePreview();
  },

  // ======== 牌型选择 ========
  togglePattern(e) {
    const name = e.currentTarget.dataset.name;
    const patterns = this.data.patterns.map(p => {
      if (p.name === name) p.selected = !p.selected;
      return p;
    });
    this.setData({ patterns });
    this.updateDianpao();
    this.updatePreview();
  },

  // ======== 点炮选择 ========
  selectDianpao(e) {
    const id = e.currentTarget.dataset.id;
    this._selectedDianpao = this._selectedDianpao === id ? null : id;
    this.updateDianpao();
    this.updatePreview();
  },

  // ======== 更新点炮区域 ========
  updateDianpao() {
    const hasZimo = this.data.patterns.some(p => p.selected && p.zimo);
    const hasNatural = this.data.patterns.some(p => p.selected && p.natural);
    const hasHuahu = this.data.patterns.some(p => p.selected && p.huahu);
    const isOneFlower = this.data.flowerCount === 1;
    const showDp = !hasZimo && !hasNatural && !hasHuahu && !isOneFlower;

    const dianpaoPlayers = this._dianpaoPlayers.map(p => ({
      ...p, selected: this._selectedDianpao === p.id
    }));
    this.setData({ showDianpao: showDp, dianpaoPlayers });
  },

  // ======== 更新记分预览 ========
  updatePreview() {
    const result = this.calculateScore();
    this.setData({
      previewScore: result.score,
      canConfirm: this.data.winnerId && this.data.patterns.some(p => p.selected),
    });
  },

  calculateScore() {
    const sel = this.data.patterns.filter(p => p.selected);
    const base = parseInt(this.data.players[0]?.base) || 1;
    const flower = this.data.flowerCount;
    const hasZimo = sel.some(p => p.zimo);
    const hasNatural = sel.some(p => p.natural);
    const hasHuahu = sel.some(p => p.huahu);
    const hasFixed = sel.some(p => p.fixed);
    const hasDianpao = !hasZimo && !hasNatural && !hasHuahu && !!this._selectedDianpao;

    if (hasNatural) {
      const ns = Math.max(...sel.filter(p => p.natural).map(p => p.val));
      return { score: ns * 3, perPerson: ns, desc: '自然胡' };
    }
    if (hasHuahu) {
      // 花胡：封顶×3
      const ceiling = this.data.players[0]?.ceilingNormal || 50;
      return { score: ceiling * 3, perPerson: ceiling, desc: '花胡' };
    }

    let baseVal = hasFixed ? Math.max(...sel.filter(p => p.fixed).map(p => p.val)) + base : base + flower;
    let multiplier = parseInt(this.data.players[0]?.multiplier) || 1;
    sel.forEach(p => { if (p.multiplier > 0 && !p.zimo) multiplier *= p.multiplier; });

    const raw = baseVal * multiplier;
    const ceiling = parseInt(this.data.players[0]?.ceilingNormal) || 50;
    const perPerson = Math.min(raw, ceiling);
    const total = hasZimo ? perPerson * 3 : perPerson;

    return { score: total, perPerson, desc: '普通胡' };
  },

  // ======== 确认记分 ========
  confirmScore() {
    // ... simplified for now
    wx.showToast({ title: '记分成功！', icon: 'success' });
  },

  // ======== 语音 ========
  toggleVoice() {
    if (this.data.isRecording) {
      this.stopVoice();
    } else {
      this.startVoice();
    }
  },
  startVoice() {
    const rm = wx.getRecorderManager();
    rm.start({ format: 'mp3' });
    rm.onStart(() => {
      this.setData({ isRecording: true, voiceStatus: '🎙️ 录音中... 完成后点结束' });
    });
    this._recorder = rm;
  },
  stopVoice() {
    const rm = this._recorder;
    if (!rm) return;
    rm.stop();
    this.setData({ isRecording: false, voiceStatus: '⏳ 录入语音...' });
    rm.onStop(res => {
      // 小程序无内置语音识别，弹出输入框代替
      this.setData({ voiceStatus: '🎤 请说出胡牌信息（自摸/门清/花数等）' });
      wx.showModal({
        title: '语音输入',
        editable: true,
        placeholderText: '例如：我自摸门清5个花',
        success: (res) => {
          if (res.confirm && res.content) {
            this.parseVoiceInput(res.content);
          } else {
            this.setData({ voiceStatus: '已取消语音输入' });
          }
        }
      });
    });
  },

  // ======== 解析语音输入 ========
  parseVoiceInput(text) {
    let t = text.replace(/\s+/g, '').replace(/[，。！？、；：""''（）\.\,\!\?\;\:\"\'\(\)]/g, '');
    const tNum = this._toNum(t);

    // 重置当前选择
    let winnerId = null;
    let matchedNames = [];
    let flowerCount = 0;
    let dianpaoId = null;

    // 胡牌人
    const pl = this.data.players;
    for (const p of pl) {
      if (t.includes(p.name)) { winnerId = p.id; break; }
    }

    // 花数
    const fm = tNum.match(/(\d+)个?花/);
    if (fm) flowerCount = parseInt(fm[1]);
    if (!flowerCount) { const m2 = tNum.match(/花(\d+)/); if (m2) flowerCount = parseInt(m2[1]); }

    // 牌型匹配
    const pats = this.data.patterns;
    if (t.includes('自摸') || t.includes('自胡')) { if (pats.some(p => p.zimo && !matchedNames.includes(p.name))) matchedNames.push('自摸'); }
    if (t.includes('门清') || t.includes('门前')) { if (pats.some(p => p.menqing && !matchedNames.includes(p.name))) matchedNames.push('门清'); }
    ['碰碰胡','清一色','混一色','平胡','杠开','七小对','开宝','无花果','天胡','地胡','花胡'].forEach(name => {
      if (t.includes(name) && pats.some(p => p.name === name && !matchedNames.includes(p.name))) matchedNames.push(name);
    });

    // 点炮人
    const hasZimo = matchedNames.includes('自摸');
    if (!hasZimo) {
      for (const p of pl) {
        if (p.id === winnerId) continue;
        if (t.includes(p.name)) { dianpaoId = p.id; break; }
      }
    }

    // 应用
    const newPats = pats.map(p => ({ ...p, selected: matchedNames.includes(p.name) }));
    const newDp = this.data.dianpaoPlayers.map(p => ({ ...p, selected: p.id === dianpaoId }));
    let feedback = '✅ ';
    if (winnerId) feedback += pl.find(p => p.id === winnerId).name + '胡 ';
    if (matchedNames.length > 0) feedback += matchedNames.join('+') + ' ';
    else feedback += '未匹配到牌型 ';
    if (flowerCount > 0) feedback += flowerCount + '花 ';
    feedback += '📝「' + text + '」';

    this.setData({
      winnerId,
      patterns: newPats,
      flowerCount,
      showDianpao: !!dianpaoId,
      dianpaoPlayers: newDp,
      voiceStatus: feedback,
    });
    this.updateDianpao();
    this.updatePreview();
  },
});
