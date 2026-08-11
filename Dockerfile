FROM node:24-bookworm-slim AS build
WORKDIR /build

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vazio = URLs relativas (/api/...), atendidas pelo proxy do nginx do estagio
# seguinte. So preencher se o front for servido numa origem diferente da API.
ARG VITE_API_URL=
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:1.29-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /build/dist /usr/share/nginx/html

EXPOSE 80
