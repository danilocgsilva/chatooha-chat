FROM node:22.22.2

ENV HOME /app

RUN npm install -g @vue/cli
RUN npm install -g @vue/cli-init

#CMD npm install && npm run serve
CMD npm install && while : ; do sleep 1000; done

