FROM node:lts as build

WORKDIR /usr/local/status-page

COPY ./src ./src
COPY angular.json .
COPY ./package*.json .
COPY ./tsconfig*.json .
COPY ./LICENSE .

RUN npm install -g @angular/cli@17.1.2 && npm install

RUN npm run build

FROM nginxinc/nginx-unprivileged

USER root
RUN apt-get update && apt-get install --yes jq && apt-get clean

USER nginx

COPY --chown=nginx:nginx --from=build /usr/local/status-page/dist/scs-statuspage/browser /usr/share/nginx/html
# Copy file to customize config file using environment variables
# This file is being run by the ENTRYPOINT script when the container starts
COPY 99-set-statuspage-config.sh /docker-entrypoint.d

EXPOSE 8080
