# OpsCentric Mini Series: Docker and Containers

This lesson focuses on Docker and containerization. When you have completed this lesson you will know how to create a Docker container, run a Docker container and how to use Docker Compose to link containers together.

You can clone this repository to your computer out and follow along with this lesson but you will remember more of this information if you type the files out by hand. You will need Docker and Docker Compose installed on your machine to follow along with this tutorial, so if you have not yet done so please install them now. 

Most Docker installs will come with Docker Compose built in, but if you use Linux you may need to install is separately. You can find installation instructions for various operating systems here: https://docs.docker.com/get-docker/

## The Dockerfile

Docker uses a concept called Dockerfiles to define a container. The file is usually named Dockerfile (Though it does not have to be), and it contains all the information needed to build a container.

### Dockerfile Commands

#### The `FROM` Command
Most Dockerfiles start with a source container which is a prebuilt container stored on the Docker hub repository or on another repository somewhere else. In order to tell Docker which container you want to start with, you can use the `FROM` command.

In our case we are creating a NodeJS container and we want the version which is built on a lightweight linux operating system called Alpine. So we specify `FROM node:14-alpine`. Note that the number 14 specifies the NodeJS version and could be used by itself to get the default node container with a different operating system.

In general when referring to Docker containers use the `name:version` convention. If you do not specify a version Docker will pull the latest container in the repository. Go ahead and look at the Dockerfile in this repository as I will be referring to it as we continue.

#### The `RUN` Command
The `RUN` command in a Dockerfile tells Docker to run a command when building the container. In the case of our Dockfile we use `RUN mkdir /opscentric` to create a folder in the container, in which we will place our application files.

The `RUN` command can be used to execute any command which is available on the container operating systems command line. In our case that's Alpine Linux which has a lmited subset of normal Linux utilities but `mkdir` is still present.

#### The `ADD` Command
The `ADD` command in a Dockerfile tells Docker to add files to the container. In our case we use `ADD . /opscentric` to place the files in our repository into the container. Not the `.` as it is important, it specifies the local directory in which the Dockerfile resides.

You'll notice we also have a `.dockerignore` file in the repository which contains the following lines: 

```
.git
node_modules
docker-compose.yml
README.md
```

The `.dockerignore` file is a special file which tells Docker to ignore specific files and folders when building a container. It's useful when we have extra files that we don't need for our application to run.

#### The `WORKDIR` Command
The `WORKDIR` command tells Docker to run subsequent commands in the specified directory. In our case that's `/opscentric`. It's a simple but useful command especially for more complex containers which contain several directories.

#### The `EXPOSE` Command
The `EXPOSE` command tells Docker to open one or more ports in the container. In our case we just want to open port `4000` because that's the port that our Node app will use.

You can specify more than one port after the `EXPOSE` command just put a space between each one (i.e `EXPOSE 8080 4000 5000`).

#### The `CMD` Command
The `CMD` command tells Docker how to start the container. It takes a list of command or arguments.

For our Node app we want to run `npm start` so we use `CMD ["npm", "start"]`. Notice that each command is a string separated by a comma and that they are enclosed in brackets.

## Using Docker Containers

Docker containers can be built and run from just a Dockerfile. We will cover the basics below and then show you how to simplify complex container environments using an extra Docker tool called Docker Compose.

### Building Your Container
To build a Docker container you will first need to navigate in your command line terminal to the directory where your Dockerfile is located. Then you can run `docker build .`. If you have a Dockerfile with a custom name you can replace the `.` with the name of the file such as `docker build Dockerfile.custom`.

You can also add a tag to the finished container for easy reference later using the `-t` flag. Go ahead and try this now.

Make sure you are in the directory which contains the Dockerfile and Node application files from this repository and run `docker build -t opscentric-node .`. This will build your docker image and assign a tag to it called `opscentric-node`.

### Running Your Container
Once the build finishes run `docker images` to see a list of images in your local Docker container repository. You can also try to run your image using the `docker run opscentric-node` command.

Because this is a NodeJS app which tries to connect to a Database the container will output an error. There is no database present yet for the app to connec to. This is ok and expected, you are now ready to move onto learning about Docker Compose so you can run your app and a database container together.

## Docker Compose

