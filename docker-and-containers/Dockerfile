FROM node:14-alpine
RUN mkdir /opscentric
ADD . /opscentric
WORKDIR /opscentric
RUN npm i
EXPOSE 4000
CMD ["npm", "start"]