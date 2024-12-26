
---

# **Aptos NFT Marketplace dApp - Fullstack** 🚀

Welcome to the **Aptos NFT Marketplace dApp**! This project enables users to mint, buy, sell, and manage NFTs on the **Aptos blockchain**. It includes several advanced features such as an auction system, offers, NFT transfers, advanced filtering, analytics, and more. 🚀

This repository showcases a **full-stack NFT marketplace** integrated with Aptos, featuring an **intuitive frontend** with **React**, **TypeScript**, **TailwindCSS**, and a secure **backend** with smart contracts on the **Aptos blockchain**.

---

## **Table of Contents** 📑

1. [Introduction](#introduction-)
2. [Features](#features-)
   - [Auction System](#-auction-system-)
   - [NFT Transfers](#-nft-transfers-)
   - [Offer System](#-offer-system-)
   - [Advanced Filtering and Sorting](#-advanced-filtering-and-sorting-)
   - [Analytics Dashboard](#-analytics-dashboard-)
   - [Minting for All Users](#-minting-for-all-users-)
3. [How to Try It Out](#how-to-try-it-out-%EF%B8%8F)
4. [Smart Contract Link](#smart-contract-link-)
5. [Test Network Setup](#test-network-setup-)
6. [Video Showcase](#video-showcase-)
7. [Contact Information](#contact-information-)


---

## **Introduction** 🔍

This project is designed to provide a **comprehensive NFT marketplace** on the **Aptos blockchain**, with advanced features like auctions, offers, and the ability to transfer NFTs between users. The dApp is built using **React**, **Typescript**, **Aptos SDK**, and **TailwindCSS** for the frontend and integrates with **Aptos smart contracts** for managing NFTs.

---

## **Features** ✨

### **Auction System** 🎯

The auction feature allows users to place bids on NFTs over a specified time period. The highest bid wins the NFT at the end of the auction, and the **smart contract** securely tracks and updates the bids.

---

### **NFT Transfers** 🔄

Users can transfer NFTs to other wallets directly through the marketplace interface, enabling gifting and trading of assets with ease.

---

### **Offer System** 💰

This system enables users to make and receive offers on NFTs, allowing sellers to accept or counter offers, offering more flexibility in asset sales.

---

### **Advanced Filtering and Sorting** 🔍

Users can filter NFTs by rarity, price range, and listing date. Advanced sorting helps find NFTs based on custom preferences.

---

### **Analytics Dashboard** 📊

The marketplace includes a dashboard for admins, providing valuable metrics such as **total sales**, **trending NFTs**, and more to better understand marketplace activity.

---

### **Minting for All Users** 🛠

Minting NFTs is available for **all users** (not just the contract owner). Admins can adjust minting fees or whitelist users for exclusive minting privileges.

---

## **How to Try It Out** ⚙️

To try out the **Aptos NFT Marketplace**, follow these steps:

### 1. **Clone the Repository** 🖥️
```bash
git clone https://github.com/Amar5623/Aptos-NFT-Marketplace-Bounty/
cd aptos-nft-marketplace
```

### 2. **Install Dependencies** 📦
```bash
cd frontend
npm install
```

### 3. **Set Up Your Wallet** 🔑
Set up a wallet (e.g., **Petra Wallet**) and connect it to the **Test Network**. Follow this guide to get started:
- [Petra Wallet Setup Guide](https://medium.com/@VibrantxFinance/vibrantx-guideline-setting-up-petra-wallet-on-aptos-73136e123164/)

### 4. **Configure the Test Network** 🌐
- Replace the marketplace address and other relevant variables in the code with your **Testnet Network** settings.
- Search for all instances of `"YOUR-MARKETPLACE-ADDRESS-HERE"` and replace them with your Petra wallet address used for the backend.

### 5. **Start the Project** 🚀
```bash
npm start
```

### 6. **Access the Marketplace** 🌍
Open the marketplace in your browser at `http://localhost:3000`.

---

## **Test Network Setup** 🔗

Before running the project, ensure your smart contract and wallet are connected to the **Aptos Test Network**.

### 1. **Connect Your Wallet** 💳
Ensure your wallet (e.g., Petra Wallet) is connected to the **Test Network**.

### 2. **Get Free **Test Network APT** 💸**
- Visit the [Aptos Testnet Faucet](https://aptos.dev/en/network/faucet) to receive free Test Network APT.

### 3. **Deploy Your Module to the Test Network** 🔥

Follow these steps to deploy your smart contract to the **Test Network**:

1. Open a terminal and navigate to the `backend` directory.
2. Install the **Aptos CLI**:
   ```bash
   curl -fsSL "https://aptos.dev/scripts/install_cli.py" | python3
   ```
3. Make sure to update all instances of `"YOUR-MARKETPLACE-ADDRESS-HERE"` with your account address.
4. Navigate to the `contracts` directory:
   ```bash
   cd contracts
   ```
5. Initialize the Aptos project:
   ```bash
   aptos init
   ```
6. Select **Testnet** as the network and enter your **Private Key**.
7. Publish the Smart Contract to the Test Network:
   ```bash
   aptos move publish
   ```

### 4. **Verify Deployment on Aptos Explorer** 🌍
- Go to [Aptos Explorer](https://explorer.aptos.dev/) and ensure the network is set to **Testnet**.
- Search for your marketplace address to locate your smart contract.

Once your address loads, navigate to the **Module** tab and click on **Run** to interact with the contract.

---

## **Smart Contract Link** 🔗

You can view and interact with the smart contract deployed on the **Test Network** using this [Smart Contract Link](https://explorer.aptoslabs.com/account/0xcef35ae742dab62a59f8d1955158d97a90e2a51b2ec229239e78d7a30a7894a4/modules/code/NFTMarketplace?network=testnet).

---

## **Video Showcase** 📺

Watch the video demonstration of the new features implemented in the **Aptos NFT Marketplace** dApp below:

[**Watch the Demo on YouTube**](https://youtu.be/xl4GUtSW7W4)

---

## Features Implementation Summary ⚙️

### 🏆 Auction System 🎯

The auction system allows users to place bids on NFTs, with a set duration for each auction. The highest bidder at the end of the auction wins the NFT. This is supported by the `NFTMarketplace.move` smart contract, which securely tracks bids, auction duration, and updates the auction state.

#### Smart Contract Code (Move):
```move
public entry fun start_auction(
  nft_id: address,
  starting_price: u64,
  auction_duration: u64
) {
  let auction = Auction {
    nft_id,
    current_bid: 0,
    current_bidder: 0x0,
    end_time: timestamp() + auction_duration,
  };
  // Store auction in the contract state
  move_to_sender<Auction>(auction);
}

public entry fun place_bid(nft_id: address, bid_amount: u64) {
  let auction = borrow_global_mut<Auction>(nft_id);
  assert!(bid_amount > auction.current_bid, 1001, "Bid must be higher than the current bid.");
  auction.current_bid = bid_amount;
  auction.current_bidder = sender();
}
```

#### Frontend Code (React - TypeScript):
```typescript
const startAuction = async (nftId: string, startingPrice: number, duration: number) => {
  const payload = {
    function: `${marketplaceAddr}::NFTMarketplace::start_auction`,
    arguments: [nftId, startingPrice, duration],
  };
  await sendTransaction(payload);
};

const placeBid = async (nftId: string, bidAmount: number) => {
  const payload = {
    function: `${marketplaceAddr}::NFTMarketplace::place_bid`,
    arguments: [nftId, bidAmount],
  };
  await sendTransaction(payload);
};
```

#### How to Use:
- **List an NFT for auction**: Admin or NFT owner can list the NFT for auction by setting a starting price and duration.
- **Place bids**: During the auction period, users can place bids. The contract will update the current bid and bidder.
- **Win the auction**: At the end of the auction, the highest bidder wins and can claim the NFT.

---

### 🔄 NFT Transfers 🔁

Users can transfer NFTs to other wallets directly from the marketplace interface. This is useful for gifting or trading assets. The transfer functionality is integrated with the Aptos blockchain.

#### Smart Contract Code (Move):
```move
public entry fun transfer_nft(nft_id: address, recipient: address) {
  let nft = borrow_global_mut<NFT>(nft_id);
  move_to(recipient, nft);
}
```

#### Frontend Code (React - TypeScript):
```typescript
const transferNFT = async (nftId: string, recipientAddress: string) => {
  const payload = {
    function: `${marketplaceAddr}::NFTMarketplace::transfer_nft`,
    arguments: [nftId, recipientAddress],
  };
  await sendTransaction(payload);
};
```

#### How to Use:
- **Navigate to your NFTs list**: Go to your "My NFTs" section to view the NFTs you own.
- **Transfer an NFT**: Select the NFT you wish to transfer, click "Transfer," enter the recipient’s wallet address, and confirm the transfer.

---

### 💸 Offer System 💵

This feature allows users to make offers on NFTs listed for sale and to accept or counter offers. Sellers have more flexibility in selling assets without setting a fixed price.

#### Smart Contract Code (Move):
```move
public entry fun make_offer(nft_id: address, offer_amount: u64) {
  let offer = Offer {
    nft_id,
    offerer: sender(),
    amount: offer_amount,
  };
  move_to_sender<Offer>(offer);
}

public entry fun accept_offer(offer_id: address) {
  let offer = borrow_global_mut<Offer>(offer_id);
  // Transfer NFT to the offerer if accepted
  transfer_nft(offer.nft_id, offer.offerer);
}
```

#### Frontend Code (React - TypeScript):
```typescript
const makeOffer = async (nftId: string, offerAmount: number) => {
  const payload = {
    function: `${marketplaceAddr}::NFTMarketplace::make_offer`,
    arguments: [nftId, offerAmount],
  };
  await sendTransaction(payload);
};

const acceptOffer = async (offerId: string) => {
  const payload = {
    function: `${marketplaceAddr}::NFTMarketplace::accept_offer`,
    arguments: [offerId],
  };
  await sendTransaction(payload);
};
```

#### How to Use:
- **Browse NFTs**: Look for NFTs listed for sale on the marketplace.
- **Make an offer**: Select an NFT and make an offer by entering the amount.
- **Accept or counter offers**: As the seller, you can accept or counter offers made on your listed NFTs.

---

### 🔍 Advanced Filtering and Sorting 🔎

Advanced filtering and sorting options allow users to better navigate the marketplace by narrowing down search results based on specific criteria like rarity, price, and date listed.

#### Frontend Code (React - TypeScript):
```typescript
const filterNFTs = (filters: FilterCriteria) => {
  // Apply filters like rarity, price range, etc.
  const filteredNFTs = nftList.filter(nft => {
    return (
      nft.rarity === filters.rarity &&
      nft.price >= filters.minPrice &&
      nft.price <= filters.maxPrice
    );
  });
  setFilteredNFTs(filteredNFTs);
};

const sortNFTs = (criteria: 'price' | 'popularity') => {
  const sortedNFTs = [...filteredNFTs].sort((a, b) => {
    if (criteria === 'price') {
      return a.price - b.price;
    } else {
      return b.popularity - a.popularity;
    }
  });
  setSortedNFTs(sortedNFTs);
};
```

#### How to Use:
- **Apply filters**: Use the filters in the marketplace to narrow down search results by attributes like rarity and price range.
- **Sort NFTs**: Sort NFTs by price, popularity, or any other criteria.

---

### 📊 Analytics Dashboard 📉

The analytics dashboard provides admins with key insights into the marketplace's activities, including total volume, average price, popular categories, and more.

#### Frontend Code (React - TypeScript):
```typescript
const fetchAnalytics = async () => {
  const response = await fetch('/api/analytics');
  const data = await response.json();
  setAnalyticsData(data);
};
```

#### How to Use:
- **Admin Access**: Admins can access the dashboard via the admin panel to view real-time market insights.
- **View metrics**: Key metrics include total sales, active listings, trending NFTs, and more.

---

### 🛠 Minting for All Users 🛠

Minting NFTs is now available to all connected users. Admins can also implement whitelisting and adjust minting fees.

#### Smart Contract Code (Move):
```move
public entry fun mint_nft(name: string, description: string, image_uri: string, rarity: u8) {
  let nft = NFT {
    name,
    description,
    image_uri,
    rarity,
  };
  move_to_sender<NFT>(nft);
}
```

#### Frontend Code (React - TypeScript):
```typescript
const mintNFT = async (name: string, description: string, imageURI: string, rarity: number) => {
  const payload = {
    function: `${marketplaceAddr}::NFTMarketplace::mint_nft`,
    arguments: [name, description, imageURI, rarity],
  };
  await sendTransaction(payload);
};
```

#### How to Use:
- **Connect your wallet**: Ensure your wallet is connected to the marketplace.
- **Mint an NFT**: Navigate to the "Mint NFT" section, fill in the necessary details, and click to mint the NFT.

---
## 🛠 Error Handling & Troubleshooting ⚠️

### Common Issues and Solutions:

1. **Transaction Failed**
   - **Solution**: If a transaction fails, check the wallet connection and try again. Ensure that you have enough Testnet APT tokens in your wallet for transaction fees Also there would be some error code messages, implemented in backend.

2. **Wallet Connection Issues**
   - **Solution**: Ensure that your wallet (Petra, Martian, or Pontem) is connected properly. If issues persist, try reconnecting or clearing the browser cache.

3. **Network Issues**
   - **Solution**: Verify that your network is set to Testnet. If the connection to the network fails, check if the Aptos fullnode endpoint is down.
   ```typescript
   const client_URL = "https://fullnode.testnet.aptoslabs.com/v1";
   ```

4. **Minting NFT Errors**
   - **Solution**: If minting fails, ensure that the NFT data is valid (e.g., correct image URL and metadata). Also, check for any gas fee issues.


## Contact Information 📬

If you have any questions, feel free to reach out:

- **Email**: amar.tiwari.8355@gmail.com
- **GitHub**: [Amar5623](https://github.com/Amar5623)
- **Twitter**: [@Tiwari__Amar](https://x.com/Tiwari__Amar)
- **Discord**: [rexon2.0](https://discord.com/users/1023236107170742322)

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
