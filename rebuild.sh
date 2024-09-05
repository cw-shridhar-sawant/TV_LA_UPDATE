docker stop tvapiX2 && docker rm tvapiX2
docker build . -t cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`
cd /home/cloudwalkerx2/
docker run --name=tvapiX2_`git rev-parse --short HEAD` -d -p 5080:5080 --restart=always -v /home/minio/cats/assets/:/home/minio/cats/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`


#docker run --name=tvapiX2 -d -p 5080:5080 --restart=unless-stopped -v x2server_data:/usr/src/app/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`

#docker run --name=tvapiX2 -d -p 5080:5080 --restart=unless-stopped -v x2server_data:/usr/src/app/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`

## Amazon logs 
#docker run --name=tvapiX2 -d -p 5080:5080 --restart=unless-stopped --log-driver=awslogs --log-opt awslogs-group=docker_logs -v x2server_data:/usr/src/app/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`

## local logs
#docker run --name=tvapiX2 -d -p 5080:5080 --restart=unless-stopped -v x2server_data:/usr/src/app/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`

#docker logs -f tvapiX2 

docker run --name=tvapiX2 -d -p 5080:5080 --restart=unless-stopped --log-driver file-log-driver --log-opt fpath=/cloudwalker/x2server/cw_docker.log --log-opt max-size=100 --log-opt max-backups=1000 --log-opt max-age=3650 -v x2server_data:/usr/src/app/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`

tail -f /var/log/cloudwalker/x2server/cw_docker.log
#docker run --name=tvapiX2 --log-driver file-log-driver --log-opt fpath=/var/log/cloudwalker/x2server/cw_docker.log -d -p 5080:5080 --restart=unless-stopped -v x2server_data:/usr/src/app/assets/  cw/cloudwalkerx2:`git symbolic-ref -q --short HEAD`-`git describe --tags --long --dirty --always`





#docker stop tvapi-1.0.10  && docker rm tvapi-1.0.10
#docker build . -t cw/cloudwalkerx2:1.0.10
#docker run --name=tvapi-1.0.10 -d --restart=unless-stopped -v /home/ubuntu/cloudwalkerx2/assets/:/usr/src/app/assets  -p 0.0.0.0:5080:5080 cw/cloudwalkerx2:1.0.10
#docker logs -f tvapi-1.0.10
