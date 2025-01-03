import React, { useState, useEffect } from "react";
import "./App.css";
import { Layout, Modal, Form, Input, Select, Button, message, Space } from "antd";
import NavBar from "./components/NavBar";
import MarketView from "./pages/MarketView";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MyNFTs from "./pages/MyNFTs";
import { AptosClient } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import MintingConfig from "./components/MintingConfig";
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import { AptosWalletAdapterProvider } from '@aptos-labs/wallet-adapter-react';
import { PetraWallet } from 'petra-plugin-wallet-adapter';
import { MartianWallet } from '@martianwallet/aptos-wallet-adapter';
import { PontemWallet } from '@pontem/wallet-adapter-plugin';
import AdminPanel from './pages/AdminPanel';
import { initializeContract } from './types/contract';
import ReceivedOffers from './pages/ReceivedOffers';

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const marketplaceAddr = "YOUR-MARKETPLACE-ADDRESS-HERE";

const wallets = [
  new PetraWallet(),
  new MartianWallet(),
  new PontemWallet()
];

const App: React.FC = () => {
  const { signAndSubmitTransaction } = useWallet();
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    initializeContract();
  }, []);

  const handleMintNFTClick = () => setIsModalVisible(true);

  const handleMintNFT = async (values: { name: string; description: string; uri: string; rarity: number }) => {
    try {
      const nameVector = Array.from(new TextEncoder().encode(values.name));
      const descriptionVector = Array.from(new TextEncoder().encode(values.description));
      const uriVector = Array.from(new TextEncoder().encode(values.uri));

      const entryFunctionPayload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::mint_nft_with_fee`,
        type_arguments: [],
        arguments: [
          marketplaceAddr,
          nameVector,
          descriptionVector,
          uriVector,
          values.rarity
        ]
      };

      const txnResponse = await (window as any).aptos.signAndSubmitTransaction(entryFunctionPayload);
      await client.waitForTransaction(txnResponse.hash);

      message.success("NFT minted successfully!");
      setIsModalVisible(false);
    } catch (error) {
      console.error("Error minting NFT:", error);
      message.error("Failed to mint NFT.");
    }
  };

  return (
    <AptosWalletAdapterProvider plugins={wallets} autoConnect={true}>
      <Router>
        <Layout>
        <NavBar onMintNFTClick={handleMintNFTClick} marketplaceAddr={marketplaceAddr} />
        <Layout.Content style={{ marginTop: "64px" }}>

          <Routes>
            <Route path="/" element={<MarketView marketplaceAddr={marketplaceAddr} />} />
            <Route path="/my-nfts" element={<MyNFTs />} />
            <Route path="/received-offers" element={<ReceivedOffers />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
            <Route path="/admin" element={<AdminPanel marketplaceAddr={marketplaceAddr} />} />
          </Routes>

          <Modal
            title="Mint New NFT"
            visible={isModalVisible}
            onCancel={() => setIsModalVisible(false)}
            footer={null}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <MintingConfig marketplaceAddr={marketplaceAddr} />
              <Form layout="vertical" onFinish={handleMintNFT}>
                <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please enter a name!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Description" name="description" rules={[{ required: true, message: "Please enter a description!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="URI" name="uri" rules={[{ required: true, message: "Please enter a URI!" }]}>
                  <Input />
                </Form.Item>
                <Form.Item label="Rarity" name="rarity" rules={[{ required: true, message: "Please select a rarity!" }]}>
                  <Select>
                    <Select.Option value={1}>Common</Select.Option>
                    <Select.Option value={2}>Uncommon</Select.Option>
                    <Select.Option value={3}>Rare</Select.Option>
                    <Select.Option value={4}>Epic</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit">
                    Mint NFT
                  </Button>
                </Form.Item>
              </Form>
            </Space>
          </Modal>
          </Layout.Content>
        </Layout>
      </Router>
    </AptosWalletAdapterProvider>
  );
};

export default App;
