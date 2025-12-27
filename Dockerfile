# syntax=docker/dockerfile:1

########################
# 1) deps
########################
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

########################
# 2) build
########################
FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

########################
# 3) runner
########################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S app && adduser -S app -G app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# placeholder for your bind mount; also ensures /app is owned by non-root user
RUN touch /app/db.json && chown -R app:app /app

USER app
EXPOSE 3000
CMD ["node", "server.js"]