# [API] GoFinances
[![AppVeyor](https://img.shields.io/appveyor/build/diegovictor/gofinances-api?logo=appveyor&style=flat-square)](https://ci.appveyor.com/project/DiegoVictor/gofinances-api)
[![postgres](https://img.shields.io/badge/postgres-8.11.0-326690?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![typescript](https://img.shields.io/badge/typescript-5.1.3-3178c6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![eslint](https://img.shields.io/badge/eslint-8.43.0-4b32c3?style=flat-square&logo=eslint)](https://eslint.org/)
[![airbnb-style](https://flat.badgen.net/badge/style-guide/airbnb/ff5a5f?icon=airbnb)](https://github.com/airbnb/javascript)
[![jest](https://img.shields.io/badge/jest-29.5.6-brightgreen?style=flat-square&logo=jest)](https://jestjs.io/)
[![coverage](https://img.shields.io/codecov/c/gh/DiegoVictor/gofinances-api?logo=codecov&style=flat-square)](https://codecov.io/gh/DiegoVictor/gofinances-api)
[![MIT License](https://img.shields.io/badge/license-MIT-green?style=flat-square)](https://raw.githubusercontent.com/DiegoVictor/gofinances-api/main/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)<br>
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?uri=https%3A%2F%2Fraw.githubusercontent.com%2FDiegoVictor%2Fgofinances-api%2Fmain%2FInsomnia_2024-11-27.json&label=GoFinances)

Responsible for provide data to the [`web`](https://github.com/DiegoVictor/gofinances-web) front-end. Allow users to register income and outcome transactions.

## Table of Contents
* [Installing](#installing)
  * [Configuring](#configuring)
    * [.env](#env)
    * [Postgres](#postgres)
      * [Migrations](#migrations)
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
The application use just one database: [Postgres](https://www.postgresql.org/).  For the fastest setup is recommended to use [docker-compose](https://docs.docker.com/compose/), you just need to up all services:
```
$ docker-compose up -d
```

### .env
In this file you may configure your Postgres database connection, the environment, app's port and a url to documentation (this will be returned with error responses, see [error section](#error-handling)). Rename the `.env.example` in the root directory to `.env` then just update with your settings.

|key|description|default
|---|---|---
|APP_PORT|Port number where the app will run.|`3333`
|NODE_ENV|App environment. The typeORM's database choice rely on this key value, so if the environment is `test` the database used will be `tests` otherwise the `POSTGRES_DATABASE` will set the database name.|`development`
|POSTGRES_HOST|Postgres host.|`pg`
|POSTGRES_PORT|Postgres port.|`5432`
|POSTGRES_USER|Postgres user.| `postgres`
|POSTGRES_PASSWORD|Postgres password.| -
|POSTGRES_DATABASE|Application's database name.| gofinances
|DOCS_URL|An url to docs where users can find more information about the app's internal code errors.|`https://github.com/DiegoVictor/gofinances-api#errors-reference`

### Postgres
Responsible to store all application data. If for any reason you would like to create a Postgres container instead of use `docker-compose`, you can do it by running the following command:
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
  "message": "Transaction not found",
  "code": 144,
  "docs": "https://github.com/DiegoVictor/gofinances-api#errors-reference"
}
```
> As you can see a url to error docs are returned too. To configure this url update the `DOCS_URL` key from `.env` file.
> In the next sub section ([Errors Reference](#errors-reference)) you can see the errors `code` description.

### Errors Reference
|code|message|description
|---|---|---
|140|Missing file|Was not provided a file to import transactions.
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
