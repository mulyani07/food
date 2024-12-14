FROM node:18.20.5
WORKDIR /app
ENV PORT 3000
ENV JWT_SECRET=HiayiB6B57^ba9nnHsina79b285&bw0*Bo8yINUyds8O*hkj7bha7sHkihasn86^8hjagJgai
COPY . .
RUN npm install
EXPOSE 3000
CMD [ "npm", "run", "start"]