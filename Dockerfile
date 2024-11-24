#
# © 2022-2022 Burns Recording Company
# Created: 25/12/2022
#
# NOTE: This is still under development and not all of the available configurations are available here yet.
#
# Currently this buld will roll your files in the 'media' folder into the image itself. This will make deploying simpler,
# but file management more restrictive since you'll have to rebuild the Docker image any time you want to change the track listing.
# If you want to change that behaviour, then:
#   * add a line containing 'media' to the `.dockerignore` file
#   * add a line to this file somewhere before the CMD line containing: RUN mkdir /app/media
# Following those two steps, build the image by running `npm run container:build`.
# Once it's built, run the container and map a Docker volume from your media directory to the '/app/media' directory inside the container.
# 
# You may have to make further changes here to fit your needs.
# For more information visit: https://docs.docker.com/engine/reference/builder/

FROM node:lts

WORKDIR /app
VOLUME /media

COPY . /app/

RUN npm install
RUN npm run build:client
RUN npm run build:client:styles
RUN npm run build:server

ENV PL_10_HOSTNAME="0.0.0.0"
ENV NODE_ENV="production"
EXPOSE 8347

CMD ["npm", "start"]
