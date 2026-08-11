FROM node:20-alpine AS builder

WORKDIR /app

# Copy root config
COPY package.json package-lock.json* ./
COPY tsconfig.base.json ./

# Copy packages and apps
COPY packages/shared/package.json ./packages/shared/
COPY apps/frontend/package.json ./apps/frontend/

# Install dependencies
RUN npm install

# Copy source code
COPY packages/shared ./packages/shared
COPY apps/frontend ./apps/frontend

# Build frontend (and shared as dependency)
RUN npm run build --workspace=@gigflow/shared && \
    npm run build --workspace=@gigflow/frontend

FROM nginx:alpine AS runner
COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html
COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
