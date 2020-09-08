# [API] GoFinances
[![Travis (.org)](https://img.shields.io/travis/DiegoVictor/gofinances-api?logo=travis&style=flat-square)](https://travis-ci.org/DiegoVictor/gofinances-api)
[![redis](https://img.shields.io/badge/redis-3.0.2-d92b21?style=flat-square&logo=redis&logoColor=white)](https://redis.io/)
[![eslint](https://img.shields.io/badge/eslint-6.8.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-25.5.4-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/gofinances-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/gofinances-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://github.com/DiegoVictor/gofinances-api/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fgofinances-api%2Fmaster%2FInsomnia_2020-09-06.json&label=GoFinances)

Responsible for provide data to the [`web`](https://github.com/DiegoVictor/gofinances-web) front-end. Allow users to register income and outcome transactions.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [Redis](#redis)
    * [Postgres](#postgres)
      * [Migrations](#migrations)
    * [.env](#env)
    * [Rate Limit (Optional)](#rate-limit-optional)
* [Usage](#usage)
  * [Error Handling](#error-handling)
    * [Errors Reference](#errors-reference)
  * [X-Total-Count](#x-total-count)
  * [Versioning](#versioning)
  * [Routes](#routes)
    * [Requests](#requests)
* [Running the tests](#running-the-tests)
  * [Coverage report](#coverage-report)

# Installing
Easy peasy lemon squeezy:
```
$ yarn
```
Or:
```
$ npm install
```
> Was installed and configured the [`eslint`](https://eslint.org/) and [`prettier`](https://prettier.io/) to keep the code clean and patterned.

## Configuring
The application use two databases: [Postgres](https://www.postgresql.org/) and [Redis](https://redis.io/). For the fastest setup is recommended to use [docker](https://www.docker.com/), see below how to setup ever database.

### Redis
Responsible to store data utilized by the rate limit middleware and brute force prevention. You can create a redis container like so:
```
$ docker run --name gofinances-redis -d -p 6379:6379 redis:alpine
```

### Postgres
Responsible to store all application data. To create a postgres container:
```
$ docker run --name gofinances-postgres -e POSTGRES_PASSWORD=docker -p 5432:5432 -d postgres
```
> Then create two databases: `gofinances` and `tests` (in case you would like to run the tests).

#### Migrations
Remember to run the database migrations:
```
$ yarn ts-node-dev ./node_modules/typeorm/cli.js migration:run
```
Or:
```
$ yarn typeorm migration:run
```
> See more information on [TypeORM Migrations](https://typeorm.io/#/migrations).


### .env
In this file you may configure your Postgres and Redis database connection, the environment, app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_PORT|Port number where the app will run.|`3333`
|NODE_ENV|App environment. The typeORM's database choice rely on this key value, so if the environment is `test` the database used will be `tests` otherwise the `POSTGRES_DATABASE` will set the database name.|`development`
|POSTGRES_HOST|Postgres host. For Windows users using Docker Toolbox maybe be necessary in your `.env` file set the host to `192.168.99.100` (docker machine IP) instead of localhost or `127.0.0.1`.|`127.0.0.1`
|POSTGRES_PORT|Postgres port.|`5432`
|POSTGRES_USER|Postgres user.| `postgres`
|POSTGRES_PASSWORD|Postgres password.| -
|POSTGRES_DATABASE|Application's database name.| gofinances
|REDIS_HOST|Redis host.|`127.0.0.1`
|REDIS_PORT|Redis port.|`6379`
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/gofinances-api#errors-reference`
> For Windows users using Docker Toolbox maybe be necessary in your `.env` file set the host of the Postgres and Redis to `192.168.99.100` (docker machine IP) instead of `localhost` or `127.0.0.1`.

### Rate Limit (Optional)
The project comes pre-configured, but you can adjust it as your needs.

* `src/config/rate_limit.js`

|key|description|default
|---|---|---
|duration|Number of seconds before consumed points are reset.|`300`
|points|Maximum number of points can be consumed over duration.|`10`

> The lib [`rate-limiter-flexible`](https://github.com/animir/node-rate-limiter-flexible) was used to rate the api's limits, for more configuration information go to [Options](https://github.com/animir/node-rate-limiter-flexible/wiki/Options#options) page.

# Usage
To start up the app run:
```
$ yarn dev:server
```
Or:
```
npm run dev:server
```

## Error Handling
Instead of only throw a simple message and HTTP Status Code this API return friendly errors:
```json
{
  "status": "error",
  "message": "Too Many Requests",
  "code": 229,
  "docs": "https://github.com/DiegoVictor/bethehero-api#errors-reference"
}
```
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|229|Too Many Requests|You reached at the requests limit.
|141|You don't have enough money to this transaction!|The said amount is greater than the available.
|144|Transaction not found|The `id` sent not references an existing transaction in the database.

## X-Total-Count
Another header returned in routes with pagination, this bring the total records amount.

## Versioning
A simple versioning was made. Just remember to set after the `host` the `/v1/` string to your requests.
```
GET http://localhost:3333/v1/transactions
```

## Routes
|route|HTTP Method|params|description
|:---|:---:|:---:|:---:
|`/transactions`|GET| - |Return transactions and balance.
|`/transactions`|POST|Body with transaction `title`, `value`, `type` and `category`.|Create a new transaction.
|`/transactions/:id`|DELETE|`:id` of the transaction.|Remove a transaction.
|`/transactions/import`|POST|Multipart payload with a `file` field with a `csv` file.|Import transactions from file.

### Requests
* `POST /transactions`

Request body:
```json
{
  "title": "Internet",
  "value": 120,
  "type": "outcome",
  "category": "Others"
}
```

* `POST /transactions/import`

CSV file, example:
```
title, type, value, category
Loan, income, 1500, Others
Website Hosting, outcome, 50, Others
Ice cream, outcome, 3, Food
```

# Running the tests
[Jest](https://jestjs.io/) was the choice to test the app, to run:
```
$ yarn test
```
Or:
```
$ npm run test
```
> For tests run create a database called `tests`.

## Coverage report
You can see the coverage report inside `tests/coverage`. They are automatically created after the tests run.
