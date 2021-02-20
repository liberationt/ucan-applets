const app = getApp()
const formatJson = json => {
    const str = []
    for (var p in json) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(json[p]))
    }
    return str.join("&")
  }

const request = (url, options) => {
   return new Promise((resolve, reject) => {
        let header = {}
        var value = wx.getStorageSync('token')
        if (value) {
            app.globalData.token = value
            header = {
                'Content-Type': 'application/json; charset=UTF-8',
                'token': `${app.globalData.token}`,  
                'Authorization': 'Bearer ' + `${app.globalData.token}`
            }
        }else{
            header = {
                'Content-Type': 'application/json; charset=UTF-8'
            }
        }
       wx.request({
           url: `${app.globalData.host}${url}`,
           method: options.method,
           data: options.method === 'GET' ? options.data : JSON.stringify(options.data),
           header: header,
           success(request) {
               if(request.data.code === 50014){
                wx.showModal({
                    title: '温馨提示',
                    content: 'token过期，是否重新登录!',
                    cancelText: '否',
                    confirmText: '是',
                    success (res) {
                      if (res.confirm) {
                        wx.navigateTo({
                          url: '/pages/startUp/startUp',
                        })
                      } else if (res.cancel) {
                        console.log('用户点击取消')
                      }
                    }
                  })
               }
               if (request.data.code === 0) {
                   resolve(request.data)
               } else{
                   reject(request.data)
               }
           },
           fail(error) {
               reject(error.data)
           }
       })
   })
}

const get = (url, options = {}) => {
   return request(url, { method: 'GET', data: options })
}

const getB = (url, options) => {
    return request(url + options, { method: 'GET'})
 }

const post = (url, options, isFormData) => {
   return request(url, { method: 'POST', data: options }, isFormData)
}

const put = (url, options) => {
   return request(url, { method: 'PUT', data: options })
}

// 不能声明DELETE（关键字）
const remove = (url, options) => {
   return request(url, { method: 'DELETE', data: options })
}

module.exports = {
   get,
   getB,
   post,
   put,
   remove
}