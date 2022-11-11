FROM node:16-bullseye-slim

WORKDIR /app

COPY . /app/

RUN npm install
RUN npm run build

EXPOSE 8347

CMD ["npm", "start"]
