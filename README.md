## Description

TES

## Project setup

1. Install dependencies

```bash
$ pnpm install
```

2. Create `.env` file with `.env.example` contents

3. Setup containers ([make sure you have Docker installed](https://www.docker.com/))

```bash
$ docker compose
```

4. Setup pgAdmin for local development

- Open your browser and go to: `http://localhost:$PGADMIN_PORT`
- Log in using:
  - Email: `$PGADMIN_EMAIL`
  - Password: `$PGADMIN_PASSWORD`
- Go to "Servers" → "Create" → "Server"
- General Tab: Set any name
- Connection Tab:
  - Host: `postgres`
  - Port: `$POSTGRES_PORT`
  - Username: `$POSTGRES_USER`
  - Password: `$POSTGRES_PASSWORD`
- Save

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```
