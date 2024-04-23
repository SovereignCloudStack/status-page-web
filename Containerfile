FROM docker.io/node:20-alpine3.18 as builder

WORKDIR /status-page

COPY . .

RUN apk update --no-cache && \
apk upgrade && \
npm install && \
npx ng build

FROM docker.io/nginx:1.25

WORKDIR /status-page

COPY --from=builder /status-page/dist/scs-statuspage/browser /status-page/dist/scs-statuspage/3rdpartylicenses.txt ./
COPY ./LICENSE ./README.md ./entrypoint.sh ./
COPY ./nginx.conf /etc/nginx/conf.d/status-page.conf
RUN rm -f /etc/nginx/conf.d/default.conf

EXPOSE 8080

ENTRYPOINT [ "/status-page/entrypoint.sh" ]
CMD ["nginx",  "-g", "daemon off;"]
