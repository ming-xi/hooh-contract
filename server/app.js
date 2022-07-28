const big = require('big.js');


const express = require('express');
const cors = require('cors');
const nearAPI = require('near-api-js');
const {generateSeedPhrase, parseSeedPhrase} = require('near-seed-phrase');
const BN = require('bn.js');
const getConfig = require('./config');
const {connection} = require("./utils/near-utils");
const {Account} = require("near-api-js");
const {appAccount, contract, withNear, hasAccessKey} = require('./middleware/near');
const {appName, contractName, userMethods, ownerMethods} = getConfig();
const {
    utils: {
        PublicKey,
        format: {
            parseNearAmount
        }
    }
} = nearAPI;
const {ensureSufficientBalance, getContract, getAccount} = require('./utils/near-utils');
// const mongodb = require('./utils/db');
// const {saveKey, loadKey, loadKey2, saveKey2, loadAccountId, loadAccount} = require('./utils/keys');
// const {insertActivity} = require('./utils/activity');
const {handleError, handle_request_error, handle_server_error} = require('./utils/handler');

// mongodb.init();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(withNear());

app.get('/', (req, res) => {
    res.send('hooh blockchain server');
});

// app.post('/has-access-key', hasAccessKey, (req, res) => {
//     res.json({success: true});
// });

const INITIAL_ACCOUNT_BALANCE = '0.00182';

const create_account = async (userId) => {
    const {seedPhrase, publicKey, secretKey} = generateSeedPhrase();
    const username = userId + "." + appName;
    const result = await appAccount.createAccount(
        username, // new account name
        publicKey, // public key for new account
        parseNearAmount(INITIAL_ACCOUNT_BALANCE) // initial balance for new account in yoctoNEAR
    );
    // const success = await saveKey(userId, {
    //     accountId: username,
    //     seedPhrase,
    //     publicKey,
    //     secretKey
    // });
    console.log('\ncreated account: %s\n%s\n', username, publicKey);
    // await send_inks(username, 70, "0");
    return {username, seedPhrase, result};
}

// WARNING NO RESTRICTION ON THIS ENDPOINT

//debug
app.post('/show-stats', async (req, res) => {
    log_request(req.path, req.body);
    if (res.writable) {
        res.json({"account_amount": await get_contract_result(appAccount, res, "show_stats", null)});
    }
});
app.post('/update-accounts-balance', async (req, res) => {
    log_request(req.path, req.body);
    const records = req.body;
    if (!records) {
        return handle_request_error(res, "records is missing");
    }
    let count = await get_contract_result(appAccount, res, "update_accounts_balance", {
        "records": records
    }, true, 300);
    if (res.writable) {
        res.json({
            "changed_records_count": count
        });
    }
});
app.post('/get-account', async (req, res) => {
    log_request(req.path, req.body);
    const {account_id} = req.body;
    if (!account_id) {
        return handle_request_error(res, "account_id is missing");
    }
    if (res.writable) {
        res.json(await get_contract_result(appAccount, res, "show_account", {account_id: account_id}));
    }
});
app.post('/get-accounts', async (req, res) => {
    log_request(req.path, req.body);
    const {account_ids} = req.body;
    if (!account_ids) {
        return handle_request_error(res, "account_ids is missing");
    }
    if (res.writable) {
        res.json(await get_contract_result(appAccount, res, "show_accounts", {account_ids: account_ids}));
    }
});
// app.post('/create-account', async (req, res) => {
//     log_request(req.path, req.body);
//     const {account_id} = req.body;
//     if (!account_id) {
//         return handle_request_error(res, "account_id is missing");
//     }
//     await get_contract_result(appAccount, res, "create_account", {account_id: account_id});
// });
app.post('/create-account', async (req, res) => {
    log_request(req.path, req.body);
    const {account_id} = req.body;
    if (!account_id) {
        return handle_request_error(res, "account_id is missing");
    }
    try {
        // let result = await create_account(account_id);
        // console.log(JSON.stringify(result));
        let result = await create_account(account_id);
        let contract = getContract(appAccount, userMethods);
        let account = await contract["add_account"]({
            args: {account_id: account_id}
        });
        res.json({account: account, phrase: result.seedPhrase});
    } catch (e) {
        console.log(e);
        handle_server_error(res, e.message, ERROR_GENERIC, e.message);
    }
    // await get_contract_result(appAccount, res, "create_account", {account_id: account_id});
});

const Tokens = {
    Ore: 'Ore',
};


function log_request(path, body) {
    console.log(`path=${path} body=${JSON.stringify(body)}`);
}

// const FT_TRANSFER_FEE = 0.01; // 1%
// const FT_MIN_STORAGE_COST = parseNearAmount('0.00256');
// const FT_TRANSFER_DEPOSIT = '1';
const ERROR_GENERIC = 1000;
//
// // WARNING NO RESTRICTION ON THIS ENDPOINT
// app.post('/transfer', async (req, res) => {
//     const {sender, receiver, amount, memo, feeMemo} = req.body;
//     if (!sender || !receiver || !amount) {
//         return handleError(res, "sender, receiver or amount is missing", "Invalid paramters");
//     }
//
//     const {accountId, secretKey} = await loadKey(sender);
//     if (!accountId || !secretKey) {
//         return handleError(res, `Sender account ${sender} doesn\'t exist`, "Sender account doesn't exist");
//     }
//
//     const _account = await getAccount(accountId, secretKey);
//     const _contract = getContract(_account, userMethods);
//     const pixel_cost = await getPixelCost();
//
//     // If the balance of sender is less than amount * (1 + fee%), stop here
//     const available_balance = parseInt(await _contract.ft_balance_of({
//         account_id: accountId
//     }) || 0) / pixel_cost;
//     const fee = amount * FT_TRANSFER_FEE;
//     if (amount + fee > available_balance) {
//         return handleError(res, `Sender account doesn't have enough balance`, "Sender doesn't have enough balance");
//     }
//
//     await ensureSufficientBalance(accountId); // send balance if not sufficient balance
//
//     try {
//         async function ft_transfer(receiver_id, amount, memo = "") {
//             const parsedAmount = BigInt(parseInt(amount * pixel_cost)).toString();
//             return await _contract.ft_transfer({
//                 args: {
//                     receiver_id,
//                     amount: '' + parsedAmount,
//                     memo
//                 },
//                 gas: new BN("10000000000000"),
//                 amount: FT_TRANSFER_DEPOSIT
//             });
//         }
//
//         async function storage_deposit(receiver_id) {
//             const storage_balance = await _contract.storage_balance_of({
//                 account_id: receiver_id
//             });
//             // if no storage balance, deposit some
//             if (!(storage_balance && storage_balance.total > 0)) {
//                 await _contract.storage_deposit({
//                     args: {
//                         account_id: receiver_id,
//                         registration_only: true,
//                     },
//                     gas: new BN("10000000000000"),
//                     amount: FT_MIN_STORAGE_COST
//                 });
//             }
//         }
//
//         // 1. If the receiver doesn't have a NEAR account, create one
//         let {accountId: receiver_id} = await loadKey(receiver);
//         if (!receiver_id) {
//             const data = await create_account(receiver);
//             receiver_id = data.username;
//         }
//
//         // 2. If the receiver doesn't have FT storage, call `storage_deposit`
//         await storage_deposit(receiver_id);
//         // 3. call `ft_transfer` to transfer the token to receiver
//         const result = await ft_transfer(receiver_id, amount, memo);
//         // 4. pay the fees to the app account
//         await ft_transfer(appName, fee, feeMemo);
//
//         res.json({success: true, result});
//         console.log(`User ${sender} transferred ${amount} herrings to ${receiver}`);
//     } catch (e) {
//         return handleError(
//             res,
//             `Failed to transfer herring between accounts: ${e.message}`,
//             `Cannot transfer herring between accounts: ${e.message}`
//         );
//     }
// });


async function get_contract_result_with_account_id(accountId, res, contract_method_name, args, isChangeMethod) {
    let account = await loadAccount(accountId);
    // console.log(account);
    return get_contract_result(account, res, contract_method_name, args, isChangeMethod);
}

async function get_contract_result(account, res, contract_method_name, args) {
    get_contract_result(account, res, contract_method_name, args, false);
}

async function get_contract_result(account, res, contract_method_name, args, isChangeMethod, gas = 0) {
    try {
        let contract = getContract(account, userMethods);
        if (checkMethod(contract, contract_method_name)) {
            // return await contract[contract_method_name](args || {});
            let finalArgs;
            if (isChangeMethod) {
                finalArgs = {
                    args: args || {}
                };
                if (gas !== 0) {
                    finalArgs['gas'] = big.Big(gas).times(10 ** 12).toFixed();
                }
            } else {
                finalArgs = args || {};
            }
            console.log(`finalArgs=${JSON.stringify(finalArgs)}`);
            return await contract[contract_method_name](finalArgs);
        } else {
            return handle_server_error(res, `no method in contract: ${contract_method_name}`, ERROR_GENERIC, "internal error");
        }
    } catch (e) {
        return handle_server_error(res, e.message, ERROR_GENERIC, e.message);
    }
}

async function get_contract_result_with_deposit(accountId, res, contract_method_name, args, deposit) {
    let account = await loadAccount(accountId);
    try {
        let contract = getContract(account, userMethods);
        if (checkMethod(contract, contract_method_name)) {
            console.log(`prepare to call method:${contract_method_name}, args:${args}, deposit:${deposit}`);
            res.json(await contract[contract_method_name](args || {}, new BN("30000000000000"), deposit));
        } else {
            return handle_server_error(res, `no method in contract: ${contract_method_name}`, ERROR_GENERIC, "internal error");
        }
    } catch (e) {
        return handle_server_error(res, e.message, ERROR_GENERIC, e.message);
    }
}

function checkMethod(object, method_name) {
    if (typeof object[method_name] === 'function') {
        console.log(`check method ${method_name}: ok`);
        return true;
    } else if (typeof object[method_name] === 'undefined') {
        console.log(`check method ${method_name}: failed, method undefined`);
        return false;
    } else {
        console.log(`check method ${method_name}: failed, it's neither undefined nor a function. It's a ${typeof object[method_name]}`);
        return false;
    }
}

app.listen(port, () => {
    console.log(`\nContract Account ID:\n${contractName}\nListening at http://localhost:${port}`);
});

