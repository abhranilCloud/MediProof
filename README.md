# MediProof ⚕️

**Enterprise-Grade Decentralized Medical Records Registry on Stellar Soroban**

MediProof is a zero-knowledge clinical data infrastructure layer built on the Stellar Soroban network. It empowers healthcare institutions, researchers, and patients to anchor cryptographic proofs of electronic health records (EHR), clinical trials, and medical evidence on-chain without exposing any Protected Health Information (PHI).

![MediProof Landing](docs/assets/landing.png) <!-- Update with actual screenshot path -->

## 🌟 Key Features

* **Client-Side Document Hashing (HIPAA-Compliant)**
  Documents are hashed locally in the browser using the Web Crypto API. The raw file never leaves the client, ensuring complete privacy and regulatory compliance.
* **Immutable Provenance Registry**
  Registers the resulting SHA-256 hash on the Stellar ledger, creating an immutable, timestamped proof of existence.
* **Zero-Knowledge Clinical Audits**
  Third parties can independently re-hash a local medical file and query the registry to verify its authenticity, timestamp, and the identity of the registrar without relying on centralized databases.
* **Institutional Access Protocols**
  Configure on-chain data-sharing agreements (Open Access, Restricted Research, Commercial) and provision cryptographic access keys to verified institutions.
* **Research Grant Allocations (Treasury)**
  Manage and disburse native XLM grants to multiple Co-Principal Investigators. Transfer allocation rights securely on-chain.
* **Clinical Peer Review (DAO)**
  Flag data integrity issues, submit counter-evidence, and resolve clinical data challenges through decentralized Quadratic Voting.

## 🏗️ Architecture

- **Frontend**: React 18 + Vite, TailwindCSS (Monochrome Clinical Theme)
- **Smart Contracts**: Rust (Stellar Soroban)
- **Wallet Integration**: Freighter Wallet
- **Network**: Stellar Testnet

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Stellar Freighter Wallet Extension](https://www.freighter.app/)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhranilCloud/mediproof.git
   cd mediproof
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env.local` file in the root directory and add your contract IDs (obtained after deployment):
   ```env
   VITE_NETWORK=TESTNET
   VITE_REGISTRY_CONTRACT_ID=your_registry_contract_id
   VITE_CO_OWNERSHIP_CONTRACT_ID=your_co_ownership_contract_id
   VITE_LICENSE_DAO_CONTRACT_ID=your_license_dao_contract_id
   ```

4. **Start the Development Server**
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` in your browser.

## 🛠️ Smart Contract Deployment

If you wish to deploy your own instances of the Soroban contracts, follow the steps below.

### Prerequisites for Contracts
- Rust toolchain (`rustup target add wasm32-unknown-unknown`)
- Stellar CLI

### Build & Deploy
1. **Build Contracts**
   ```bash
   stellar contract build
   ```
2. **Deploy to Testnet**
   ```bash
   stellar contract deploy \
     --wasm target/wasm32-unknown-unknown/release/registry_contract.wasm \
     --source <YOUR_FUNDED_ACCOUNT> \
     --network testnet
   ```
   *Repeat the deployment step for the Co-Ownership and License DAO contracts, and update your `.env.local`.*

## 🔒 Security & Privacy

MediProof is designed around the principle of **Zero-Knowledge Data Anchoring**. 
- **No PHI on-chain**: Only irreversible cryptographic hashes (SHA-256) are stored on the ledger.
- **Client-Side Processing**: Files are processed in the user's browser memory and discarded immediately.
- **Access Control**: Built-in smart contract level access control ensures only authorized wallets can invoke sensitive state-changing functions.

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---
*Built for the future of decentralized healthcare data integrity.*
