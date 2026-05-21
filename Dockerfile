# Build stage
FROM node:20 AS build

WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

# Runtime stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
