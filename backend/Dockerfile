FROM oven/bun:latest

WORKDIR /app

COPY package*.json bun.lock ./

RUN bun install --production

# copy source code
COPY index.ts ./

EXPOSE 3000

CMD ["bun", "run", "index.ts"]