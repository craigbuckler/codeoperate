# CodeOperate

CodeOperate, a Node.js real-time co-operative code editor. *For demonstration purposes only!*

Uses [Express.js](https://expressjs.com/) to serve pages, [ws](https://www.npmjs.com/package/ws) for Web Socket communication, [CodeMirror](https://codemirror.net/) for editing, and [MongoDB](https://www.mongodb.com/) with the [native driver](https://www.npmjs.com/package/mongodb) to store data. [Docker](https://www.docker.com/) is used to manage systems.


## Quick start

Ensure Docker is installed then clone the repository:

```sh
git clone https://github.com/craigbuckler/codeoperate.git
```

Navigate to the `codeoperate` directory and launch:

```sh
cd codeoperate
docker-compose up
```
