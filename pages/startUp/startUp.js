// pages/startUp/startUp.js
import api from '../../api/request'
import { login, openIdLogin } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        showModalStatus:true
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        
    },

    cancel:function () {
        this.setData({
            showModalStatus:false
        })
    },

    bindGetUserInfo: function(){
        // 查看是否授权
        wx.getSetting({
            success (res){
                if (res.authSetting['scope.userInfo']) {
                    // 已经授权，可以直接调用 getUserInfo 获取头像昵称
                    wx.login({
                        success: function(ress) {
                            wx.getUserInfo({
                            success(res) {
                                    let params = {
                                        code: ress.code,
                                        encryptedData: res.encryptedData,
                                        iv: res.iv,
                                    }
                                    api.post(login, params).then(response=>{
                                        if (response.code === 0) { 
                                            app.globalData.openId = response.data.openId
                                            app.globalData.avatarUrl = response.data.avatarUrl
                                            let datas = {
                                                grant_type: 'wechat',
                                                client_id: 'fO4igklpPVuwkpSKm12NF3mt',
                                                client_secret: 'RBDjX9yl4MouiDazfMJzPans',
                                                openId: response.data.unionId !== null ? response.data.unionId : response.data.openId
                                            }
                                            wx.request({
                                                url: `${app.globalData.host}${openIdLogin}?grant_type=wechat&client_id=fO4igklpPVuwkpSKm12NF3mt&openId=${response.data.openId}&client_secret=RBDjX9yl4MouiDazfMJzPans`,
                                                method: 'POST',
                                                header: {
                                                    'Content-Type': 'application/json; charset=UTF-8'
                                                },
                                                success(request) {
                                                    try {
                                                        wx.removeStorageSync('token')
                                                        wx.setStorageSync('token', request.data.access_token)
                                                        if (request.data.msg === 'OpenID不存在') {
                                                            wx.navigateTo({
                                                                url: '/pages/login/login',
                                                            })
                                                        } else {
                                                            wx.switchTab({
                                                                url: '/pages/home/home',
                                                            })
                                                        }
                                                    } catch (e) { 
                                                        wx.showToast({
                                                        title: 'token保存失败!',
                                                        icon:'error',
                                                        })
                                                    }
                                                },
                                                fail(error) {
                                                
                                                }
                                            })
                                        }else{
                                            wx.showToast({
                                            title: response.msg,
                                            icon:'error',
                                            })
                                        }
                                    })
                                }
                            })
                        },
                        fail:function() {
                            console.log('err')
                        }
                    })
                }
                if (!res.authSetting['scope.userLocation']) {
                    // 已经授权，可以直接调用 位置
                    wx.authorize({
                        scope: 'scope.userLocation',
                        success() {
                        console.log('成功授权位置')
                        }
                    })            
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