FROM oven/bun:1-alpine  

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
EXPOSE 8000

CMD ["bun", "src/server.ts"]