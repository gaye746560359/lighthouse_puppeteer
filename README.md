Dockerfile用作构建镜像docker build -t lhr .
run.mjs用作逻辑代码
url.json是需要测试的页面链接
要切换不同项目，需要替换url中的连接，以及修改run.mjs的login方法中的元素操作
docker run -v /mnt/e/lhr_docker/:/app/ --name lhr lhr容器运行完后会在当前目录下生成所有页面的报告并整合进一个报告文件
