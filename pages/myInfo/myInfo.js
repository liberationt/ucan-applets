// pages/myInfo/myInfo.js
import api from '../../api/request'
import { unbind } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userInfo:{},
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            userInfo:app.globalData.userInfo,
            avatarUrl:app.globalData.avatarUrl
        })
    },

    // 退出登录
    exitLogin:function(){
        wx.showModal({
            title: '温馨提示',
            content: '确定退出登录嘛？',
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
                    title: '退出登录失败！',
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

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})