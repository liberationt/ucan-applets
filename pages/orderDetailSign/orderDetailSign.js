// pages/orderDetail/orderDetail.js
import { formatNumber,formatDate } from '../../utils/util'
import api from '../../api/request'
import { orgListDetail,orderSet } from '../../api/api'
const app = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        signInTime:'', // 签到时间
        signInImageUrl:'', // 签到图片
        signOutTime:'', // 签退时间
        signOutImageUrl:'', // 签退图片
        contentData:{},
        contentArrData:[],
        orderId:'',
        orderSet:'', // 工单设置
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.setData({
            orderId:options.id,
            orderSet:options.orderSet
        })
    },

    // 获取数据
    getData:function(){
        wx.showLoading({
            title:'加载中',
            mask:true
        })
        api.get(orgListDetail,{orderId:this.data.orderId}).then(res=>{
            console.log('签到列表', res.data)
            if(res.data.actualServiceDate){
                let strTime = res.data.actualServiceDate
                console.log('strTime-detailsign',strTime)
                if(strTime.substring(strTime.length-2) === '.0') {
                    res.data.actualServiceDate = strTime.substr(0,strTime.length - 2)
                }
            }
            this.setData({
                contentData:res.data,
                contentArrData:this.data.contentArrData.concat(res.data.setMeal).concat(res.data.individual),
                signInTime:res.data.signStartDate ? formatNumber(new Date(res.data.signStartDate).getHours()) + ':' + formatNumber(new Date(res.data.signStartDate).getMinutes()) : '--',
                signOutTime:res.data.signEndDate ? formatNumber(new Date(res.data.signEndDate).getHours()) + ':' + formatNumber(new Date(res.data.signEndDate).getMinutes()) : '--',
                signInImageUrl: res.data.signInImage ? `${app.globalData.imgUrl}${res.data.signInImage.imgUrl}` : '',
                signOutImageUrl: res.data.signOutImage ? `${app.globalData.imgUrl}${res.data.signOutImage.imgUrl}` : ''
            })
            wx.hideLoading()
        }).catch(err=>{
            wx.hideLoading()
            wx.showToast({
              title: '签到详情接口错误!',
              icon:'error',
              duration:2000
            })
        })
    },

    onReady: function () {
        this.getData()
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

    //  拍摄之后,转跳到服务中
    enterCenter: function(){
        let that = this
        api.get(orderSet,{orderId:that.data.contentData.id}).then(res=>{
            let orderSetData = JSON.stringify(res.data)
            if(res.data.inPhotoSet === 0) {
                wx.chooseImage({
                    sizeType: ['compressed'],
                    sourceType: ['camera'],
                    success (ress) {
                        // tempFilePath可以作为img标签的src属性显示图片
                        const tempFilePaths = ress.tempFilePaths
                        wx.navigateTo({
                            url: '/pages/orderDetail/orderDetail?tempFilePaths=' + tempFilePaths[0] + '&id=' + that.data.contentData.id + '&orderSetData=' + orderSetData + '&orderStatus=' + that.data.contentData.orderStatus
                        })
                        // wx.getFileSystemManager().readFile({
                        //     filePath: tempFilePaths[0],
                        //     success:(r)=>{
                        //         wx.navigateTo({
                        //             url: '/pages/orderDetail/orderDetail?tempFilePaths=' + tempFilePaths[0] + '&id=' + that.data.contentData.id + '&orderSetData=' + orderSetData + '&orderStatus=' + that.data.contentData.orderStatus
                        //           })
                        //     },
                        //     fail: console.error
                        // })
                    },
                    fail(err) {
                        console.log('拍照失败',err)
                    }
                })
            }else {
                console.log('没设置直接进入')
                wx.navigateTo({
                    url: '/pages/orderDetail/orderDetail?id=' + that.data.contentData.id + '&orderSetData=' + orderSetData  + '&orderStatus=' + that.data.contentData.orderStatus
                })
            }
        })
    },

    // 放大图片方法
    bigImg:function(url) {
        if(url) {
          console.log('url',url)
          this.setData({
            showBigImgStatus:true,
            bigImgUrl:url
          })
        }
      },
  
      // 放大图片查看
      lookBigImg: function (e) {
        let imgUrl = e.detail
        this.bigImg(imgUrl)
      },
  
      // 放大签到图片
      lookSignBigImg:function(e){
        this.bigImg(e.currentTarget.dataset.imgurl)
      },
  
      // 退出放大图片
      cancleBigImg:function () {
        this.setData({
          showBigImgStatus:false,
          bigImgUrl:''
        })
      }
})