# ================================
# Step 1: Build the Next.js app
# ================================
FROM node:18-slim AS builder

# Optional: prevent prompts during install
ENV DEBIAN_FRONTEND=noninteractive

# Set working directory
WORKDIR /app

# Copy dependencies and install
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the app and build
COPY . .
RUN npm run build

# ================================
# Step 2: Run the app with Node.js
# ================================
FROM node:18-slim AS runner

# Set working directory
WORKDIR /app

# Copy only the necessary build files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js ./next.config.js

# Optional: ensure correct timezone/locale (for production)
ENV TZ=Asia/Kolkata
ENV NODE_ENV=production
ENV PORT=3000

# Expose the default Next.js port
EXPOSE 3000

# Start the server
CMD ["npm", "start"]
