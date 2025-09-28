# Use Node.js LTS lightweight image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the code
COPY . .

# Expose your service port
EXPOSE 3004

# Start the service
CMD ["node", "src/app.js"]