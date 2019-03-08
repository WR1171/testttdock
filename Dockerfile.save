
FROM node:8
MAINTAINER <edguy@eguy.org>

RUN apt-get update && apt-get -y install net-tools lsof vim

# Create app directory
# WORKDIR /usr/src/
# RUN git clone git@bitbucket.org:cengineteam/cen-web-chat.git
WORKDIR /usr/src/cen-web-chat
COPY . .

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
#COPY package*.json ./

#RUN npm install pm2 -g
#RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
RUN npm install
RUN	npm run build

#RUN npm start
# RUN /usr/src/app/node_modules/pm2/bin/pm2 restart cenweb
# RUN PORT=33000 npx pm2 start  server.js --name "censerver"

EXPOSE 3000
ENV CENCONFIG=./constants.local
CMD [ "npm", "run", "watch" ]
#CMD ["pm2-runtime", "server.js"]


# git clone git@bitbucket.org:cengineteam/cen-web-chat.git
