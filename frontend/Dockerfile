FROM node:20-alpine

RUN apk add --no-cache su-exec

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]
