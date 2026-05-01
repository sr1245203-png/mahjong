Page({
  data: { rankList: [], players: [], totalRounds: 0, cfg: {} },
  onLoad() {
    const data = wx.getStorageSync('mahjongGameData');
    if (!data) return;
    const medals = ['🥇','🥈','🥉','4️⃣'];
    const sorted = [...data.players].sort((a,b) => b.score - a.score);
    this.setData({
      rankList: sorted.map((p,i) => ({ medal: medals[i]||'🏅', avatar: p.avatar, name: p.name, position: p.position, score: p.score })),
      players: sorted.map((p,i) => ({ medal: medals[i]||'🏅', ...p })),
      totalRounds: (data.records || []).length,
      cfg: { base: data.config?.base, multiplier: data.config?.multiplier, ceiling: data.config?.ceilingNormal },
    });
  },
  goPlayer(e) {
    const name = e.currentTarget.dataset.name;
    wx.navigateTo({ url: '/pages/ai-player/ai-player?player=' + encodeURIComponent(name) });
  },
  goHome() {
    wx.removeStorageSync('mahjongGameData');
    wx.reLaunch({ url: '/pages/fortune/fortune' });
  }
});
