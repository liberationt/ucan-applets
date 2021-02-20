const index = '/wechat/service/order/index/' // 首页
const orgList = '/wechat/service/order/list' // 工单列表统计
const orgListDetail = '/wechat/service/order/detail' // 工单列表详情
const deleteImg = '/file/order/image/delete' // 删除图片
const update = '/wechat/service/order/update' // 修改数据
const orderSet = '/wechat/service/order/set'  // 工单设置
const login = '/wechat/wechat/applets/login' // 登录授权
const openIdLogin = '/uaa/oauth/token' // 登录授权
const baseInfo = '/wechat/service/order/info' // 服务人员基本信息
const bindOrg = '/wechat/service/order/org' // 服务人员绑定服务商统计
const wxLogin = '/uaa/oauth/token' // 微信账号密码
const vCode = '/uaa/open/api/getCode' // 验证码
const loginBind = '/wechat/service/order/bind' // 登陆绑定 
const unbind =  '/wechat/service/order/unbind' // 解除绑定

module.exports = {
    index,
    orgList,
    orgListDetail,
    deleteImg,
    update,
    orderSet,
    login,
    openIdLogin,
    baseInfo,
    bindOrg,
    wxLogin,
    vCode,
    loginBind,
    unbind
}