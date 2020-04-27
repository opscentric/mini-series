# OpsCentric Mini Series: Docker and Containers

This lesson focuses on Docker and containerization. When you have completed this lesson you will know how to create a Docker container, run a Docker container and how to use Docker Compose to link containers together.

You can clone this repository to your computer and follow along with this lesson but you will remember more of this information if you type the Dockerfile and docker-compose.yml files out by hand. You will need Docker and Docker Compose installed on your machine. If you have not yet done so please install them now. 

Most Docker installs will come with Docker Compose built in, but if you use Linux you may need to install it separately. You can find installation instructions for various operating systems here: https://docs.docker.com/get-docker/

This tutorial should work with Windows, Mac and Linux.

## The Dockerfile

Docker uses Dockerfiles to define a container. The file is usually named Dockerfile (Though it does not have to be), and it contains all the information needed to build a container.

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

Each line of the Dockerfile contains a directive that tells Docker to do something during the build process. We'll go through each of these directives below to give you a comprehensive understanding of Docker basics.

### Dockerfile Directives

#### The `FROM` Directive

Most Dockerfiles start with a source container which is a prebuilt container stored on the Docker hub repository or on another repository somewhere else. In order to tell Docker which container you want to start with, you can use the `FROM` directive.

In our case we are creating a NodeJS container and we want the version which is built on a lightweight linux operating system called Alpine. So we specify `FROM node:14-alpine`. Note that the number 14 specifies the NodeJS version and could be used by itself to get the default node container with a different operating system.

In general when referring to Docker containers use the `name:version` convention. If you do not specify a version Docker will pull the latest container in the repository. Refer back to the Dockerfile above for examples as we go through the directives.

#### The `RUN` Directive

The `RUN` directive in a Dockerfile tells Docker to run a command when building the container. In the case of our Dockfile we use `RUN mkdir /opscentric` to create a folder in the container, in which we will place our application files.

The `RUN` directive can be used to execute any command which is available on the container operating systems command line. In our case that's Alpine Linux which has a limited subset of normal Linux utilities but `mkdir` is still present.

#### The `ADD` Directive

The `ADD` directive in a Dockerfile tells Docker to add files to the container. In our case we use `ADD . /opscentric`. This places the files in our repository or current directory into the container. The `.` is important as it specifies the local directory in which the Dockerfile resides.

You'll notice we also have a `.dockerignore` file in the repository which contains the following lines: 

```
.git
node_modules
docker-compose.yml
README.md
```

The `.dockerignore` file is a special file which tells Docker to ignore specific files and folders when building a container. It's useful when we have extra files that we don't need for our application to run.

#### The `WORKDIR` Directive

The `WORKDIR` directive tells Docker to run subsequent commands in the specified directory. In our case that's `/opscentric`. It's a simple but useful directive especially for more complex containers which contain several folders.

#### The `EXPOSE` Directive

The `EXPOSE` directive tells Docker to open one or more ports in the container. In our case we just want to open port `4000` because that's the port that our Node app will use.

You can specify more than one port after the `EXPOSE` directive by putting a space between each one (i.e `EXPOSE 8080 4000 5000`).

#### The `CMD` Directive

The `CMD` directive tells Docker how to start the container. It takes a list of commands as arguments.

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

To use Docker Compose you normally create a file called docker-compose.yml in the same folder as your Dockerfile(s). This file defines which services you want to run and how they can communicate.

Our docker-compose.yml file in this example defines 2 services, the Node app in this repo and a Postgres database. Have a look at it below with comments explaining each line:

```
version: '3'                        # Use the docker compose version 3 specification.
services:                           # Define our services.
  database:                         # Define our database service.
    image: postgres:12-alpine       # Use the Alpine Linux container for Postgres 12.
    restart: always                 # Restart this container if Postgres stops running.
    ports:                          # Open the ports needed by Postgres.
      - 5432:5432                   # 5432 is the default Postgres port.
    environment:                    # Set these environemnt variables in the container.
      POSTGRES_PASSWORD: 'postgres' # Postgres will set this password for the default user on start.
  node:                             # Define our Node app.
    build: .                        # Build the default Dockerfile in the current directory.
    environment:                    # Define variables used by the app.
      - PORT=4000                   # The port on which the application serves content.
      - PGHOST=database             # The hostname of the Postgres database container.
      - PGDATABASE=postgres         # Name of the default Postgres Database.
      - PGUSER=postgres             # The default Postgres user.
      - PGPASSWORD=postgres         # The password which we set earlier for Postgres.
    ports:                          # Open the ports needed by the app.
      - 80:4000                     # Expose port 4000 on the container and map it to port 80 locally.
    links:                          # Link our services.
      - database                    # Link our database so that our app can make queries.
    depends_on:                     # Define dependencies.
      - database                    # We need the database running before our app.
```

You'll notice that Docker Compose files use the YAML format which is hierarchical based on how many spaces are in front of a line. For nested objects you must add 2 more spaces for each sub-object.

Lower level items under a main concept such as `ports:` or `environment:`can have more than one item defined and get a `-` in front of each line.

### Docker Compose Concepts

Docker Compose files can be broken down into concepts based on what you are trying to accomplish. We'll cover the ones we use in this repo below.

#### The `services:` Directive

This is the top level directive under which we name and define our services. Services can be named whatever you like but it is advisable to name them something logical based on their purpose for easy reference later.

#### The `image:` Directive

This tells Docker which image to use for a given service. This can be an image in your local image repository or on the Docker Hub. See `build:` below for an alternative to the `image:` directive.

#### The `build:` Directive

Instead of an `image:` you can define a Dockerfile from which Docker Compose should build and run an image. If you specify a period `.` instead of a filename Docker will build the Dockerfile in the current directory.

#### The `restart:` Directive

By default a service will not restart if it exits intentionally or due to an error. Set this to `always` if you want to ensure that a container restarts everytime it stops.

#### The `ports:` Directive

This directive tells Docker which ports to explose on a container and how to map them to ports on the host machine. This is how you can define access to your containers from a local browser for example.

#### The `environment:` Directive

Environment variables set here are set in the container when it starts. This is the most common way to configure a containerized application. Many common containers such as Postgres are setup to use specific environment variables on start to configure the service.

#### The `links:` Directive

`links:` tells Docker which of our services should be able to communicate with each other. You can specify services here based on their name such as `- database` in our example file.

#### The `depends_on:` Directive

Similar to `links:` except instead of creating a network link this directive tells Docker which services need to be running before this service can start. In our example we make sure the database is running before starting our Node app.

### Docker Compose Commands

Now that you know how Docker Compose files work you are ready to try it out. Docker Compose uses command line commands similar to Docker. The top level command is `docker-compose`.

The most common `docker-compose` commands are `up` and `down`. Docker Compose has other commands to perform subsets of the `up` and `down` workflows as well as other tasks but today we will focus on these 2.

#### The `up` Command

To run your Docker Compose setup you can use `docker-compose up`. This will build and start your containers, create any networks or links defined and instantiate volumes. If your Dockerfile has changed since the last build and you wish to rebuild it add the `--build` flag to the end of the command (i.e. `docker-compose up --build`).

#### The `down` Command

When you are done with your Docker Compose setup and want to turn it off use the `docker-compose down` command. This will stop your containers, unmount volumes and terminate any networks created by the `up` command.

### Using Docker Compose

Let's go ahead and try it now. Make sure you have navigated to the directory which contains the Dockerfile, docker-compose.yml and Node app files on your command line and type `docker-compose up`. 

You will see some logs in your terminal as the Database container is started and then the Node app container will start. Don't worry if you see some warning messages, they are expected during the Node container build.

If all goes well you will see the current time output to the console and then a message saying `Server running on 4000`.

Once you see this message you can navigate to `localhost` in your browser and you should see the current time output to the page. This time is being queried from the database and means your Docker Compose setup is up and running!

Congratulations you have successfully created a Docker container, run it with Docker Compose and linked it to a database. You can now run `docker-compose down` in your terminal to stop the database and Node app. Alternatively you can type CTRL + C to stop the Docker Compose process.