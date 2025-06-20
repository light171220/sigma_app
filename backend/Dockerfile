FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM node:18-alpine AS production

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/templates ./templates
COPY --from=builder /app/scripts ./scripts

RUN addgroup -g 1001 -S nodejs
RUN adduser -S sigma -u 1001
USER sigma

EXPOSE 3000

CMD ["node", "dist/main"]