FROM node:18.4.0-alpine

WORKDIR /usr/app

RUN npm install -g pnpm

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN pnpm i

COPY . .

CMD ["npm", "run", "start:dev"]
