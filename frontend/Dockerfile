FROM node:20-alpine

# Set the working directory
WORKDIR /app

# Ensure the node user owns the app directory and created subdirectories
# This is crucial for named volumes to inherit the correct permissions
RUN chown -R node:node /app

# Switch to the node user for all subsequent operations
USER node

# Install dependencies first (layer cache)
COPY --chown=node:node package.json package-lock.json ./
RUN npm install

# Copy source with correct ownership
COPY --chown=node:node . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
