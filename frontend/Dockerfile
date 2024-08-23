FROM node:20-alpine

WORKDIR /usr/src/app

COPY package* .

RUN npm install

COPY . .

EXPOSE 5173
CMD ["npm", "run", "dev"]