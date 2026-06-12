FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS install
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM base AS release
WORKDIR /app
COPY --from=install /app/node_modules ./node_modules
COPY . .

ENV PORT=4000
EXPOSE 4000

CMD ["bun", "run", "src/server.ts"]
