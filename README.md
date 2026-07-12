# Stellar Frontend Challenge - Level 1 (White Belt) 🥋

This repository contains my submission for **Level 1 - White Belt** of the Stellar Frontend Challenge.

## Project Description

**Stellar Pay** is a Simple Payment dApp built on the Stellar Testnet. It fulfills all the core requirements for the White Belt challenge by allowing users to connect their Freighter wallet, view their testnet XLM balance, and send payments instantly to any valid Stellar address.

### Features
- **Wallet Setup**: Integrates the Freighter browser extension natively.
- **Wallet Connection**: Seamlessly connect and disconnect your wallet.
- **Balance Handling**: Fetches and dynamically displays the connected wallet's native XLM balance.
- **Transaction Flow**: Easily send testnet XLM with clear visual feedback, including success states and transaction hashes linked to stellar.expert.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- [Freighter Wallet Extension](https://www.freighter.app/)

### Running Locally

1. **Clone the repository**
   ```bash
   git clone https://github.com/abhranilCloud/mediproof.git
   cd mediproof
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to interact with the dApp!

## Requirements Checklist

- [x] Set up Freighter wallet on Testnet
- [x] Connect/Disconnect functionality
- [x] Fetch and display XLM balance
- [x] Send XLM transaction on Testnet
- [x] Show success feedback and transaction hash

## Technologies Used
- React 18 + Vite
- TailwindCSS
- `@stellar/stellar-sdk`
- `@creit.tech/stellar-wallets-kit`
