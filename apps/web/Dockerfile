FROM caddy:2-alpine

# Copy static files to Caddy's default serve directory
COPY apps/web/public /srv

# Copy the Caddyfile
COPY apps/web/Caddyfile /etc/caddy/Caddyfile

# Replace the API URL placeholder in HTML files at build time
ARG API_URL=http://localhost:3000
RUN find /srv -name "*.html" -exec sed -i "s|%%API_URL%%|${API_URL}|g" {} +

EXPOSE 80
