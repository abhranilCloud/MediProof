#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, contract, contractimpl};

#[contract]
pub struct MockRegistryContract;

#[contractimpl]
impl MockRegistryContract {
    pub fn is_registered(_env: Env, work_id: u32) -> bool {
        work_id == 1
    }
}

fn setup_env_and_client() -> (Env, DataAccessContractClient<'static>, Address) {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(DataAccessContract, ());
    let client = DataAccessContractClient::new(&env, &contract_id);

    let registry_id = env.register(MockRegistryContract, ());
    let token = Address::generate(&env);
    
    client.init_contract(&token, &registry_id);
    
    (env, client, registry_id)
}

#[test]
fn test_create_license_and_grant_access() {
    let (env, client, _) = setup_env_and_client();

    let owner = Address::generate(&env);
    let user = Address::generate(&env);
    let terms_hash = BytesN::from_array(&env, &[1u8; 32]);

    // Create a Creative Commons license (type 0) for work_id 1
    let license_id = client.create_license(&owner, &1, &0, &terms_hash);
    assert_eq!(license_id, 1);

    // Grant access
    client.grant_access(&license_id, &owner, &user);
    assert_eq!(client.check_access(&license_id, &user), true);

    // Verify license details
    let license = client.get_license(&license_id);
    assert_eq!(license.license_type, 0);
    assert_eq!(license.owner, owner);
    assert_eq!(license.active, true);
}

#[test]
#[should_panic(expected = "Cannot license an unregistered medical record.")]
fn test_create_license_unregistered_ip() {
    let (env, client, _) = setup_env_and_client();

    let owner = Address::generate(&env);
    let terms_hash = BytesN::from_array(&env, &[1u8; 32]);

    // Attempt to license an unregistered work (work_id = 999)
    client.create_license(&owner, &999, &0, &terms_hash);
}

#[test]
fn test_revoke_access() {
    let (env, client, _) = setup_env_and_client();

    let owner = Address::generate(&env);
    let user = Address::generate(&env);
    let terms_hash = BytesN::from_array(&env, &[2u8; 32]);

    let license_id = client.create_license(&owner, &1, &2, &terms_hash);

    // Grant then revoke
    client.grant_access(&license_id, &owner, &user);
    assert_eq!(client.check_access(&license_id, &user), true);

    client.revoke_access(&license_id, &owner, &user);
    assert_eq!(client.check_access(&license_id, &user), false);
}

#[test]
fn test_file_dispute_and_vote() {
    let (env, client, _) = setup_env_and_client();

    let plaintiff = Address::generate(&env);
    let defendant = Address::generate(&env);
    let evidence = BytesN::from_array(&env, &[5u8; 32]);

    let dispute_id = client.file_dispute(&plaintiff, &defendant, &1, &evidence);
    assert_eq!(dispute_id, 1);

    // Vote in favor of the plaintiff with 3 votes
    let voter = Address::generate(&env);
    client.vote_dispute(&voter, &dispute_id, &3, &true);

    let dispute = client.get_dispute(&dispute_id);
    assert_eq!(dispute.yes_votes, 3);
    assert_eq!(dispute.no_votes, 0);
    assert_eq!(dispute.status, 0); // Still active
}

#[test]
#[should_panic(expected = "Voter has already voted on this dispute")]
fn test_double_vote_rejected() {
    let (env, client, _) = setup_env_and_client();

    let plaintiff = Address::generate(&env);
    let defendant = Address::generate(&env);
    let evidence = BytesN::from_array(&env, &[6u8; 32]);

    let dispute_id = client.file_dispute(&plaintiff, &defendant, &1, &evidence);

    let voter = Address::generate(&env);
    client.vote_dispute(&voter, &dispute_id, &2, &true);
    // Double vote should panic
    client.vote_dispute(&voter, &dispute_id, &1, &false);
}

#[test]
#[should_panic(expected = "Only the license owner can grant access")]
fn test_non_owner_cannot_grant() {
    let (env, client, _) = setup_env_and_client();

    let owner = Address::generate(&env);
    let imposter = Address::generate(&env);
    let user = Address::generate(&env);
    let terms_hash = BytesN::from_array(&env, &[7u8; 32]);

    let license_id = client.create_license(&owner, &1, &1, &terms_hash);

    // Non-owner tries to grant access — should panic
    client.grant_access(&license_id, &imposter, &user);
}

#[test]
#[should_panic(expected = "Votes must be greater than 0")]
fn test_negative_votes_rejected() {
    let (env, client, _) = setup_env_and_client();

    let plaintiff = Address::generate(&env);
    let defendant = Address::generate(&env);
    let evidence = BytesN::from_array(&env, &[8u8; 32]);

    let dispute_id = client.file_dispute(&plaintiff, &defendant, &1, &evidence);

    let voter = Address::generate(&env);
    // Negative votes should panic
    client.vote_dispute(&voter, &dispute_id, &-5, &true);
}
