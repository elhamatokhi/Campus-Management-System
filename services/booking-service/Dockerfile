FROM node:24-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma
COPY services/booking-service/package.json ./services/booking-service/package.json

RUN npm ci --workspace services/booking-service --include-workspace-root \
  && npx prisma generate \
  && npm prune --omit=dev --workspace services/booking-service --include-workspace-root \
  && npm cache clean --force

FROM node:24-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=4003

COPY --from=deps /app/package.json ./package.json
COPY --from=deps /app/package-lock.json ./package-lock.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/services/booking-service/package.json ./services/booking-service/package.json
COPY services/booking-service/src ./services/booking-service/src

WORKDIR /app/services/booking-service

EXPOSE 4003

CMD ["node", "src/server.js"]
