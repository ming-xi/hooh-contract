use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{AccountId, Balance, env};

#[derive(BorshDeserialize, BorshSerialize, Clone, Copy, PartialEq, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub enum Tokens {
    Ore,
}

#[derive(BorshSerialize, BorshDeserialize, Debug, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Account {
    pub account_id: AccountId,
    pub balances: Vec<Balance>,
    pub claim_timestamp: u64,
}

impl Account {
    pub fn new(account_id: AccountId) -> Self {
        Self {
            account_id,
            balances: vec![0],
            claim_timestamp: env::block_timestamp(),
        }
    }
}