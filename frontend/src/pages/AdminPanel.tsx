import React, { useState, useEffect } from 'react';
import { Card, Input, Button, List, Typography, message, Space } from 'antd';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";

const { Title, Text } = Typography;

interface AdminPanelProps {
  marketplaceAddr: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ marketplaceAddr }) => {
  const { account, signAndSubmitTransaction } = useWallet();
  const [newFee, setNewFee] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [currentFee, setCurrentFee] = useState<number>(0);
  const [whitelistedAddresses, setWhitelistedAddresses] = useState<string[]>([]);

  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

  const isAdmin = account?.address === marketplaceAddr;

  useEffect(() => {
    fetchMintingConfig();
  }, [account?.address]);

  const fetchMintingConfig = async () => {
    try {
      const feeResponse = await client.view({
        function: `${marketplaceAddr}::NFTMarketplace::get_minting_fee`,
        type_arguments: [],
        arguments: [marketplaceAddr]
      });
      setCurrentFee(Number(feeResponse[0]) / 100000000);
    } catch (error) {
      console.error("Error fetching config:", error);
    }
  };

  const updateMintingFee = async () => {
    if (!isAdmin) {
      message.error("Only marketplace owner can perform this action");
      return;
    }
  
    try {
      const entryFunctionPayload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::update_minting_fee`,
        type_arguments: [],
        arguments: [marketplaceAddr, Math.floor(parseFloat(newFee) * 100000000)]
      };
  
      const response = await (window as any).aptos.signAndSubmitTransaction(entryFunctionPayload);
      await client.waitForTransaction(response.hash);
      message.success("Minting fee updated successfully!");
      fetchMintingConfig();
    } catch (error) {
      message.error("Failed to update minting fee");
      console.error(error);
    }
  };
  
  
  const addToWhitelist = async () => {
    if (!isAdmin) {
      message.error("Only marketplace owner can perform this action");
      return;
    }
  
    try {
      const entryFunctionPayload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::add_to_whitelist`,
        type_arguments: [],
        arguments: [marketplaceAddr, newAddress]
      };
  
      const response = await (window as any).aptos.signAndSubmitTransaction(entryFunctionPayload);
      await client.waitForTransaction(response.hash);
      message.success("Address added to whitelist!");
      setNewAddress('');
      fetchWhitelistedAddresses(); 
    } catch (error) {
      message.error("Failed to add address to whitelist");
      console.error(error);
    }
  };
  
  const removeFromWhitelist = async (address: string) => {
    if (!isAdmin) {
      message.error("Only marketplace owner can perform this action");
      return;
    }
  
    try {
      const entryFunctionPayload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::remove_from_whitelist`,
        type_arguments: [],
        arguments: [marketplaceAddr, address]
      };
  
      const response = await (window as any).aptos.signAndSubmitTransaction(entryFunctionPayload);
      await client.waitForTransaction(response.hash);
      message.success("Address removed from whitelist!");
      fetchWhitelistedAddresses(); 
    } catch (error) {
      message.error("Failed to remove address from whitelist");
      console.error(error);
    }
  };

  const fetchWhitelistedAddresses = async () => {
    try {
      const response = await client.view({
        function: `${marketplaceAddr}::NFTMarketplace::get_whitelisted_addresses`,
        type_arguments: [],
        arguments: [marketplaceAddr]
      });
      
      const addresses = response[0] as string[];
      setWhitelistedAddresses(addresses);
    } catch (error) {
      console.error("Error fetching whitelisted addresses:", error);
    }
  };
  

  useEffect(() => {
    fetchMintingConfig();
    fetchWhitelistedAddresses();
  }, [account?.address]);  
  

  if (!isAdmin) {
    return <Text>Access denied. Only marketplace owner can access this page.</Text>;
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%', padding: '24px' }}>
      <Title level={2}>Marketplace Admin Panel</Title>

      <Card title="Update Minting Fee">
        <Space>
          <Input 
            placeholder="New minting fee in APT"
            value={newFee}
            onChange={(e) => setNewFee(e.target.value)}
            style={{ width: 200 }}
          />
          <Button type="primary" onClick={updateMintingFee}>
            Update Fee
          </Button>
        </Space>
        <Text>Current fee: {currentFee} APT</Text>
      </Card>

      <Card title="Whitelist Management">
        <Space direction="vertical" style={{ width: '100%' }}>
          <Space>
            <Input 
              placeholder="Address to whitelist"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              style={{ width: 400 }}
            />
            <Button type="primary" onClick={addToWhitelist}>
              Add to Whitelist
            </Button>
          </Space>

          <List
            header={<div>Whitelisted Addresses</div>}
            bordered
            dataSource={whitelistedAddresses}
            renderItem={address => (
              <List.Item
                actions={[
                  <Button danger onClick={() => removeFromWhitelist(address)}>
                    Remove
                  </Button>
                ]}
              >
                {address}
              </List.Item>
            )}
          />
        </Space>
      </Card>
    </Space>
  );
};

export default AdminPanel;
