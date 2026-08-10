FROM node:22.22.2

ENV HOME /app

RUN apt-get update && \
    apt-get install -y sudo openssh-server

RUN mkdir -p /run/sshd
RUN ssh-keygen -A

RUN useradd -ms /bin/bash chatooha && \
    echo "chatooha:strongpassword" | chpasswd && \
    usermod -aG sudo chatooha && \
    echo "chatooha ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

RUN chown -R chatooha:chatooha /home/chatooha

RUN npm install -g @vue/cli
RUN npm install -g @vue/cli-init

EXPOSE 22

CMD ["/bin/bash", "-c", "/usr/sbin/sshd -D"]
# CMD npm install && npm run serve
