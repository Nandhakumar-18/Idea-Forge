FROM node:24-slim
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

# Install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY . .

# Build the application (client + server)
RUN pnpm run build

# Start the application
CMD ["pnpm", "start"]
