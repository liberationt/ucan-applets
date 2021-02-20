FROM nginx:1.16
# 复制 证书文件
COPY cert  /etc/nginx/cert
# 将自己的配置文件覆盖镜像中的 nginx 配置文件
COPY nginx.conf /etc/nginx/nginx.conf
#设置时区
RUN /bin/cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && echo 'Asia/Shanghai' >/etc/timezone
EXPOSE 8443
