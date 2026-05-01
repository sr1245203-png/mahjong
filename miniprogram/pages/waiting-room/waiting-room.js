// pages/waiting-room/waiting-room.js
const AVATARS = ['😎','🐱','🐶','🦁','🐼','🐸','🦊','🐻'];

Page({
  data: {
    roomId: '',
    isOwner: true,
    seats: [null, null, null, null],
    seatCount: 0,
    config: null,
    rules: [],
  },

  onLoad() {
    const app = getApp();
    const userInfo = app.globalData.userInfo;
    const cfg = app.globalData.roomConfig;

    // 生成房间号
    const roomId = 'MJ' + Date.now().toString(36).slice(-4).toUpperCase();
    app.globalData.roomId = roomId;
    app.globalData.isOwner = true;

    const seats = [{ name: userInfo?.nickName || '我', avatarUrl: userInfo?.avatarUrl || '', isOwner: true }];
    // 其他空位

    this.setData({
      roomId,
      isOwner: true,
      seats,
      seatCount: 1,
      config: cfg,
      rules: this.buildRules(cfg),
    });
  },

  buildRules(cfg) {
    if (!cfg) return [];
    const r = [
      { label: '底', value: cfg.base + '分' },
      { label: '初始积分', value: cfg.score + '分' },
      { label: '全场倍数', value: cfg.multiplier + '倍' },
      { label: '普通封顶', value: cfg.ceilingNormal + '分' },
    ];
    if (cfg.wuhuaguo) r.push({ label: '无花果', value: cfg.wuhuaguo + '分' });
    return r;
  },

  // 分享到微信
  onShareAppMessage() {
    return {
      title: '🀄 上海敲麻 · 好友局，一起来玩！',
      path: '/pages/waiting-room/waiting-room?room=' + this.data.roomId,
      imageUrl: '/images/share.jpg',
    };
  },

  onShare() {
    // WeChat will handle the share sheet via open-type="share"
  },

  startGame() {
    const app = getApp();
    const names = this.data.seats.map(s => s.name).join(',');
    const avatars = this.data.seats.map(s => s.avatarUrl || '😎').join(',');
    const cfg = app.globalData.roomConfig;

    let url = `/pages/game-score/game-score?names=${encodeURIComponent(names)}&avatars=${encodeURIComponent(avatars)}`;
    if (cfg) {
      url += `&base=${cfg.base}&score=${cfg.score}&multiplier=${cfg.multiplier}&ceilingNormal=${cfg.ceilingNormal}`;
    }

    wx.navigateTo({ url });
  }
});
