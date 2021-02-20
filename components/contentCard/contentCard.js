// components/contentCard/contentCard.js
const app = getApp()
const token = app.globalData.token
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        objData:{
            type:Object
        },
        orderStatus:{
            type:String
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        imgUrl:app.globalData.imgUrl,
        playRecording:false,
        innerAudioContext:'', // 播放语音实例
    },

    lifetimes: {
        attached: function() {
            
        },
        detached: function() {
          // 在组件实例被从页面节点树移除时执行
          if(this.data.innerAudioContext) {
            this.data.innerAudioContext.destroy()  // 摧毁播放语音实例
          }
        },
      },

    /**
     * 组件的方法列表
     */
    methods: {
        // 新增服务照片
        addImage:function(){    
            let that = this
            if(that.data.objData.images.length > 6){
                return false
            }
            wx.chooseImage({
                sizeType: ['compressed'],
                sourceType: ['camera'],
                success (res) {
                    // tempFilePath可以作为img标签的src属性显示图片
                    const tempFilePaths = res.tempFilePaths
                    wx.getFileSystemManager().readFile({
                        filePath: tempFilePaths[0],
                        success:ress=>{
                            let url = '/file/order/image/detailId'  // 服务照片
                            wx.uploadFile({
                                url: `${app.globalData.host}${url}`, 
                                header: {
                                "Content-Type": "multipart/form-data",
                                "token": app.globalData.token,  
                                "Authorization": "Bearer " + app.globalData.token
                                },
                                filePath: tempFilePaths[0],
                                name: 'file',
                                formData: {
                                'file': 'multipart/form-data',
                                'detailId':that.data.objData.id,
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
                                    data.imgUrl = data.originImgUrlPath
                                    data.id = data.ImageId
                                    let objData = that.data.objData
                                    objData.images.push(data)
                                    that.setData({
                                        objData:objData
                                    })
                                    wx.showToast({
                                      title: '上传成功',
                                      icon:'success',
                                      duration: 1500
                                    })
                                },
                                fail (err) {
                                console.log('err', err)
                                }
                            })       
                        },
                        fail: console.error
                    })
                },
                fail(err) {
                    console.log('err',err)
                }
            })
        },
        // 删除服务照片
        deleteImage:function(e){
            const that = this
            const id = e.currentTarget.dataset.id
            const idx = e.currentTarget.dataset.idx
            let url = '/file/order/image/delete/'
            wx.request({
                url: `${app.globalData.host}${url}` + id,
                method:'DELETE',
                header:{
                'Content-Type': 'application/x-www-form-urlencoded;',
                'token': app.globalData.token,
                'Authorization': 'Bearer ' + app.globalData.token
                },
                success(res){
                    let objData = that.data.objData
                    objData.images.splice(idx,1)
                    that.setData({
                        objData:objData
                    })
                    wx.showToast({
                        title: '服务照片删除成功',
                        icon:'success',
                        duration: 1500,
                    })
                }
            })
        },
        // 播放语音
        playRecording:function() {
            if(this.data.playRecording) {
                wx.showToast({
                  title: '语音还未播放完',
                  icon: 'none'
                })
                return false
            }
            this.setData({
                innerAudioContext:wx.createInnerAudioContext()
            })
            let innerAudioContext = this.data.innerAudioContext
            innerAudioContext.autoplay = true
            innerAudioContext.src = `${app.globalData.imgUrl}${this.data.objData.evaluate.fileUrl}`
            innerAudioContext.onPlay(() => {
              this.setData({
                  playRecording:true
              })
            })
            innerAudioContext.onEnded(()=>{
                this.setData({
                    playRecording:false
                })
            })
            innerAudioContext.onError((res) => {
              console.log(res.errMsg)
              console.log(res.errCode)
            })
        },
        // 放大图片
        magnify:function(e) {
            const imgUrl = e.currentTarget.dataset.url
            // 点击事件带参传入父级
            this.triggerEvent('lookBigImg',imgUrl)
        }
    }
})
