#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, String};

/// A single registered medical record — stores the registrant, document hash,
/// title, record type (e.g. "Lab Report", "MRI Scan"), and ledger timestamp.
#[derive(Clone)]
#[contracttype]
pub struct MedRecord {
    pub id: u32,
    pub creator: Address,
    pub file_hash: BytesN<32>,
    pub title: String,
    pub description: String, // record_type field (e.g. "Lab Report")
    pub timestamp: u64,
}

/// Storage keys for the MediProof registry contract.
#[contracttype]
pub enum DataKey {
    Admin,
    RegistryCount,
    Record(u32),
    HashExists(BytesN<32>),
}

#[contract]
pub struct MedRecordContract;

#[contractimpl]
impl MedRecordContract {
    /// One-time initialization — sets the admin address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RegistryCount, &0u32);
    }

    /// Register a new medical record.
    /// The registrant hashes a document locally (SHA-256) and submits the 32-byte hash.
    /// Returns the on-chain registration ID.
    pub fn register(
        env: Env,
        creator: Address,
        file_hash: BytesN<32>,
        title: String,
        description: String, // record_type
    ) -> u32 {
        creator.require_auth();

        // Prevent duplicate registration of the same document hash
        if env.storage().persistent().has(&DataKey::HashExists(file_hash.clone())) {
            panic!("This document hash has already been registered in MediProof");
        }

        let mut count: u32 = env.storage().instance().get(&DataKey::RegistryCount).unwrap_or(0);
        count += 1;

        let record = MedRecord {
            id: count,
            creator: creator.clone(),
            file_hash: file_hash.clone(),
            title,
            description,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Record(count), &record);
        env.storage().persistent().set(&DataKey::HashExists(file_hash.clone()), &count);
        env.storage().instance().set(&DataKey::RegistryCount, &count);

        env.events().publish(
            (symbol_short!("register"), count),
            (creator, file_hash),
        );

        count
    }

    /// Verify if a document hash exists in the MediProof registry.
    /// Returns the MedRecord if found.
    pub fn verify(env: Env, file_hash: BytesN<32>) -> MedRecord {
        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::HashExists(file_hash))
            .expect("Document hash not found in MediProof registry");

        env.storage()
            .persistent()
            .get(&DataKey::Record(id))
            .expect("Medical record not found")
    }

    /// Get a medical record by its registration ID.
    pub fn get_record(env: Env, id: u32) -> MedRecord {
        env.storage()
            .persistent()
            .get(&DataKey::Record(id))
            .expect("Medical record not found")
    }

    /// Get the total number of registered medical records.
    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::RegistryCount).unwrap_or(0)
    }

    /// Check if a document hash is registered in MediProof.
    pub fn is_registered(env: Env, file_hash: BytesN<32>) -> bool {
        env.storage().persistent().has(&DataKey::HashExists(file_hash))
    }
}

mod test;
