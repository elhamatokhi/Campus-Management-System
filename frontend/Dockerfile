FROM node:24-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json ./frontend/package.json

RUN npm ci --workspace frontend

COPY frontend ./frontend

ARG VITE_USER_SERVICE_URL=http://localhost:4001
ARG VITE_EVENT_SERVICE_URL=http://localhost:4002
ARG VITE_BOOKING_SERVICE_URL=http://localhost:4003

ENV VITE_USER_SERVICE_URL=$VITE_USER_SERVICE_URL
ENV VITE_EVENT_SERVICE_URL=$VITE_EVENT_SERVICE_URL
ENV VITE_BOOKING_SERVICE_URL=$VITE_BOOKING_SERVICE_URL

RUN npm run build -w frontend

FROM nginx:1.27-alpine AS runner

COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
