// pages/fortune/fortune.js
const FORTUNES = [
  { icon: '🍀', text: '今日运势极佳，宜胡牌！', tags: ['碰碰胡','混一色','自摸'] },
  { icon: '💰', text: '财运亨通，适合做大牌！', tags: ['清一色','开宝','天胡'] },
  { icon: '🌟', text: '手气正旺，稳扎稳打！', tags: ['平胡','门清','无花果'] },
  { icon: '🔥', text: '运势爆棚，注意防守！', tags: ['七小对','杠开','花胡'] },
  { icon: '🌊', text: '顺风顺水，只管冲！', tags: ['碰碰胡','开宝','自摸'] },
  { icon: '🎯', text: '精准打击，听啥来啥！', tags: ['门清','混一色'] },
  { icon: '🛡️', text: '防守为上，等对手犯错', tags: ['平胡','无花果'] },
  { icon: '⚡', text: '今天不宜做大，小胡积累', tags: ['门清','平胡','自摸'] },
];

Page({
  data: {
    logined: false,
    nickName: '',
    avatarUrl: '',
    birthday: '',
    fortuneLoading: false,
    fortuneDone: false,
    fortuneIcon: '',
    fortuneText: '',
    fortuneTags: [],
  },

  onLoad() {
    // 检查是否已有登录信息
    const app = getApp();
    if (app.globalData.userInfo) {
      this.setData({
        logined: true,
        nickName: app.globalData.userInfo.nickName,
        avatarUrl: app.globalData.userInfo.avatarUrl,
      });
    }
  },

  onGetUserInfo(e) {
    if (e.detail.userInfo) {
      const info = e.detail.userInfo;
      getApp().globalData.userInfo = info;
      this.setData({
        logined: true,
        nickName: info.nickName,
        avatarUrl: info.avatarUrl,
      });
    } else {
      wx.showToast({ title: '需要登录才能使用', icon: 'none' });
    }
  },

  onBirthdayChange(e) {
    this.setData({ birthday: e.detail.value });
  },

  startFortune() {
    this.setData({ fortuneLoading: true });
    setTimeout(() => {
      const f = FORTUNES[Math.floor(Math.random() * FORTUNES.length)];
      this.setData({
        fortuneLoading: false,
        fortuneDone: true,
        fortuneIcon: f.icon,
        fortuneText: f.text,
        fortuneTags: f.tags,
      });
      getApp().globalData.fortuneTags = f.tags;
    }, 1200);
  },

  goCreateRoom() {
    const app = getApp();
    const nickname = app.globalData.userInfo?.nickName || '我';
    wx.navigateTo({
      url: `/pages/room-create/room-create?nickname=${encodeURIComponent(nickname)}`
    });
  }
});
