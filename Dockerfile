FROM node:lts-slim AS base
RUN npm install -g bun
WORKDIR /app
COPY . ./

# Install dependencies based on the preferred package manager
FROM base AS deps
RUN bun i

# Rebuild the source code
FROM deps AS build
RUN bun preload
RUN bun run build

# Production image, run NextJS
FROM build
CMD ["bun", "start"]
