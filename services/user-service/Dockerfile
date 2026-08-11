FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY services/user-service/package.json ./services/user-service/package.json

RUN npm ci --workspace services/user-service --include-workspace-root \
  && npx prisma generate \
  && npm prune --omit=dev --workspace services/user-service --include-workspace-root \
  && npm cache clean --force

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4001

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/services/user-service/package.json ./services/user-service/package.json
COPY services/user-service/src ./services/user-service/src

WORKDIR /app/services/user-service

EXPOSE 4001

CMD ["node", "src/server.js"]
