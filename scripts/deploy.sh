#!/bin/bash
set -e

echo "Building contracts..."
soroban contract build

echo "Deploying Registry Contract..."
REGISTRY_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/registry_contract.wasm \
    --source admin \
    --network testnet)
echo "Registry deployed at: $REGISTRY_ID"

echo "Deploying License DAO Contract..."
DAO_ID=$(soroban contract deploy \
    --wasm target/wasm32-unknown-unknown/release/license_dao_contract.wasm \
    --source admin \
    --network testnet)
echo "License DAO deployed at: $DAO_ID"

# Save addresses to an env file
echo "VITE_REGISTRY_CONTRACT_ID=$REGISTRY_ID" > .env.local
echo "VITE_DAO_CONTRACT_ID=$DAO_ID" >> .env.local

echo "Deployment complete."
