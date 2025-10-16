FROM oven/bun:latest

WORKDIR /app

COPY package*.json ./
RUN bun install --production

COPY index.ts ./

EXPOSE 3000

CMD ["node", "index.ts"]