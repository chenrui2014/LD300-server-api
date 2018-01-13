FROM node:8.9.4

RUN mkdir -p /home/Service
RUN mkdir -p /home/Service/dist
RUN mkdir -p /home/Service/_3part
RUN mkdir -p /home/Service/_3part/amf
RUN mkdir -p /home/Service/_3part/yellowstone

WORKDIR /home/Service

ADD dist/ /home/Service/dist
ADD _3part/ /home/Serice/_3part
ADD _3part/amf/ /home/Service/_3part/amf
ADD _3part/yellowstone/ /home/Service/_3part/yellowstone

COPY src/ /home/Service/src
COPY .babelrc /home/Service
COPY package.json /home/Service
COPY process.yml /home/Service

RUN npm cache verify \
    && npm config set registry https://registry.npm.taobao.org \
    && npm i webpack -g \
    && npm i pm2 -g \
    && npm i node-gyp -g \
    && npm i babel-cli -g \
    && npm i

EXPOSE 9000
EXPOSE 3001

CMD ["npm", "start","pm2"]