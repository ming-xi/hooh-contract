//! This contract implements simple counter backed by storage on blockchain.
//!
//! The contract provides methods to [increment] / [decrement] counter and
//! [get it's current value][get_num] or [reset].
//!
//! [increment]: struct.Counter.html#method.increment
//! [decrement]: struct.Counter.html#method.decrement
//! [get_num]: struct.Counter.html#method.get_num
//! [reset]: struct.Counter.html#method.reset

use std::collections::HashMap;

use near_sdk::{AccountId, near_bindgen};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::LookupMap;

use crate::token::Account;

mod token;

// near_sdk::setup_alloc!();

// add the following attributes to prepare your code for serialization and invocation on the blockchain
// More built-in Rust attributes here: https://doc.rust-lang.org/reference/attributes.html#built-in-attributes-index
#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize)]
pub struct Hooh {
    // See more data types at https://doc.rust-lang.org/book/ch03-02-data-types.html
    accounts: LookupMap<AccountId, Account>,
    account_amount: u32,
}

impl Default for Hooh {
    fn default() -> Self {
        Self {
            account_amount: 0,
            accounts: LookupMap::new(b"acc".to_vec()),
        }
    }
}

#[near_bindgen]
impl Hooh {
    pub fn show_stats(&self) -> u32 {
        self.account_amount
    }

    pub fn show_account(&self, account_id: AccountId) -> Option<Account> {
        self.accounts.get(&account_id)
    }
    pub fn show_accounts(&self, account_ids: Vec<AccountId>) -> Vec<Account> {
        let mut result = vec![];
        for account_id in &account_ids {
            if let Some(account) = self.accounts.get(&account_id) {
                result.push(account);
            }
        }
        result
    }

    pub fn add_account(&mut self, account_id: AccountId) -> Account {
        match self.accounts.get(&account_id) {
            None => {
                let account = Account::new(account_id.clone());
                self.accounts.insert(&account_id, &account);
                self.account_amount += 1;
                account
            }
            Some(a) => {
                a
            }
        }
    }

    pub fn update_accounts_balance(&mut self, records: HashMap<AccountId, u128>) -> u128 {
        let mut count = 0;
        for (key, value) in &records {
            if let Some(mut account) = self.get_account(&key) {
                account.balances = vec![value.clone()];
                self.accounts.insert(&account.account_id, &account);
                count = count + 1;
            }
        }
        count
    }
    fn get_account(&self, account_id: &AccountId) -> Option<Account> {
        self.accounts.get(account_id)
    }
}

/*
 * the rest of this file sets up unit tests
 * to run these, the command will be:
 * cargo test --package rust-counter-tutorial -- --nocapture
 * Note: 'rust-counter-tutorial' comes from cargo.toml's 'name' key
 */

// use the attribute below for unit tests
#[cfg(not(target_arch = "wasm32"))]
#[cfg(test)]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    use super::*;

    // Allows for modifying the environment of the mocked blockchain
    fn get_context(predecessor_account_id: AccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    #[test]
    fn update_account() {
        println!("::update_account");
        let mut context = get_context(accounts(1));
        // Initialize the mocked blockchain
        testing_env!(context.build());

        // Set the testing environment for the subsequent calls
        testing_env!(context
            .predecessor_account_id(accounts(1))
            .build());

        let mut contract = Hooh::default();
        contract.add_account(accounts(1));
        println!("account_id={}", accounts(1));
        let account = contract.get_account(&accounts(1));
        println!("account={:?}", account);
        assert!(account.is_some());
        let account = account.unwrap();
        println!("account.balances[0]={}", account.balances[0]);
        assert_eq!(account.balances[0], 0);
        let mut records = HashMap::new();
        records.insert(accounts(1), 100 as u128);
        contract.update_accounts_balance(records);
        let account = contract.get_account(&accounts(1));
        assert!(account.is_some());
        let account = account.unwrap();
        println!("updated_account={:?}", account);
        assert_eq!(account.balances[0], 100);
    }

    #[test]
    fn get_nonexistent_account() {
        println!("::get_nonexistent_account");
        let contract = Hooh::default();
        let account = contract.get_account(&accounts(1));
        println!("account={:?}", account);
        assert!(account.is_none());
    }
}