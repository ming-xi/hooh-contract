const mongodb = require('./db');
const aes = require('./aes');

const saveKey = async (userId, keys) => {
    const {accountId, seedPhrase, publicKey, secretKey} = keys;

    const query = {userId};
    const col = mongodb.collections.secret;
    try {
        const user = await mongodb.db.collection(col).findOne(query);
        if (!user) {
            await mongodb.db.collection(col).insertOne({
                userId,
                accountId,
                publicKey,
                seedPhrase: aes.encrypt(seedPhrase),
                secretKey: aes.encrypt(secretKey),
                created: new Date()
            });
            return true
        }
    } catch (e) {
        console.error("Failed when saving key", e);
    }
    return false
}

const loadKey = async (userId) => {
    const query = {userId};
    const col = mongodb.collections.secret;
    try {
        const user = await mongodb.db.collection(col).findOne(query);
        if (user) {
            const {secretKey, accountId} = user;
            return {
                accountId,
                secretKey: aes.decrypt(secretKey)
            }
        }
    } catch (e) {
        console.error("Failed when loading key for user %s", userId, e);
    }
    return false
}

const loadAccountId = async (userId) => {
    if (!userId) return false;

    const query = {userId};
    const col = mongodb.collections.secret;
    try {
        const user = await mongodb.db.collection(col).findOne(query);
        if (user) {
            const {accountId} = user;
            return accountId;
        }
    } catch (e) {
        console.error("Failed when loading account id for user %s", userId, e);
    }
    return false
}

module.exports = {
    loadAccountId,
    loadKey,
    saveKey
}
