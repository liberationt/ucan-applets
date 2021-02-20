// pages/mySerProvider/mySerProvider.js
import api from '../../api/request'
import { bindOrg } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        orgName:'',
        serInfo:[]
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getData()
    },

    // 获取列表数据
    getData:function() {
        api.get(bindOrg,{
            empId:app.globalData.empId,
            orgName:this.data.orgName
        }).then(res=>{
            this.setData({
                serInfo:res.data
            })
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

    },

    // 查询服务商
    toSearch: function(e){
        this.setData({
            orgName:e.detail.value
        })
        this.getData()
    },

    // 拨打电话
    makeCall: function (e) {
        let phoneNumber =  e.currentTarget.dataset.num
        if(phoneNumber) {
            wx.makePhoneCall({
                phoneNumber: e.currentTarget.dataset.num, // 仅为示例，并非真实的电话号码
                success(){},
                fail(err){
                    console.log('打电话失败',err)
                }
            })
        }else{
            wx.showToast({
              title: '暂无服务商的联系方式，如有需要请与管理员联系',
              icon: 'none'
            })
        }
    },

    // 进入地图，到这去
    toMap: function (e) {
        wx.getLocation({
            type: 'gcj02', //返回可以用于wx.openLocation的经纬度
            success (res) {
              const latitude = Number(e.currentTarget.dataset.latitude)
              const longitude = Number(e.currentTarget.dataset.longitude)
              const address = e.currentTarget.dataset.addr
              wx.openLocation({
                latitude,
                longitude,
                address,
                scale: 18
              })
            },
            fail(err){
                wx.showToast({
                    title: err,
                    icon:'error',
                    duration:2000
                  })
            }
           })
    }
})