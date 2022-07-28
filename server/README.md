# feiyu-canvas-war-connector

Connector for Feiyu Canvas War

## Install

### Set Up Environment

1. Install `nvm`: follow the instruction [here](https://github.com/nvm-sh/nvm#install--update-script)
2. Install `node`: run the command `nvm install --lts`
3. Install `yarn` and `pm2`: `npm install -g yarn pm2`

### Set Up Project

Download repository, and install dependencies

```bash
git clone https://github.com/near-x/feiyu-canvas-war-connector
cd feiyu-canvas-war-connector/server
yarn
```

## Configure and Launch

1. Configure environment variables

Add the environment variables in `.env` (look at `.env.example` as an example)

```env
MONGODB_URI=mongodb://localhost:27017/test
AES_ENC_KEY=...
AES_IV=...
```

2. Launch the server

Run the command: `pm2 start`