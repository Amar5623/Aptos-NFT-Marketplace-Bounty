import React, { useState, useEffect } from 'react';
import { Card, Typography, Space } from 'antd';
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";

const { Text } = Typography;

interface MintingConfigProps {
  marketplaceAddr: string;
}

const MintingConfig: React.FC<MintingConfigProps> = ({ marketplaceAddr }) => {
  const { account } = useWallet();
  const [isWhitelisted, setIsWhitelisted] = useState(false);
  const [mintingFee, setMintingFee] = useState<number>(0);

  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

  useEffect(() => {
    const fetchMintingConfig = async () => {
      if (account?.address) {
        try {
          const [feeResponse, whitelistResponse] = await Promise.all([
            client.view({
              function: `${marketplaceAddr}::NFTMarketplace::get_minting_fee`,
              type_arguments: [],
              arguments: [marketplaceAddr]
            }),
            client.view({
              function: `${marketplaceAddr}::NFTMarketplace::is_whitelisted`,
              type_arguments: [],
              arguments: [marketplaceAddr, account.address]
            })
          ]);

          const isUserWhitelisted = Boolean(whitelistResponse[0]);
          const isUserOwner = account.address === marketplaceAddr;

          setIsWhitelisted(isUserWhitelisted);
          setMintingFee(isUserWhitelisted || isUserOwner ? 0 : Number(feeResponse[0]));
        } catch (error) {
          console.error("Error fetching minting config:", error);
        }
      }
    };

    fetchMintingConfig();
  }, [account?.address, marketplaceAddr, client]);

  const getStatusText = () => {
    if (account?.address === marketplaceAddr) return "Owner";
    if (isWhitelisted) return "Whitelisted";
    return "Not Whitelisted";
  };

  return (
    <Card title="Minting Configuration" size="small">
      <Space direction="vertical">
        <Text>Current Minting Fee: {mintingFee / 100000000} APT</Text>
        <Text>Status: {getStatusText()}</Text>
      </Space>
    </Card>
  );
};

export default MintingConfig;
