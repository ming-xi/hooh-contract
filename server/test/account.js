const assert = require('assert');
const axios = require('axios');

const client = axios.create({
    baseURL: 'http://localhost:3100'
});

describe('account operations', () => {
    before(() => {
        // if (!process.env.DAPP_KEY || !process.env.DAPP_SECRET) {
        //   console.log("Please set environment variables DAPP_KEY and DAPP_SECRET before run test")
        // }
    })

    it('should successfully create an account', (done) => {
        client.post("/create-account", {
            'userId': 'tester'
        }).then(res => {
            assert.strictEqual(res.data.success, true);
            done();
        }).catch(err => {
            assert.strictEqual(err.data.error, "Account already created");
            done();
        })
    });

});
