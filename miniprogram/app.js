// app.js
App({
  globalData: {
    userInfo: null,
    roomId: null,
    isOwner: false,
  },

  onLaunch() {
    // 获取系统信息
    const sys = wx.getSystemInfoSync();
    this.globalData.systemInfo = sys;
  }
})
