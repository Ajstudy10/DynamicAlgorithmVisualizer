# Use a Node.js image to build the application
FROM node:18 AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Build the application for production
RUN npm run build

# Use a lightweight web server to serve the built files
FROM nginx:alpine

# Copy the built files to the Nginx web server's directory
COPY --from=build /app/dist /usr/share/nginx/html

# Expose port 80 for the web server
EXPOSE 80

# Start Nginx when the container runs
CMD ["nginx", "-g", "daemon off;"]