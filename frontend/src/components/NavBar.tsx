import React, { useEffect, useState } from "react";
import { Layout, Typography, Menu, Space, Button, Dropdown, message } from "antd";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { AptosClient } from "aptos";
import { AccountBookOutlined, DownOutlined, LogoutOutlined, BarChartOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Header } = Layout;
const { Text } = Typography;

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

interface NavBarProps {
  onMintNFTClick: () => void;
  marketplaceAddr: string;
}

const NavBar: React.FC<NavBarProps> = ({ onMintNFTClick, marketplaceAddr }) => {
  const { connected, account, network, disconnect } = useWallet(); 
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (account) {
        try {
          const resources: any[] = await client.getAccountResources(account.address);
          const accountResource = resources.find(
            (r) => r.type === "0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>"
          );
          if (accountResource) {
            const balanceValue = (accountResource.data as any).coin.value;
            setBalance(balanceValue ? parseInt(balanceValue) / 100000000 : 0);
          } else {
            setBalance(0);
          }
        } catch (error) {
          console.error("Error fetching balance:", error);
        }
      }
    };

    if (connected) {
      fetchBalance();
    }
  }, [account, connected]);

  const handleLogout = async () => {
    try {
      await disconnect(); // Disconnect the wallet
      setBalance(null); // Clear balance on logout
      message.success("Disconnected from wallet");
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      message.error("Failed to disconnect from wallet");
    }
  };

  return (
    <Header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#001529",
        padding: "0 20px",
        height: "64px",
        position: "fixed",
        width: "100%",
        zIndex: 1000,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", flex: 1, maxWidth: "calc(100% - 200px)" }}>
        <img src="/Aptos_Primary_WHT.png" alt="Aptos Logo" style={{ height: "30px", marginRight: 16 }} />
        <Menu 
            theme="dark" 
            mode="horizontal" 
            defaultSelectedKeys={["marketplace"]} 
            style={{ 
              backgroundColor: "#001529",
              flex: 1,
              minWidth: "600px", 
              display: "flex",
              justifyContent: "flex-start"
            }}
          >
          <Menu.Item key="marketplace" style={{padding: "0 20px", height: "64px", lineHeight: "64px", margin: "0 4px" }}>
            <Link to="/" style={{ color: "#fff" }}>Marketplace</Link>
          </Menu.Item>
          <Menu.Item key="my-collection" style={{padding: "0 20px", height: "64px", lineHeight: "64px", margin: "0 4px" }}>
            <Link to="/my-nfts" style={{ color: "#fff" }}>My Collection</Link>
          </Menu.Item>
          <Menu.Item key="mint-nft" style={{padding: "0 20px", height: "64px", lineHeight: "64px", margin: "0 4px" }} onClick={onMintNFTClick}>
            <span style={{ color: "#fff" }}>Mint NFT</span>
          </Menu.Item>
          <Menu.Item key="received-offers" style={{padding: "0 20px", height: "64px", lineHeight: "64px", margin: "0 4px" }}>
              <Link to="/received-offers" style={{ color: "#fff" }}>Received Offers</Link>
            </Menu.Item>
          <Menu.Item key="analytics" style={{padding: "0 20px", height: "64px", lineHeight: "64px", margin: "0 4px" }}>
          <Link to="/analytics" style={{ color: "#fff" }}>
            <BarChartOutlined /> Analytics
          </Link>
          </Menu.Item>
          {account?.address === marketplaceAddr && (
            <Menu.Item key="admin" style={{padding: "0 20px", height: "64px", lineHeight: "64px", margin: "0 4px" }}>
              <Link to="/admin" style={{ color: "#fff" }}>Admin Panel</Link>
            </Menu.Item>
          )}
        </Menu>
      </div>
  
      <Space style={{ alignItems: "center" }}>
        {connected && account ? (
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="address">
                  <Text strong>Address:</Text> <br />
                  <Text copyable>{account.address}</Text>
                </Menu.Item>
                <Menu.Item key="network">
                  <Text strong>Network:</Text> {network ? network.name : "Unknown"}
                </Menu.Item>
                <Menu.Item key="balance">
                  <Text strong>Balance:</Text> {balance !== null ? `${balance} APT` : "Loading..."}
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
                  Log Out
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
          >
            <Button type="primary">
              Connected <DownOutlined />
            </Button>
          </Dropdown>
        ) : (
          <WalletSelector />
        )}
      </Space>
    </Header>
  );
};

export default NavBar;