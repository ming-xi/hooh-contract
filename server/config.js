const appName = process.env.NEAR_ENV === 'mainnet'
    ? 'hooh-tech.near'
    : 'hooh-tech.testnet';
const testName = 'test1.';
// const testName = 'test2.';
const contractName = testName + 'hooh.' + appName;

module.exports = function getConfig() {
    let config = {
        networkId: 'default',
        nodeUrl: process.env.NEAR_TESTNET_NODE_URL || 'https://rpc.testnet.near.org',
        // walletUrl: 'http://localhost:1234',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        appName,
        contractName,
        contractMethods: {
            viewMethods: ['get_pixel_cost', 'get_account_balance']
        },
        userMethods: {
            changeMethods: [
                'add_account',
                'update_accounts_balance',

                'ft_transfer', 'storage_deposit'
            ],
            viewMethods: [
                'show_account',
                'show_accounts',
                'show_stats',

                'ft_balance_of', 'storage_balance_of', 'storage_balance_bounds'
            ]
        },
        ownerMethods: {
            changeMethods: [
                'send_tokens', 'reward'
            ]
        },
    };

    if (process.env.NEAR_ENV === 'mainnet') {
        config = {
            ...config,
            networkId: 'mainnet',
            nodeUrl: process.env.NEAR_MAINNET_NODE_URL || 'https://rpc.mainnet.near.org',
            walletUrl: 'https://wallet.near.org',
            helperUrl: 'https://helper.mainnet.near.org'
        };
    }

    return config;
};
