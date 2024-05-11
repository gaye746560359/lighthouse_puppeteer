FROM node:lts-alpine

WORKDIR /app

RUN sed -i 's/dl-cdn.alpinelinux.org/mirrors.aliyun.com/g' /etc/apk/repositories && \
    apk update && \
    apk add --no-cache chromium && \
    ln -fs /usr/share/zoneinfo/Asia/Shanghai /etc/localtime && \
    npm install -g npm@10.7.0 && \
    npm install puppeteer lighthouse es-main

ENV PUPPETEER_EXECUTABLE_PATH="/usr/bin/chromium-browser"

CMD ["node", "run.mjs"]