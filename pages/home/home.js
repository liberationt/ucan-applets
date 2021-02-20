// pages/home/home.js
import api from '../../api/request'
import { index,baseInfo } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        data:{},
        userInfo:{},
        avatarUrl:'' // 头像地址
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        // this.getData()
    },

    // 转跳订单列表
    toOrderList:function(e) {
        wx.reLaunch({
          url: '/pages/order/order?tabIndex=' + e.currentTarget.dataset.tabindex,
        })
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () {
        
    },

    // 获取首页数据
    getData(){
        wx.showLoading({
            title: '加载中',
            mask:true
        })
        api.get(baseInfo,{
            openId:`${app.globalData.openId}`
        }).then(respone=>{
            app.globalData.userInfo = respone.data
            if(respone.data.empId){
                app.globalData.empId = respone.data.empId
                api.getB(index,respone.data.empId).then(res=>{
                    this.setData({
                        data:res.data,
                        userInfo:respone.data,
                        avatarUrl:app.globalData.avatarUrl
                    })
                    wx.hideLoading()
                }).catch(err =>{
                    wx.hideLoading()
                    wx.showToast({
                        title: '首页信息获取失败',
                        icon:'error',
                        duration:2000
                      })
                })
            }else{
                console.log('empId不存在')
            }
        }).catch(err =>{
            wx.showToast({
                title: '基础信息获取失败',
                icon:'error',
                duration:2000
              })
        })
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getData()
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

    },

    // 去消息页
    toMessagePage: function () {
        wx.navigateTo({
          url: '/pages/message/message',
        })
    }
})