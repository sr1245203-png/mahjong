Page({
  data: { player: {}, medal: '', rank: 0, stats: { wins: 0, loses: 0, zimo: 0 }, rival: {} },
  onLoad(options) {
    const name = decodeURIComponent(options.player || '');
    const data = wx.getStorageSync('mahjongGameData');
    if (!data || !name) return;
    const medals = ['🥇','🥈','🥉','4️⃣'];
    const sorted = [...data.players].sort((a,b) => b.score - a.score);
    const player = data.players.find(p => p.name === name);
    const rank = sorted.findIndex(p => p.name === name) + 1;

    // Parse records for stats
    let wins = 0, loses = 0, zimo = 0;
    const giveTo = {}, takeFrom = {};
    (data.records || []).forEach(r => {
      const wn = r.desc.split(' ')[0];
      if (wn === name) { wins++; if (r.icon === '🎯') zimo++; }
      if (r.icon === '💥') {
        const m = r.desc.match(/（(.+?)点炮）/);
        if (m && m[1] === name) { loses++; giveTo[wn] = (giveTo[wn] || 0) + 1; }
        if (m && wn === name) takeFrom[m[1]] = (takeFrom[m[1]] || 0) + 1;
      }
    });
    const giveSorted = Object.entries(giveTo).sort((a,b) => b[1] - a[1]);
    const takeSorted = Object.entries(takeFrom).sort((a,b) => b[1] - a[1]);

    this.setData({
      player, rank, medal: medals[rank-1] || '🏅',
      stats: { wins, loses, zimo },
      rival: {
        kexing: giveSorted[0]?.[0] || '',
        kexingCount: giveSorted[0]?.[1] || 0,
        tikuanji: takeSorted[0]?.[0] || '',
        tikuanjiCount: takeSorted[0]?.[1] || 0,
      },
    });
  },
  goBack() { wx.navigateBack(); }
});
