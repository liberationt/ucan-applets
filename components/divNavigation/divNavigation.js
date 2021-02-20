// components/divNavigation/divNavigation.js
const App = getApp()
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        navObj:{
            type:Object
        },
        navType:{
            // normal:正常公司名字，back:返回上一页<与当前页名字,logo:返回logo图片与公司名字
            type:String
        },
        bgColor:{
            type:String,
            value:'#FFF'
        },
        color:{
            type:String,
            value:'#000'
        },
        titleName: {
            type: String,
            value: ''
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        navHeight: 0,
        navTop: 0,
        type:'normal' 
      },

    lifetimes: {
        attached() {
            this.setData({
                navHeight:App.globalData.navHeight,
                navTop:App.globalData.navTop
            })
        },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        back(){
            const pages = getCurrentPages()
            console.log('pages', pages)
            if(pages[pages.length - 1].route == 'pages/orderDetail/orderDetail'){
                wx.navigateBack({
                  delta: 2,
                })
            }else{
                wx.navigateBack({
                    delta: 1,
                })
            }
        }
    }
})
