FROM node:16    

WORKDIR /usr/src/app

COPY package*.json .

RUN yarn install --legacy-peer-deps

COPY prisma ./prisma/

RUN yarn prisma generate

COPY . .

#private port sẽ chạy
EXPOSE 8080

# node index.js => khởi chạy server

CMD ["node","index.js"]