//app.js
App({
  onLaunch: function () {
    // 获取导航条信息
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navTop = menuButtonObject.top,//胶囊按钮与顶部的距离
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight)*2;//导航高度
        this.globalData.navHeight = navHeight;
        this.globalData.navTop = navTop;
        this.globalData.windowHeight = res.windowHeight; 
      },
      fail(err) {
        console.log(err);
      }
    })
    // 展示本地存储能力
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
          wx.getUserInfo({
            success: res => {
              // 可以将 res 发送给后台解码出 unionId
              this.globalData.userInfo = res.userInfo
              // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
              // 所以此处加入 callback 以防止这种情况
              if (this.userInfoReadyCallback) {
                this.userInfoReadyCallback(res)
              }
            }
          })
        }
      }
    })

    // // 分享
    // wx.showShareMenu({
    //   withShareTicket: true,
    //   menus: ['shareAppMessage', 'shareTimeline']
    // })
  },
  globalData: {
    userInfo: {},
    navHeight:0, // 导航高度
    navTop:0, // 胶囊按钮与顶部的距离
    windowHeight: 0, // 屏幕高度
    host:'https://wxxcx.962899.net/sys', // 测试
    // host:'https://gdfw.ucanyun.com/sys', // 生产
    // host:'http://192.168.62.37:8771/sys',  // 季峰
    // imgUrl:'http://192.168.10.74:89/',     // 季峰
    imgUrl:'http://imgwx.962899.net:89/', // 测试
    // imgUrl:'http://file.ucanyun.com/',  // 生产
    token:'',
    openId: '',
    avatarUrl: '', // 头像图片地址
    empId:''  // 服务人员id
  }
})