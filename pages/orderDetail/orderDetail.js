import api from '../../api/request'
import { update,orgListDetail } from '../../api/api'
import { formatTimeLen,formatTime } from '../../utils/util'
// import {debounce} from '../../utils/debounce'

// pages/orderDetail/orderDetail.js
const recorderManager = wx.getRecorderManager()
const app = getApp()

Page({

    /**
     * 页面的初始数据
     */
    data: {
        recordingState:true,
        signInImage:'', // 已签到图片暂时路径
        ImageId:'', // 已签到图片暂时id
        radioData:[
          {value: '0', name: '否'},
          {value: '1', name: '是'}
        ],
        contentData:{},
        contentArrData:[],
        voiceTimeLen:'', // 录音时间长度
        voiceFilePath:'', // 录音文件地址
        voicefileId:'', // 语音文件id
        playRecordStatus:true, // 是否正在读取语音
        date:'',
        actualServiceDate:'', // 签到时间
        signPic:'', // 签到图片地址
        paramData: {
          abnormalRemark:null,
          actualServiceTime:null,
          failedRemark:null,
          id:null,
          isAbnormal:null,
          isFailed: '0', // 1 是  0 否
          planServiceTime:null,
          appraiseTime:0, // 语音时长
          signEndDate:null,
          signEndLatitude:null,
          signEndLongitude:null,
          signStartDate:null,
          signStartLatitude:null,
          signStartLongitude:null
        },
        orderSetData:{},
        showBigImgStatus:false, // 放大图片显示状态
        bigImgUrl:'', // 放大的图片路径
        allowAddSignImg:true, // 允许增加签到图片
        allowVoiceStatus:true // 允许点击增加语音
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
      wx.showLoading({
          title:'加载中',
          mask:true
      })
      let orderSetData = JSON.parse(options.orderSetData)

      this.setData({
        orderSetData:orderSetData
      })
      this.initData(options)
    },

    // 初始化数据
    initData(options){
      let that = this
      if(options.orderStatus !== 'to_be_served'){
        this.getData(options.id)
      }
      this.data.paramData.id = options.id
      wx.getLocation({
        success(ress){
          let paramData = that.data.paramData
          paramData.signStartLatitude = ress.latitude
          paramData.signStartLongitude = ress.longitude
          if(options.orderStatus === 'to_be_served'){
            paramData.signStartDate = new Date()
          }
          if(paramData.signStartDate){
            api.put(update,paramData).then(()=>{
              if(options.tempFilePaths) {
                // 如果调动了相机，有拍了照的地址，则显示
                that.uploadFile(options.tempFilePaths,options.id,that,'signIn')
              }
              if(options.orderStatus === 'to_be_served') {
                that.getData(options.id)
              }
            })
          }
        },
        fail(err){
          wx.showToast({
            title: '位置定位失败',
            icon:'error',
          })
        }
      })
    },

    // 获取数据
    getData(id){
      api.get(orgListDetail,{orderId:id}).then(res=>{
        console.log('res',res.data)
          if(res.data.actualServiceDate){
            let strTime = res.data.actualServiceDate
            if(strTime.substring(strTime.length-2) === '.0') {
                res.data.actualServiceDate = strTime.substr(0,strTime.length - 2)
            }
          }
          this.setData({
              contentData:res.data,
              paramData:res.data,
              contentArrData:this.data.contentArrData.concat(res.data.setMeal).concat(res.data.individual),
              actualServiceDate:res.data.actualServiceDate ? res.data.actualServiceDate.substring(11,16) : '',
              voiceTimeLen:res.data.appraiseTime
          })
          if(res.data.signStartDate){
            // 如果有签到时间，则录入
            this.data.paramData.signStartDate = res.data.signStartDate
          }
          if(res.data.signInImage) {
              this.setData({
                  signInImage: app.globalData.imgUrl + res.data.signInImage.imgUrl,
                  ImageId:res.data.signInImage.id
              })
          }
          if(res.data.evaluate){
            // 如果有语音，则赋值
            this.setData({
              recordingState:false,
              voiceFilePath:`${app.globalData.imgUrl}` + res.data.evaluate.fileUrl,
              voicefileId: res.data.evaluate.id
            })
            this.getPlayRecordingLen()
          }
          this.setData({
            paramData:this.data.paramData
          })
          wx.hideLoading()
      }).catch(err=>{
        wx.hideLoading()
        wx.showToast({
          title: '详情接口调用失败!',
          icon:'error',
          duration:2000
        })
      })
    },

    /**
     * 上传照片、语音文件方法
     */
    uploadFile:function(tempFilePaths,id,that,type){
      let url = ''
      if(type === 'signIn') {
        url = '/file/order/image/signIn/orderId'  // 签到图片
      }else if(type === 'signOut'){
        url = '/file/order/image/signOut/orderId' // 签退图片
      }else if(type === 'voice') {
        url = '/file/order/image/voice'   // 语音文件
      }
      wx.uploadFile({
        url: `${app.globalData.host}${url}`,
        header: {
          "Content-Type": "multipart/form-data",
          "token": app.globalData.token,  // 看自己是否需要
          "Authorization": "Bearer " + app.globalData.token
        },
        filePath: tempFilePaths,
        name: 'file',
        formData: {
          'file': 'multipart/form-data',
          'orderId':id,
        },
        success (res){
          if(res.data.code === 5014){
            wx.showModal({
                title: '温馨提示',
                content: 'token过期，是否重新登录!',
                cancelText: '否',
                confirmText: '是',
                success (ress) {
                  if (res.confirm) {
                    wx.navigateTo({
                      url: '/pages/startUp/startUp',
                    })
                  } else if (ress.cancel) {
                    console.log('用户点击取消')
                  }
                }
              })
          }
          let data = JSON.parse(res.data).data
          if(type === 'signIn') {
            that.setData({
              signInImage: app.globalData.imgUrl + data.originImgUrlPath,
              ImageId:data.ImageId,
              allowAddSignImg:false
            })
          }else if(type === 'voice'){
            that.setData({
              voicefileId:data.FileId,
              allowVoiceStatus:true
            })
          }
        },
        fail (err) {
          console.log('照片上传接口失败', err)
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
      // innerAudioContext.destroy()
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

    // 服务失败单选数据绑定
    radioChange:function(e){
      let paramData = this.data.paramData
      paramData.isFailed = e.detail.value
      this.setData({
        paramData:paramData
      })
    },

    // 服务失败原因数据绑定
    inputValue:function(e) {
      let paramData = this.data.paramData
      paramData.failedRemark = e.detail.value
      if(paramData.failedRemark && paramData.failedRemark.length === 50) {
        wx.showToast({
          title: '服务失败原因字数不能超过50个！',
          icon: 'none',
          duration: 2500
        })
        return false
      }
      this.setData({
        paramData:paramData,
      })
    },

    // 录音实例调用方法
    voiceFuc: function(that){
      that.getRecordAuth()
        recorderManager.onStart(() => {
          console.log('recorder start')
        })
        recorderManager.onPause(() => {
          console.log('recorder pause')
        })
        recorderManager.onStop((res) => {
          that.uploadFile(res.tempFilePath,that.data.paramData.id,that,'voice')
          that.setData({
            recordingState:false,
            voiceFilePath:res.tempFilePath,
            voiceTimeLen: parseInt(res.duration / 1000),
          })
        })
        recorderManager.onError((res)=>{
          console.log('err',res.errMsg)
        })
        recorderManager.onFrameRecorded((res) => {
          // const { frameBuffer } = res
          // console.log('frameBuffer.byteLength', frameBuffer)
        })

        const options = {
          duration: 30000,
          sampleRate: 44100,
          numberOfChannels: 1,
          encodeBitRate: 192000,
          format: 'aac',
          frameSize: 50
        }
        recorderManager.start(options)
    },

    // 按住录音
    touchStartC: function(){
      console.log('按住录音')
      if(!this.data.playRecordStatus) {
        wx.showToast({
          title: '语音还未播放完',
          icon: 'none'
        })
        return false
      }
      if(!this.data.allowVoiceStatus){
        wx.showToast({
          title: '上一个语音文件未上传完成！',
          icon: 'none'
        })
        return false
      }
      this.setData({
        allowVoiceStatus:false
      })
      let that = this
      if(this.data.voiceFilePath){
        // 如果存在语音文件，继续讲话时，需要先去删除库里的语音文件
        let url = '/file/order/file/delete/'
        wx.request({
          url: `${app.globalData.host}${url}` + that.data.voicefileId,
          method:'DELETE',
          header:{
            'Content-Type': 'application/x-www-form-urlencoded;',
            'token': app.globalData.token,
            'Authorization': 'Bearer ' + app.globalData.token
          },
          success(res){
            that.setData({
              voicefileId:'',
              voiceFilePath:''
            })
            that.voiceFuc(that)
          },
          fail(err){
            console.log('删除语音文件报错')
          }
        })
      }else{
        that.voiceFuc(that)
      }
    },
    // 松开结束
    touchEndC: function() {
      console.log('松开结束')
      if(!this.data.playRecordStatus) {
        return false
      }
      recorderManager.stop((res) => {
        console.log('录音结束')
      })
    },
    // 获取录音权限
    getRecordAuth: function() {
          // 获取用户是否授权录音
          wx.getSetting({
            success: (res) => {
              // 如果未授权提示用户,当前功能需要录音功能才能使用
              if (!res.authSetting['scope.record']) {
                wx.authorize({
                  scope: 'scope.record',
                  success() {
                    console.log("用户允许录音")
                    wx.startRecord()
                  },
                  fail(res) {
                    wx.showModal({
                      title: '授权提示',
                      content: '该应用需要使用你的录音权限，是否同意？',
                      success: function (res) {
                        if (res.confirm) {
                          console.log('用户同意使用录音权限')
                          // 当用户第一次授权拒绝时，根据最新的微信获取权限规则，不会再次弹框提示授权，需要用户主动再设置授权页面打开授权，需要做对应的文案提示
                          wx.openSetting()
                        } else if (res.cancel) {
                          console.log('用户不同意使用录音权限');
                        }
                      }
                    })
                  }
                })
              } else {
                console.log("已有录音权限")
              }
            }
          })
    },

    // 获取语音长度
    getPlayRecordingLen:function () {
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.src = this.data.voiceFilePath
      innerAudioContext.onCanplay(()=>{
        innerAudioContext.duration
        console.log('durationsss',parseInt(innerAudioContext.duration))
        setTimeout(()=>{
          console.log('duration',parseInt(innerAudioContext.duration))
          this.setData({
            voiceTimeLen:parseInt(innerAudioContext.duration)
          },1000)
        })
      })
    },

    // 播放语音
    playRecording:function() {
      if(!this.data.playRecordStatus) {
        wx.showToast({
          title: '语音还未播放完',
          icon: 'none'
        })
        return false
      }
      const innerAudioContext = wx.createInnerAudioContext()
      innerAudioContext.autoplay = true
      innerAudioContext.src = this.data.voiceFilePath
      innerAudioContext.onPlay(() => {
        this.setData({
          playRecordStatus:false
        })
      })
      innerAudioContext.onEnded(()=>{
        this.setData({
          playRecordStatus:true
        })
    })
      innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
      })
    },

    // 删除图片
    deleteImgFunc: function(e) {
      if(e.currentTarget.dataset.type === 'signIn') {
        this.setData({
          allowAddSignImg:true
        })
      }
      let that = this
      let url = '/file/order/image/delete/'
      wx.request({
        url: `${app.globalData.host}${url}` + that.data.ImageId,
        method:'DELETE',
        header:{
          'Content-Type': 'application/x-www-form-urlencoded;',
          'token': app.globalData.token,
          'Authorization': 'Bearer ' + app.globalData.token
        },
        success(res){
          that.setData({
            ImageId:'',
            signInImage:''
          })
        }
      })
    },

    // 新增图片
    addImage: function (e) {
      if(e.currentTarget.dataset.type === 'signIn'){
        if(!this.data.allowAddSignImg) {
          wx.showToast({
            title: '签到图片未删除',
            icon:'none',
          })
          return false
        }
      }
      let that = this
      wx.chooseImage({
        sizeType: ['compressed'],
        sourceType: ['camera'],
        success (res) {
            // tempFilePath可以作为img标签的src属性显示图片
            const tempFilePaths = res.tempFilePaths
            wx.getFileSystemManager().readFile({
                filePath: tempFilePaths[0],
                success:ress=>{
                  that.uploadFile(tempFilePaths[0],that.data.paramData.id,that,'signIn')
                },
                fail:err=> {
                  wx.showToast({
                    title: '拍照相片读取地址失败！',
                    icon:'error',
                    duration:2000
                  })
                }
            })
        },
        fail(err) {
          wx.showToast({
            title: '拍照相片读取失败！' + err,
            icon:'error',
            duration:2000
          })
        }
      })
    },

    // 签退
    signOut:function(){
      let that = this
      let paramData = that.data.paramData
      if(paramData.isFailed === '1' && !paramData.failedRemark){
        wx.showToast({
          title: '服务失败了，但失败原因未填写！',
          icon: 'none',
          duration: 2000
        })
        return false
      }
      paramData.signEndDate = new Date()
      let actualTimeLen = formatTimeLen(paramData.signStartDate,paramData.signEndDate)
      paramData.actualServiceTime = actualTimeLen
      paramData.appraiseTime = that.data.voiceTimeLen
      that.setData({
        paramData:paramData
      })
      if(paramData.planServiceTime && (actualTimeLen < paramData.planServiceTime)) {
        // 计算实际时间与计划时间结果
        wx.showModal({
          title: '温馨提示',
          content: '实际服务时长小于预计服务时长，确认签退吗？',
          cancelText:'取消',
          confirmText:'签退',
          success (res) {
            if (res.confirm) {
              // 强行签退，拍照
              if(that.data.orderSetData.inPhotoSet === 0) {
                if(!that.data.signInImage){
                  wx.showToast({
                    title: '必须要有签到图片',
                    icon:'icon',
                  })
                  return false
                }
                wx.chooseImage({
                  sizeType: ['compressed'],
                  sourceType: ['camera'],
                  success (ress) {
                      // tempFilePath可以作为img标签的src属性显示图片
                      const tempFilePaths = ress.tempFilePaths
                      wx.getFileSystemManager().readFile({
                          filePath: tempFilePaths[0],
                          success:resss=>{
                            that.uploadFile(tempFilePaths[0],that.data.paramData.id,that,'signOut')
                            that.signOutData()
                          },
                          fail: console.error
                      })
                  },
                  fail(err) {
                      console.log('err',err)
                  }
                })
              }else{
                that.signOutData()
              }
            } else if (res.cancel) {
              
            }
          },
          fail:(err)=>{
            console.log('err',err)
          }
        })
      }else{
        if(that.data.orderSetData.outPhotoSet === 0) {
          wx.chooseImage({
            sizeType: ['compressed'],
            sourceType: ['camera'],
            success (ress) {
                // tempFilePath可以作为img标签的src属性显示图片
                const tempFilePaths = ress.tempFilePaths
                wx.getFileSystemManager().readFile({
                    filePath: tempFilePaths[0],
                    success:resss=>{
                      that.uploadFile(tempFilePaths[0],that.data.paramData.id,that,'signOut')
                      that.signOutData()
                    },
                    fail: console.error
                })
            },
            fail(err) {
                console.log('err',err)
            }
          })
        }else{
          that.signOutData()
        }
      }
    },

    // 签退数据提交
    signOutData:function () {
      const that = this
      wx.getLocation({
        success(s) {
          let paramData = that.data.paramData
          paramData.signEndLatitude = s.latitude
          paramData.signEndLongitude = s.longitude
          // paramData.signEndDate = new Date()
          api.put(update,paramData).then(res=>{
            wx.navigateBack({
                delta: 2
            })
          }).catch(err=>{
            console.log(err)
          })
        }
      })
    },

    // 放大图片方法
    bigImg:function(url) {
      if(url) {
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
