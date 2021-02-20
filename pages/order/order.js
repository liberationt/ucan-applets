// pages/order/order.js
import { formatTime } from '../../utils/util'
import api from '../../api/request'
import { orgList,orderSet } from '../../api/api'
const app =getApp()
Page({
    /**
     * 页面的初始数据
     */
    data: {
        showDate: '', // 日期筛选显示 2021年01月08日
        submitDate: '', // 接口提交日期参数 2021-01-08
        pageNum: 1,
        total:'',
        tabs:['今日工单','历史工单','未来工单'],
        orderStatusArr:[
            {
                name:'全部服务',
                status:'',
                value:'0',
            },
            {
                name:'服务中',
                status:'serving',
                value:'1'
            },
            {
                name:'待服务',
                status:'to_be_served',
                value:'2'
            },
            {
                name:'服务完成',
                status:'service_complete',
                value:'3'
            },
            {
                name:'服务失败',
                status:'service_failed',
                value:'4'
            },
        ],
        fullName:'',
        orderStatus:'',
        orderStatusName:'全部服务',
        tabIndex:0,
        searchLoading:false,
        searchLoadingComplete:false,
        itemDataArr:[],
    },

    /**
     * 生命周期函数--监听
     * 页面加载
     */
    onLoad: function (option) {
        this.initNowDate()
        // 加载工单列表
        if(option.tabIndex) {
            // 如果是历史工单转跳进来，则清空日期
            if(option.tabIndex){
                this.data.submitDate = ''
            }
            this.setData({
                tabIndex: Number(option.tabIndex) - 1
            })
        }
        this.getData(1,'refresh',Number(option.tabIndex))
    },
    // 获取列表数据
    getData(pageNum,type,tabIndex){
        wx.showLoading({
            title: '加载中...',
            mask:true
          })
        let params = {
            date:this.data.submitDate,
            empId:app.globalData.empId,
            orderType: tabIndex ? tabIndex : this.data.tabIndex + 1,
            pageNum: pageNum,
            fullName:this.data.fullName,
            orderStatus: this.data.orderStatus,
            pageSize:'5'
        }
        api.get(orgList, params).then(res=>{
            console.log('工单列表', res.data)
            res.data.list.forEach(item=>{
                if(item.signStartDate){
                    let strTime = item.signStartDate
                    if(strTime.substring(strTime.length-2) === '.0') {
                        item.signStartDate = strTime.substr(0,strTime.length - 2)
                    }
                  }
            })
            this.setData({
                total:res.data.total,
                searchLoadingComplete:false
            })
            if(type === 'refresh') {
                this.setData({
                    itemDataArr:res.data.list,
                    pageNum: 1
                })
            }else if(type === 'more') {
                this.setData({
                    itemDataArr:this.data.itemDataArr.concat(res.data.list),
                    searchLoading:false
                })
            }
            //隐藏loading 提示框
            wx.hideLoading();
        }).catch(err=>{
            //隐藏loading 提示框
            wx.hideLoading();
            wx.showToast({
                title: '获取失败，请稍后重试',
                icon:'none',
                duration:2500,
              })
        })
    },
    // 加载更多列表数据
    onMore(){
        //在当前页面显示导航条加载动画
        wx.showNavigationBarLoading();
        //显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
        wx.showLoading({
          title: '加载中...',
        })
        if( Math.ceil(this.data.total / 5) > this.data.pageNum) {
            this.setData({
                pageNum:this.data.pageNum + 1,
                searchLoading:true
            })
            this.getData(this.data.pageNum,'more')
        }else {
            this.setData({
                searchLoadingComplete:true
            })
        }
        //隐藏loading 提示框
        wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
    },

    // 刷新列表数据
    async onRefresh(){
        //在当前页面显示导航条加载动画
        wx.showNavigationBarLoading(); 
        //显示 loading 提示框。需主动调用 wx.hideLoading 才能关闭提示框
        wx.showLoading({
          title: '刷新中...',
        })
        await this.getData('1','refresh')
        if( Math.ceil(this.data.total / 5) >= this.data.pageNum){
            this.setData({
                searchLoadingComplete:true
            })
        }
        //隐藏loading 提示框
        wx.hideLoading();
        //隐藏导航条加载动画
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
    },

    // 初始化日期时间（今天）
    initNowDate:function(){
        let nowDate = ''
        let d = formatTime(new Date()).substring(0,10)
        let dateArr = d.split('/')
        nowDate = dateArr[0] + '年' + dateArr[1] + '月' + dateArr[2] +'日'
        this.setData({
            showDate:nowDate,
            submitDate:d.replace(/\//g,"-")
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
        this.onRefresh()
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
        //调用刷新时将执行的方法
    	this.onRefresh();
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.onMore()
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    },
    // 点击切换tab
    switchTo:function(e) {
        let index = e.currentTarget.dataset.index
        this.setData({
            tabIndex : index,
            orderStatus:''
        })
        this.setData({
            submitDate:''
        })
        this.onRefresh()
    },

    // 日期绑定
    bindDateChange: function(e) {
        let submitDate = e.detail.value
        let dateArr = e.detail.value.split('-')
        let showDate = dateArr[0] + '年' + dateArr[1] + '月' + dateArr[2] +'日'
        this.setData({
            showDate: showDate,
            submitDate: submitDate
        })
        this.onRefresh()
    },

    // 工单状态选择
    bindOrderStateChange: function(e) {
        this.setData({
            orderStatus:this.data.orderStatusArr[Number(e.detail.value)].status,
            orderStatusName:this.data.orderStatusArr[Number(e.detail.value)].name
        })
        this.onRefresh()
    },

    // 转跳到签到页
    toDetail: function(e) {
        let id = e.currentTarget.dataset.id
        const orderstatus = e.currentTarget.dataset.orderstatus
        if(orderstatus === 'serving'){
            // 如果是服务中，则转跳到orderDetail页面继续
            api.get(orderSet,{orderId:id}).then(res=>{
                let orderSetData = JSON.stringify(res.data)
                wx.navigateTo({
                    url: '/pages/orderDetail/orderDetail?id=' + id + '&orderSetData=' + orderSetData + '&orderStatus=' + orderstatus
                })
            })
        }
        if(orderstatus === 'service_complete' || orderstatus === 'service_failed') {
            // 如果是在服务完成或服务失败，则到服务完成页面
            wx.navigateTo({
                url: '/pages/orderDetailSign/orderDetailSign?id='+e.currentTarget.dataset.id,
            })
        }
        if(orderstatus === 'to_be_served') {
            // 如果是在待服务，则转跳到签到页面
            if(this.data.tabIndex == 2){
                // 如果是未来工单中，并且orderSet不为0，则待服务签到按钮隐藏（不给签到）
                api.get(orderSet,{orderId:id}).then(res=>{
                    let orderSetData = res.data
                    if(orderSetData.orderSet == 1){
                        wx.navigateTo({
                            url: '/pages/orderDetailSign/orderDetailSign?id='+e.currentTarget.dataset.id + '&orderSet=' + orderSetData.orderSet,
                        })
                    }else{
                        wx.navigateTo({
                            url: '/pages/orderDetailSign/orderDetailSign?id='+e.currentTarget.dataset.id,
                        })
                    }
                })
            }else{
                wx.navigateTo({
                    url: '/pages/orderDetailSign/orderDetailSign?id='+e.currentTarget.dataset.id,
                })
            }
        }
    },

    // 查询老人姓名
    toSearch: function(e) {
        this.setData({
            fullName:e.detail.value
        })
        this.onRefresh()
    }
})