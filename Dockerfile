FROM node:22-bookworm-slim AS build

WORKDIR /app/web
COPY web/package.json web/package-lock.json ./
RUN npm ci --include=dev

COPY data/ /app/data/
COPY web/ ./

# O Railway fornece esta variável como build arg quando ela é configurada no serviço.
# Sem a opção explícita, a conferência dos dados continua obrigatória.
ARG PERMITIR_NAO_CONFERIDO=0
RUN PERMITIR_NAO_CONFERIDO="$PERMITIR_NAO_CONFERIDO" npm run build

FROM caddy:2-alpine AS runtime

COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/web/dist/ /srv/

ENV PORT=8080
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
