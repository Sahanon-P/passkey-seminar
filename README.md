# Passkey Hands on for seminar

This is a beginner tutorial for passkey. Your task is to implement a passkey registration and login function on client side.

## Component
**Client**
Client will perform registration request and send an information to keep in the server

**Server**
Server will initiate a challenge and verify a passkey.

## Installation Guide
I've already prepared a passkey server and database. You can choose which type of installation you like.

<details> <summary>Docker </summary>


1. create `.env` file 
2. copy environment variable from `.env.example` to `.env`
3. run `docker compose up -d`
4. make sure your container run smoothly
5. run `docker exec -it passkey-server-1 yarn prisma db push`

</details>

<details> <summary>Local</summary>

make sure you have `nestjs`
1. replace docker-compose.yml with this one
```yml
version: "3"
services:
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: passkey
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: 1234
    ports:
      - "5432:5432"
    volumes:
      - ./data:/var/lib/postgresql/data
```
2. run `docker compose up -d`
3. run `cd server`
2. run `yarn`
3. run `yarn prisma generate`
4. create `.env` file 
5. copy this to `.env`
```
DATABASE_URL="postgresql://postgres:1234@localhost:5432/passkey?schema=public"
RP_ID="localhost"
ORIGIN="http://localhost:5173"
```
6. run `yarn prisma db push`
7. run `yarn start`

</details>

## Resources
- [Specification](https://simplewebauthn.dev/docs/packages/browser)
- [Demo](https://webauthn.io/)



