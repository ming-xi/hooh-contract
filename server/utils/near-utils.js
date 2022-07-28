const fs = require('fs');
const nearAPI = require('near-api-js');
const getConfig = require('../config');
const {nodeUrl, networkId, appName, contractName, contractMethods, userMethods, ownerMethods} = getConfig();
const {
    keyStores: {InMemoryKeyStore},
    Near, Account, Contract, KeyPair,
    InMemorySigner, utils
} = nearAPI;

const credentials = JSON.parse(fs.readFileSync(`${process.env.HOME}/.near-credentials/${networkId}/${appName}.json`));
const keyStore = new InMemoryKeyStore();
keyStore.setKey(networkId, appName, KeyPair.fromString(credentials.private_key));
const near = new Near({
    networkId,
    nodeUrl,
    deps: {keyStore},
});
const {connection} = near;
const appAccount = new Account(connection, appName);
const contractAccount = new Account(connection, contractName);
const contract = new Contract(contractAccount, contractName, contractMethods);

function getContract(account, methods = contractMethods) {
    return new Contract(account, contractName, {...methods});
}

const nearForAccessKey = new Near({
    networkId,
    nodeUrl,
    deps: {
        keyStore: new InMemoryKeyStore()
    },
});

const createAccessKeyAccount = (secretKey) => {
    const near = nearForAccessKey;
    const keyPair = KeyPair.fromString(secretKey);
    keyPair.toString = () => keyPair.secretKey;
    near.connection.signer.keyStore.setKey(networkId, contractName, keyPair);
    const account = new Account(near.connection, contractName);
    return account;
};

const getAccount = async (accountId, secretKey) => {
    const keyPair = KeyPair.fromString(secretKey);
    keyPair.toString = () => keyPair.secretKey;
    const signer = await InMemorySigner.fromKeyPair(networkId, accountId, keyPair);
    const near = await nearAPI.connect({
        networkId, nodeUrl, deps: {keyStore: signer.keyStore},
    });
    const account = new nearAPI.Account(near.connection, accountId);
    return account;
};

const getAvailableBalance = async (accountId) => {
    const account = await near.account(accountId);
    const balances = await account.getAccountBalance();
    return utils.format.formatNearAmount(balances.available);
}

const MINIMUM_BALANCE = 0.005;
const MINIMUM_LARGE_BALANCE = 0.01;
const INCREASED_AMOUNT = "0.02";

const ensureSufficientBalance = async (accountId, size = "M") => {
    try {
        const available = await getAvailableBalance(accountId);
        const minimumBalance = size === "L" ? MINIMUM_LARGE_BALANCE : MINIMUM_BALANCE;
        if (available != null && parseFloat(available) < minimumBalance) {
            await appAccount.sendMoney(accountId, utils.format.parseNearAmount(INCREASED_AMOUNT));
            console.log(`${accountId} has only ${available} Ⓝ. Sent ${INCREASED_AMOUNT} Ⓝ to the account.`);
        }
    } catch (e) {
        console.error(`Failed when filling balance for account ${accountId} : `, e);
    }
}

module.exports = {
    near,
    keyStore,
    connection,
    contract,
    contractName,
    appAccount,
    contractAccount,
    userMethods,
    ownerMethods,
    createAccessKeyAccount,
    getContract,
    getAccount,
    ensureSufficientBalance,
};
