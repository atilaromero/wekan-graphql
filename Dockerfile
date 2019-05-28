FROM node:12.3-alpine

EXPOSE 4000
ENV  REST_URL "http://localhost"
COPY package.json package-lock.json ./
RUN  npm up
COPY . .
CMD  npm start