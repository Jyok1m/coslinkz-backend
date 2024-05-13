# Use an official Node.js runtime as the base image
FROM node:22.1.0

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and yarn.lock into the directory
COPY package*.json ./
COPY yarn.lock ./

# Install any needed packages specified in package.json
RUN yarn install

# Bundle app source inside the docker image
COPY . .

# Make the app's port available to the outside world
EXPOSE 4000

# Define the command that will run the app, you can change this according to your need
CMD [ "yarn", "start", "nodemon" ]
