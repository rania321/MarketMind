# Build stage
FROM node:18 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build

# Serve stage
FROM node:18-slim
WORKDIR /app
COPY --from=build /app/build /app/build
RUN npm install -g serve
# Install curl for debugging
RUN apt-get update && apt-get install -y curl
# Pass environment variable during build
ARG REACT_APP_API_URL=http://backend:5000
ENV REACT_APP_API_URL=$REACT_APP_API_URL
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]