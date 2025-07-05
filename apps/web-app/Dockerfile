# --- Etap build ---
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json turbo.json ./
COPY tsconfig.json .eslintrc.json .prettierrc ./
COPY apps/web-app/package.json ./apps/web-app/
COPY apps/web-app ./apps/web-app
RUN npm install
RUN npm run build --workspace=apps/web-app

# --- Etap produkcyjny ---
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/web-app/.next ./.next
COPY --from=builder /app/apps/web-app/public ./public
COPY --from=builder /app/apps/web-app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
