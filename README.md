# Parallelizing Node.js operations with child process

Example of [how to Migrate 1M items from MongoDB to Postgres in just a few minutes](https://youtu.be/EnK8-x8L9TY) using Node.js child process

**First leave your star in the repo 🌟**
![Aumentando em 999x a velocidade de processamento de dados com Node](https://github.com/ErickWendel/parallelizing-nodejs-ops/assets/8060102/6974de93-7848-477a-9198-9d99dedc18f3)


## Running

You'll need to install Docker and Docker compose to be able to spin up the DBs instances, after that run:
- docker-compose up -d
- npm ci
- npm run seed
- npm start

## Errors?

In case you got an error of too many processes open, try decreasing the const [CLUSTER_SIZE](https://github.com/ErickWendel/parallelizing-nodejs-ops/blob/main/src/index.js#L8C1-L8C24) variable
