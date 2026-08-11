FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package config
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

# Copy package descriptors
COPY packages/shared/package.json ./packages/shared/
COPY apps/backend/package.json ./apps/backend/

# Install all dependencies (workspaces)
RUN npm install

# Copy source
COPY packages/shared ./packages/shared
COPY apps/backend ./apps/backend

# Build shared package then backend
RUN npm run build --workspace=@gigflow/shared && \
    npm run build --workspace=@gigflow/backend

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copy built artifacts and dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/
COPY --from=builder /app/apps/backend/dist ./apps/backend/dist
COPY --from=builder /app/apps/backend/package.json ./apps/backend/

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/v1/health || exit 1

CMD ["npm", "run", "start", "--workspace=@gigflow/backend"]
