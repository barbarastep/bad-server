FROM node:22-alpine as build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM alpine:3.20
WORKDIR /app/frontend
COPY --from=build /app/frontend/dist /opt/frontend-dist
CMD ["sh", "-c", "rm -rf /app/frontend/dist/* && cp -r /opt/frontend-dist/. /app/frontend/dist && tail -f /dev/null"]
