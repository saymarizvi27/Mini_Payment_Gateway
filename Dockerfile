# syntax=docker/dockerfile:1.7
FROM node:20-alpine AS base
WORKDIR /app
ENV NODE_ENV=production

FROM base AS deps
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* pnpm-lock.yaml* yarn.lock* ./
RUN \
	if [ -f yarn.lock ]; then yarn --frozen-lockfile --non-interactive; \
	elif [ -f pnpm-lock.yaml ]; then corepack enable && pnpm i --frozen-lockfile; \
	else npm ci; fi

FROM base AS build
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS runtime
USER node
COPY --chown=node:node package.json ./
COPY --from=deps --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
