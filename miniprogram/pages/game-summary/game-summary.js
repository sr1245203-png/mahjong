Page({
  data: { rankList: [] },
  onLoad() {
    const data = wx.getStorageSync('mahjongGameData');
    if (data) {
      const sorted = [...data.players].sort((a, b) => b.score - a.score);
      const medals = ['🥇','🥈','🥉','4️⃣'];
      const rankList = sorted.map((p, i) => ({
        medal: medals[i] || '🏅',
        avatar: p.avatar || '🀄',
        name: p.name,
        position: p.position,
        score: p.score,
      }));
      this.setData({ rankList });
    }
  },
  goAnalysis() {
    wx.navigateTo({ url: '/pages/ai-summary/ai-summary' });
  },
  goHome() {
    wx.removeStorageSync('mahjongGameData');
    wx.reLaunch({ url: '/pages/fortune/fortune' });
  }
});
