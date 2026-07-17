#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, BytesN, Env, IntoVal};

/// Data access agreement — defines access terms for a registered medical record.
/// Access types: 0 = OpenAccess, 1 = RestrictedResearch, 2 = Commercial, 3 = Custom
#[derive(Clone)]
#[contracttype]
pub struct DataAccessAgreement {
    pub id: u32,
    pub owner: Address,
    pub work_id: u32,
    pub license_type: u32,
    pub terms_hash: BytesN<32>,
    pub active: bool,
}

/// A clinical evidence dispute — resolved by quadratic voting.
/// Status: 0 = Active, 1 = Upheld (plaintiff wins), 2 = Dismissed (defendant wins)
#[derive(Clone)]
#[contracttype]
pub struct EvidenceDispute {
    pub id: u32,
    pub plaintiff: Address,
    pub defendant: Address,
    pub work_id: u32,
    pub evidence_hash: BytesN<32>,
    pub yes_votes: i128,
    pub no_votes: i128,
    pub status: u32,
    pub end_time: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct LicenseTemplate {
    pub id: u32,
    pub owner: Address,
    pub work_id: u32,
    pub license_type: u32,
    pub terms_hash: BytesN<32>,
    pub active: bool,
}

#[derive(Clone)]
#[contracttype]
pub struct Dispute {
    pub id: u32,
    pub plaintiff: Address,
    pub defendant: Address,
    pub work_id: u32,
    pub evidence_hash: BytesN<32>,
    pub yes_votes: i128,
    pub no_votes: i128,
    pub status: u32, // 0 = Active, 1 = Upheld, 2 = Dismissed
    pub end_time: u64,
}

/// Storage keys for the License and DAO contract.
#[contracttype]
pub enum DataKey {
    // Data access agreements
    LicenseCount,
    License(u32),
    AccessKey(u32, Address), // (agreement_id, user) -> bool
    RegistryAddress,         // -> Address
    // Evidence dispute DAO
    Token,
    DisputeCount,
    Dispute(u32),
    DisputeVoted(u32, Address), // (dispute_id, voter) -> bool
}

#[contract]
pub struct DataAccessContract;

#[contractimpl]
impl DataAccessContract {
    /* ─── Data Access Agreements ─── */

    /// Initialize the contract with a governance token for quadratic voting and a registry for cross-contract calls.
    pub fn init_contract(env: Env, token: Address, registry: Address) {
        if env.storage().instance().has(&DataKey::Token) {
            panic!("Contract already initialized");
        }
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::RegistryAddress, &registry);
        env.storage().instance().set(&DataKey::DisputeCount, &0u32);
    }

    /// Create a new data access agreement for a medical record.
    pub fn create_license(
        env: Env,
        owner: Address,
        work_id: u32,
        license_type: u32,
        terms_hash: BytesN<32>,
    ) -> u32 {
        owner.require_auth();

        // 1. Cross-Contract Call: Verify the IP exists in the registry
        let registry_addr: Address = env.storage().instance().get(&DataKey::RegistryAddress).expect("Registry not configured");
        use soroban_sdk::vec;
        let is_registered: bool = env.invoke_contract(
            &registry_addr,
            &soroban_sdk::Symbol::new(&env, "is_registered"),
            vec![&env, work_id.into_val(&env)]
        );

        if !is_registered {
            panic!("Cannot license an unregistered medical record.");
        }

        if license_type > 3 {
            panic!("Invalid license type. Use 0=CC, 1=MIT, 2=Proprietary, 3=Custom");
        }

        let mut count: u32 = env.storage().instance().get(&DataKey::LicenseCount).unwrap_or(0);
        count += 1;

        let license = LicenseTemplate {
            id: count,
            owner,
            work_id,
            license_type,
            terms_hash,
            active: true,
        };

        env.storage().persistent().set(&DataKey::License(count), &license);
        env.storage().instance().set(&DataKey::LicenseCount, &count);

        env.events().publish(
            (symbol_short!("license"), count),
            symbol_short!("created"),
        );

        count
    }

    /// Grant access to a user under a specific license.
    pub fn grant_access(env: Env, license_id: u32, owner: Address, grantee: Address) {
        owner.require_auth();

        let license: LicenseTemplate = env
            .storage()
            .persistent()
            .get(&DataKey::License(license_id))
            .expect("License not found");

        if license.owner != owner {
            panic!("Only the license owner can grant access");
        }

        env.storage().persistent().set(&DataKey::AccessKey(license_id, grantee.clone()), &true);

        env.events().publish(
            (symbol_short!("access"), license_id),
            (symbol_short!("granted"), grantee),
        );
    }

    /// Revoke a user's access under a specific license.
    pub fn revoke_access(env: Env, license_id: u32, owner: Address, grantee: Address) {
        owner.require_auth();

        let license: LicenseTemplate = env
            .storage()
            .persistent()
            .get(&DataKey::License(license_id))
            .expect("License not found");

        if license.owner != owner {
            panic!("Only the license owner can revoke access");
        }

        env.storage().persistent().remove(&DataKey::AccessKey(license_id, grantee.clone()));

        env.events().publish(
            (symbol_short!("access"), license_id),
            (symbol_short!("revoked"), grantee),
        );
    }

    /// Check if a user has access under a specific license.
    pub fn check_access(env: Env, license_id: u32, user: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::AccessKey(license_id, user))
            .unwrap_or(false)
    }

    /// Get license details by ID.
    pub fn get_license(env: Env, id: u32) -> LicenseTemplate {
        env.storage()
            .persistent()
            .get(&DataKey::License(id))
            .expect("License not found")
    }

    /* ─── Dispute DAO ─── */

    /// File a new plagiarism dispute.
    pub fn file_dispute(
        env: Env,
        plaintiff: Address,
        defendant: Address,
        work_id: u32,
        evidence_hash: BytesN<32>,
    ) -> u32 {
        plaintiff.require_auth();

        let mut count: u32 = env.storage().instance().get(&DataKey::DisputeCount).unwrap_or(0);
        count += 1;

        let dispute = Dispute {
            id: count,
            plaintiff: plaintiff.clone(),
            defendant,
            work_id,
            evidence_hash,
            yes_votes: 0,
            no_votes: 0,
            status: 0, // Active
            end_time: env.ledger().timestamp() + 300, // 5-minute voting period for testnet demo
        };

        env.storage().persistent().set(&DataKey::Dispute(count), &dispute);
        env.storage().instance().set(&DataKey::DisputeCount, &count);

        env.events().publish(
            (symbol_short!("dispute"), count),
            (symbol_short!("filed"), plaintiff),
        );

        count
    }

    /// Cast a quadratic vote on a dispute.
    /// Cost = votes² tokens, transferred to the contract.
    pub fn vote_dispute(env: Env, voter: Address, dispute_id: u32, votes: i128, support_plaintiff: bool) {
        voter.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .expect("Dispute not found");

        if dispute.status != 0 {
            panic!("Dispute is not active");
        }

        if env.ledger().timestamp() >= dispute.end_time {
            panic!("Voting period has ended");
        }

        // Check double voting
        let voted_key = DataKey::DisputeVoted(dispute_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("Voter has already voted on this dispute");
        }

        if votes <= 0 {
            panic!("Votes must be greater than 0");
        }

        // Quadratic cost
        let cost = votes.checked_mul(votes).expect("Cost overflow");

        // Transfer voting token cost (if DAO has a token)
        if env.storage().instance().has(&DataKey::Token) {
            let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&voter, &env.current_contract_address(), &cost);
        }

        if support_plaintiff {
            dispute.yes_votes += votes;
        } else {
            dispute.no_votes += votes;
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);
        env.storage().persistent().set(&voted_key, &true);

        env.events().publish(
            (symbol_short!("vote"), dispute_id),
            (voter, votes, support_plaintiff),
        );
    }

    /// Resolve a dispute after the voting period ends.
    pub fn resolve_dispute(env: Env, dispute_id: u32) {
        let mut dispute: Dispute = env
            .storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .expect("Dispute not found");

        if dispute.status != 0 {
            panic!("Dispute already resolved");
        }

        if env.ledger().timestamp() < dispute.end_time {
            panic!("Voting period is still active");
        }

        if dispute.yes_votes > dispute.no_votes {
            dispute.status = 1; // Upheld
        } else {
            dispute.status = 2; // Dismissed
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        env.events().publish(
            (symbol_short!("dispute"), dispute_id),
            dispute.status,
        );
    }

    /// Get dispute details by ID.
    pub fn get_dispute(env: Env, id: u32) -> Dispute {
        env.storage()
            .persistent()
            .get(&DataKey::Dispute(id))
            .expect("Dispute not found")
    }

    /// Get total dispute count.
    pub fn get_dispute_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::DisputeCount).unwrap_or(0)
    }
}

mod test;
