// components/orderDetailCard/orderDetailCard.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        topData:{
            type:Object
        }
    },

    /**
     * 组件的初始数据
     */
    data: {

    },

    /**
     * 组件的方法列表
     */
    methods: {
    // 拨打电话
    makeCall: function (e) {
        let mobile =  e.currentTarget.dataset.mobile
        let homePhone = e.currentTarget.dataset.homephone
        if(mobile) {
            wx.makePhoneCall({
                phoneNumber: mobile, // 手机
                success(){},
                fail(err){
                    console.log('打手机电话失败',err)
                }
            })
        }else{
            if(homePhone) {
                wx.makePhoneCall({
                    phoneNumber: homePhone, // 家庭电话
                    success(){},
                    fail(err){
                        console.log('打家庭电话失败',err)
                    }
                })
            }else{
                wx.showToast({
                    title: '暂无老人的联系方式，如有需要请与服务商联系',
                    icon: 'none',
                    duration: 2000
                  })
            }
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
            fail(){}
        })
    }
    }
})
