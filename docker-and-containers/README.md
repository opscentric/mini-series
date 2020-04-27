# OpsCentric Mini Series: Docker and Containers

This lesson focuses on Docker and containerization. When you have completed this lesson you will know how to create a Docker container, run a Docker container and how to use Docker Compose to link containers together.

You can clone this repository to your computer and follow along with this lesson but you will remember more of this information if you type each file out by hand. You will need Docker and Docker Compose installed on your machine to follow along with this tutorial. If you have not yet done so please install them now. 

Most Docker installs will come with Docker Compose built in, but if you use Linux you may need to install it separately. You can find installation instructions for various operating systems here: https://docs.docker.com/get-docker/

## The Dockerfile

Docker uses a concept called Dockerfiles to define a container. The file is usually named Dockerfile (Though it does not have to be), and it contains all the information needed to build a container.

Our Dockerfile for this tutorial is actually pretty short:

```
FROM node:14-alpine
RUN mkdir /opscentric
ADD . /opscentric
WORKDIR /opscentric
RUN npm i
EXPOSE 4000
CMD ["npm", "start"]
```

Each line of the Dockerfile contains a command that tells Docker to do something during the build process. We'll go through each of these commands below to give you a comprehensive understanding of Docker basics.

### Dockerfile Directives

#### The `FROM` Directive

Most Dockerfiles start with a source container which is a prebuilt container stored on the Docker hub repository or on another repository somewhere else. In order to tell Docker which container you want to start with, you can use the `FROM` directive.

In our case we are creating a NodeJS container and we want the version which is built on a lightweight linux operating system called Alpine. So we specify `FROM node:14-alpine`. Note that the number 14 specifies the NodeJS version and could be used by itself to get the default node container with a different operating system.

In general when referring to Docker containers use the `name:version` convention. If you do not specify a version Docker will pull the latest container in the repository.

#### The `RUN` Directive

The `RUN` command in a Dockerfile tells Docker to run a command when building the container. In the case of our Dockfile we use `RUN mkdir /opscentric` to create a folder in the container, in which we will place our application files.

The `RUN` command can be used to execute any command which is available on the container operating systems command line. In our case that's Alpine Linux which has a lmited subset of normal Linux utilities but `mkdir` is still present.

#### The `ADD` Directive

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

Make sure you are in the directory which contains the Dockerfile and Node application files from this repository and run `docker build -t opscentric-node .` (Note the trailing period which tells Docker to use the Dockerfile in the current directory). This will build your docker image and assign a tag to it called `opscentric-node`.

### Running Your Container

Once the build finishes run `docker images` to see a list of images in your local Docker container repository. You can also try to run your image using the `docker run opscentric-node` command.

Because this is a NodeJS app which tries to connect to a Database the container will output an error and exit. This is ok and expected as there is no database for the container to connect to yet.

You are now ready to move onto learning about Docker Compose so you can run your app and a database container together.

## Docker Compose

Docker Compose is a configuration format for specifying how Docker containers are run. It allows you to configure the networking, environment and connections for one or more Docker containers.

### The docker-compose.yml file

To use Docker Compose you normally create a file called docker-compose.yml in the same folder as your Dockerfile(s). This files defines which services you want to run and how they can communicate.

Our docker-compose.yml file defines 2 services, the Node app in this repo and a Postgres database. Have a look at it below with comments explaining each line:

```
version: '3'                                    # We are using the docker compose version 3 specification
services:                                       # This section defines our services
  database:                                     # The first service is our database
    image: postgres:12-alpine                   # Use the Alpine Linux container for Postgres 12
    restart: always                             # Restart this container if Postgres stops running
    ports:                                      # Open these ports
      - 5432:5432                               # 5432 is the default Postgres port
    environment:                                # Set these environemnt variables in the container
      POSTGRES_PASSWORD: 'postgres'             # Postgres will set this password for the default user when it starts
  node:                                         # Our Node application
    build: .                                    # Build the default Dockerfile in the current directory
    environment:                                # These variables are used by the app to connect to the Postgres service
      - PORT=4000                               # The port on which the application serves content
      - PGHOST=database                         # The hostname of the Postgres database container
      - PGDATABASE=postgres                     # Name of the default Postgres Database
      - PGUSER=postgres                         # The default Postgres user
      - PGPASSWORD=postgres                     # The password which we set earlier for the Postgres service
    ports:                                      # Port mappings
      - 80:4000                                 # Expose port 4000 on the container and map it to port 80 on the host machine
    links:                                      # Link these services
      - database                                # Link our database so that our app can make queries
    depends_on:                                 # Service dependencies
      - database                                # We need the database running in order to start our container
```

You'll notice that Docker Compose files use the YAML format which is hierarchical based on how many spaces are in front of a line. For nested objects you must add 2 more spaces for each sub-object.

Lower level items under a main concept such as `ports:` or `environment:`can have more than one item defined and get a `-` in front of each line.

### Docker Compose Concepts

Docker Compose files can be broken down into concepts based on what you are trying to accomplish. We'll cover the ones we use in this repo tutorial below.

#### The `services:` Directive

This is the top level directive under which we name and define our services. Services can be named whatever you like but it is advisable to name them something logical based on their purpose for easy reference later.

#### The `image:` Directive

This tells Docker which image to use for a given service. This can be an image in your local image repository or on the Docker Hub. See `build:` below for an alternative to the `image:` directive.

#### The `build:` Directive

Instead of an `image:` you can define a Dockerfile from which Docker Compose should build an image for use. If you specify a period instead of a filename Docker will build the Dockerfile in the current directory.

#### The `restart:` Directive

By default a service will not restart if it exits intentionally or due to an error. Set this to `always` if you want to ensure that a container restarts everytime it stops.

#### The `ports:` Directive

This directive tell Docker which ports to explose on a container and how to map them to ports on the host machine. This is how you can define access to your containers from a local browser for example.

#### The `environment:` Directive

Environment variables set here are pushed ot the container when it starts. This is the preferred way to configure a container. Many common containers such as Postgres are setup to use specific environment variables on start to configure the service.

#### The `links:` Directive

`links:` tells Docker which of our service should be able to ocmmunicate with each other. You can specify services here based on their name such as `- database` in our example file.

#### The `depends_on:` Directive

Similar to `links:` except instead of creating a network link this directive tells Docker which services need to be running before this service can start. In our example we make sure the database is running before starting our app.

### Using Docker Compose

Now that you know how Docker Compose files work you are ready to try it out. Docker Compose uses command line commands simimlar to Docker except instead of `docker` you will use `docker-compose`.

The main way you will do this is with the `up` and `down` commands. Docker Compose has other comands to perform subsets of the `up` and `down` workflows and other tasks but today we will focus on these 2.

### Docker Compose Commands

#### The `up` Command