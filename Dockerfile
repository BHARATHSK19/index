# ------------------------------------------------------------------------------
# OJIX Production Container - React front end + Express API (Build 04)
# ------------------------------------------------------------------------------

# 1) Build the React front end (web/ -> web/dist)
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY web ./web
RUN npm run build

# 2) Runtime: API server + built site only
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
RUN apk add --no-cache wget
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY server.js db.js store.js mailer.js admin-routes.js ./
COPY --from=build /app/web/dist ./web/dist
COPY web/src/data/serviceSlugs.json ./web/src/data/serviceSlugs.json
RUN mkdir -p /app/data && chown -R node:node /app
USER node
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1
EXPOSE 3000
CMD ["node", "server.js"]
