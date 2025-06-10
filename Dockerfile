# Use the official nginx base image
FROM nginx:latest

# Copy custom nginx config
COPY default.conf /etc/nginx/conf.d/default.conf

# Copy your HTML file
COPY html/ /usr/share/nginx/html/

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
