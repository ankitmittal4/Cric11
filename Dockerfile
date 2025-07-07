FROM node:20.18.0

WORKDIR /usr/src/cric11-backend
RUN mkdir -p /usr/src/cric11-backend/logs

COPY package*.json ./

RUN apt-get update

RUN npm install

COPY . .

EXPOSE 8000

CMD [ "npm", "run", "dev" ]
