// pages/my/my.js
import api from '../../api/request'
import { unbind } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
      userInfo:{},
      avatarUrl:''
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
      
    },

    onShow: function () {
      this.setData({
        userInfo:app.globalData.userInfo,
        avatarUrl:app.globalData.avatarUrl
      })
    },

    // 解绑微信
    unBindWx:function(){
      wx.showModal({
        title: '温馨提示',
        content: '确定解除与微信的绑定关系嘛？',
        success (res) {
          if (res.confirm) {
            api.put(unbind,{
              loginName:`${app.globalData.userInfo.loginName}`,
              openId:`${app.globalData.openId}`
            }).then(res=>{
              wx.navigateTo({
                  url: '/pages/login/login',
              })
            }).catch(err=>{
              wx.showToast({
                title: '解除绑定失败!',
                icon:'error',
                duration:2000
              })
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    },

    // 转跳到个人信息
    toMyInfo:function() {
        wx.navigateTo({
          url: '/pages/myInfo/myInfo',
        })
    },

    // 转跳到我的服务商
    toMySerProvider:function() {
        wx.navigateTo({
          url: '/pages/mySerProvider/mySerProvider',
        })
    }
})