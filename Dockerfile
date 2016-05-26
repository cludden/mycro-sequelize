FROM node:latest

RUN useradd --user-group --create-home --shell /bin/false app

ENV HOME=/home/app

ADD package.json npm-shrinkwrap.json $HOME/tmp/
RUN chown -R app:app $HOME/*

USER app
WORKDIR $HOME/tmp
RUN npm install
RUN mkdir -p $HOME/src && cp -a $HOME/tmp/node_modules $HOME/src
WORKDIR $HOME/src

USER root
COPY . $HOME/src
RUN chown -R app:app $HOME/*
USER app

CMD npm start
