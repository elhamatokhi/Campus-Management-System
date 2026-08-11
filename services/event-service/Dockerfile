FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY services/event-service/package.json ./services/event-service/package.json

RUN npm ci --workspace services/event-service --include-workspace-root \
  && npx prisma generate \
  && npm prune --omit=dev --workspace services/event-service --include-workspace-root \
  && npm cache clean --force

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4002

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/services/event-service/package.json ./services/event-service/package.json
COPY services/event-service/src ./services/event-service/src

WORKDIR /app/services/event-service

EXPOSE 4002

CMD ["node", "src/server.js"]
