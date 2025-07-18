FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npx prisma generate

RUN npx tsc

CMD ["node", "dist/index.js"]


EXPOSE 7000