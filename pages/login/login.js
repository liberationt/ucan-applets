// pages/login/login.js
import WxValidate from '../../utils/WxValidate'
import api from '../../api/request'
import { wxLogin, vCode, loginBind } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        loginState:true, // 是否有登录内容
        phoneState:false, // 手机号登录状态
        userForm:{
            user: '', // 账户
            pwd: '' // 密码
        },
        tel: '', // 手机号
        vCode: '', // 验证码
        isTime: false,
        sendTime: '获取验证码',
        sendColor: '#363636',
        snsMsgWait: 60
    },

    /**
     * 生命周期函数--监听页面加载
     */
    /**   * 生命周期函数--监听页面加载   */
    onLoad: function (options) {
        this.initValidateTel()
        this.initValidateUser()
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

    },

    toast: function(msg) {
        wx.showToast({
          title: msg,
          icon: 'none',
          duration: 2000,
          mask: true
        })
    },
    bindKeyInput: function(e) {
        this.setData({
            tel: e.detail.value
        })
    },
    sendcode: function() {
        var that = this;

        if (this.data.tel == "") {
            this.toast('请输入手机号');
            return;
        }

         if (!(/^(0|86|17951)?(13[0-9]|15[012356789]|166|199|17[35678]|18[0-9]|14[57])[0-9]{8}$/.test(this.data.tel))) {
            this.toast('手机号输入错误');
            return;
        }
        var inter = setInterval(function() {
            this.setData({
              smsFlag: true,
              sendColor: '#cccccc',
              sendTime: this.data.snsMsgWait + 's后重发',
              snsMsgWait: this.data.snsMsgWait - 1
            });
            if (this.data.snsMsgWait < 0) {
              clearInterval(inter)
              this.setData({
                sendColor: '#363636',
                sendTime: '获取验证码',
                snsMsgWait: 60,
                smsFlag: false
              });
            }
        }.bind(this), 1000);
        wx.request({
            url: `${app.globalData.host}${vCode}?phone=${this.data.tel}`,
            method: 'GET',
            header: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            success(request) {
                that.toast('验证码发送成功！')
            },
            fail(error) {
               
            }
        })
    },

    // 表单效验
    initValidateTel() {
        const rules = {
            tel:{
                required: true,
                tel: true
            },
            vCode: {
                required: true,
            }
        }
        const message = {
            tel: {
                required: '请输入手机号',
                tel: '请输入正确格式手机号'
            },
            vCode: {
                required: '请输入手机验证码',
            }
        }
        this.WxValidateTel = new WxValidate(rules,message)
    },

     // 表单效验
     initValidateUser() {
        const rules = {
            user: {
                required: true,
            },
            userPassWord: {
                required: true,
            }
        }
        const message = {
            user: {
                required: '请输入账号',
            },
            userPassWord: {
                required: '请输入密码',
            }
        }
        this.WxValidateUser = new WxValidate(rules,message)
    },

    // 手机号账户密码登录切换
    swichEvent: function() {
        this.setData({
            phoneState: !this.data.phoneState
        })
    },

    getCode: function() {
        wx.request({
            url: `${app.globalData.host}${vCode}?phone=${this.data.vCode}`,
            method: 'POST',
            header: {
                'Content-Type': 'application/json; charset=UTF-8'
            },
            success(request) {
                app.globalData.token = request.data.access_token
                if (app.globalData.token) {
                    wx.navigateTo({
                        url: '/pages/home/home',
                    })
                }
            },
            fail(error) {
               
            }
        })
    },

    loginBindWay: function(id) {
        let parms = {
            openId: id
        }
        api.put(loginBind, parms).then(res=>{
            if(res.code !== 0) {
                wx.showToast({
                  title: 'res.msg',
                  icon:'error',
                })
                return false
            }
        }).catch(err=>{
            wx.showToast({
                title: '登录绑定失败',
                icon:'error',
                duration:2000
              })
        })
    },

    userSubmit: function(e) {
        const params = e.detail.value
        var that = this;
        if (this.data.phoneState === false) {
            if (!this.WxValidateUser.checkForm(params)) {
                const error = this.WxValidateUser.errorList[0]
                this.toast(error.msg)
                return false
            }
            wx.request({
                url: `${app.globalData.host}${wxLogin}?username=${params.user}&password=${params.userPassWord}&grant_type=wechat_password&client_id=fO4igklpPVuwkpSKm12NF3mt&client_secret=RBDjX9yl4MouiDazfMJzPans&openId=${app.globalData.openId}`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                success(request) {
                    try {
                        if(request.data.access_token) {
                            wx.removeStorageSync('token')
                            wx.setStorageSync('token', request.data.access_token)        
                            wx.switchTab({
                                url: '/pages/home/home',
                            })
                            that.loginBindWay(app.globalData.openId)
                        } else {
                            that.toast(request.data.msg)
                        }
                    } catch (e) { 
                        that.toast('token保存失败')
                    }
                },
                fail(error) {
                    wx.showToast({
                        title: error,
                        icon:'error',
                        duration:2000
                      })
                }
            })
        } else {
            if (!this.WxValidateTel.checkForm(params)) {
                const error = this.WxValidateTel.errorList[0]
                this.toast(error.msg)
                return false
            }
            wx.request({
                url: `${app.globalData.host}${wxLogin}?phone=${params.tel}&code=${params.vCode}&grant_type=sms&client_id=fO4igklpPVuwkpSKm12NF3mt&client_secret=RBDjX9yl4MouiDazfMJzPans&openId=${app.globalData.openId}`,
                method: 'POST',
                header: {
                    'Content-Type': 'application/json; charset=UTF-8'
                },
                success(request) {
                    try {
                        if (request.data.access_token) {
                            wx.removeStorageSync('token')
                            wx.setStorageSync('token', request.data.access_token)
                            that.loginBindWay(app.globalData.openId)
                            wx.switchTab({
                                url: '/pages/home/home',
                            })
                        } else {
                            that.toast(request.data.msg)
                        }
                    } catch (e) { 
                        that.toast('token保存失败')
                    }                    
                },
                fail(error) {
                    wx.showToast({
                        title: error,
                        icon:'error',
                        duration:2000
                      })
                }
            })
        }
        
        // wx.switchTab({
        //     url:'/pages/home/home'
        // })
    },

    showModal(error) {
        wx.showModal({
            content: error.msg,
            showCancel: false,
        })
    }
})