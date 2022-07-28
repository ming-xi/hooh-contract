const assert = require('assert');
const axios = require('axios');

const client = axios.create({
    baseURL: 'http://localhost:3100'
});

describe('contract calls', () => {
    before(() => {

    })

    it('should send ink tokens to the account', (done) => {
        client.post("/send-inks", {
            userId: 'tester02',
            amount: 10,
            memo: "0"
        }).then(res => {
            assert.strictEqual(res.data.success, true);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

    it('should buy ink tokens for the account with feiyu tokens', (done) => {
        client.post("/buy-inks", {
            'userId': 'tester',
            'amount': 0.1
        }).then(res => {
            assert.strictEqual(res.data.success, true);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

    it('should draw two pixels on canvas', (done) => {
        client.post("/draw", {
            'userId': 'tester02',
            'pixels': [
                {
                    "x": 9,
                    "y": 7,
                    "color": 255
                },
                {
                    "x": 9,
                    "y": 8,
                    "color": 0
                }
            ]
        }).then(res => {
            console.log('res', res.data);
            assert.strictEqual(res.data.success, true);
            assert.strictEqual(res.data.result.length, 0);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

    it('should only draw one pixel on canvas', (done) => {
        client.post("/draw", {
            'userId': 'tester02',
            'pixels': [
                {
                    "x": 9,
                    "y": 7,
                    "color": 255
                },
                {
                    "x": 9,
                    "y": 9,
                    "color": 0
                }
            ]
        }).then(res => {
            console.log('res', res.data);
            assert.strictEqual(res.data.success, true);
            assert.strictEqual(res.data.result.length, 1);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

    it('should select farming preference of Feiyu token', (done) => {
        client.post("/select-farming-preference", {
            'userId': 'tester',
            'token': "Herring"
        }).then(res => {
            assert.strictEqual(res.data.success, true);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

    it('should purchae product for the user with Feiyu token', (done) => {
        client.post("/purchase", {
            'userId': 'tester02',
            'amount': 0.001,
            'productId': 'painting'
        }).then(res => {
            assert.strictEqual(res.data.success, true);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

    it('should reward the user with Feiyu token', (done) => {
        client.post("/reward", {
            'userId': 'tester02',
            'amount': 10,
            'category': 'activity'
        }).then(res => {
            assert.strictEqual(res.data.success, true);
            done();
        }).catch(err => {
            console.error("err", err);
            done();
        })
    });

});
