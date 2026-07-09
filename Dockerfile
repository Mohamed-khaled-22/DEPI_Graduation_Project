FROM node:20-bookworm-slim

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./

RUN npm ci

RUN npm rebuild sqlite3 --build-from-source

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server/index.js"]