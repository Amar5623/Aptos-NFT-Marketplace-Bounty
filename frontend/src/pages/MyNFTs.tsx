import React, { useEffect, useState, useCallback, forwardRef, useImperativeHandle, ForwardedRef } from "react";
import { Typography, Card, Row, Col, Pagination, message as antMessage, Button, Input, Modal } from "antd";
import { AptosClient, Types } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import TransferModal from '../components/TransferModal';
import { GiftOutlined } from '@ant-design/icons';
import { NFT } from '../types/NFT';
import CountdownTimer from '../components/CountdownTimer';
import RarityBadge from '../components/RarityBadge';

function isHexString(value: any): value is string {
  return typeof value === 'string' && value.startsWith('0x');
}


const { Title } = Typography;
const { Meta } = Card;

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

interface GiftDetail {
  isGift: boolean;
  message: string;
  from: string;
  timestamp: number;
}

interface GiftDetails {
  [key: string]: GiftDetail;
}


export interface MyNFTsRef {
  fetchOffersForNFT: (nftId: number) => Promise<void>;
}

const hexToUint8Array = (hexString: string): Uint8Array => {
  const bytes = new Uint8Array(hexString.length / 2);
  for (let i = 0; i < hexString.length; i += 2) {
    bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
  }
  return bytes;
};


const MyNFTs = forwardRef<MyNFTsRef, {}>((props, ref) => {
  const pageSize = 8;
  const [currentPage, setCurrentPage] = useState(1);
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [nftOffers, setNFTOffers] = useState<Record<number, any[]>>({});
  const [totalNFTs, setTotalNFTs] = useState(0);
  const { account, signAndSubmitTransaction } = useWallet();
  const marketplaceAddr = "YOUR-MARKETPLACE-ADDRESS-HERE";


  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedNft, setSelectedNft] = useState<NFT | null>(null);
  const [salePrice, setSalePrice] = useState<string>("");

  const [isAuctionModalVisible, setIsAuctionModalVisible] = useState(false);
  const [auctionDuration, setAuctionDuration] = useState("3600");
  const [startingBid, setStartingBid] = useState("");
  const [auctionDetails, setAuctionDetails] = useState<Record<number, any>>({});

  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [selectedNFTForTransfer, setSelectedNFTForTransfer] = useState<NFT | null>(null);

  const [giftDetails, setGiftDetails] = useState<GiftDetails>({});

  const [offers, setOffers] = useState([]);
  const [filterType, setFilterType] = useState('not_listed');

  const getFilteredNFTs = () => {
    switch (filterType) {
      case 'not_listed':
        return nfts.filter(nft => !nft.for_sale && !auctionDetails[nft.id]?.isAuction);
      case 'for_sale':
        return nfts.filter(nft => nft.for_sale && !auctionDetails[nft.id]?.isAuction);
      case 'for_auction':
        return nfts.filter(nft => auctionDetails[nft.id]?.isAuction);
      default:
        return nfts;
    }
  };

  const fetchUserNFTs = useCallback(async () => {
    if (!account) return;

    try {
      console.log("Fetching NFT IDs for owner:", account.address);

      const nftIdsResponse = await client.view({
        function: `${marketplaceAddr}::NFTMarketplace::get_all_nfts_for_owner`,
        arguments: [marketplaceAddr, account.address, "100", "0"],
        type_arguments: [],
      });

      const nftIds = Array.isArray(nftIdsResponse[0]) ? nftIdsResponse[0] : nftIdsResponse;
      setTotalNFTs(nftIds.length);

      if (nftIds.length === 0) {
        console.log("No NFTs found for the owner.");
        setNfts([]);
        return;
      }

      console.log("Fetching details for each NFT ID:", nftIds);

      const userNFTs = (await Promise.all(
        nftIds.map(async (id) => {
          try {
            const nftDetails = await client.view({
              function: `${marketplaceAddr}::NFTMarketplace::get_nft_details`,
              arguments: [marketplaceAddr, id],
              type_arguments: [],
            });

            const [nftId, owner, name, description, uri, price, forSale, rarity] = nftDetails as [
              number,
              string,
              string,
              string,
              string,
              number,
              boolean,
              number
            ];

            const hexToUint8Array = (hexString: string): Uint8Array => {
              const bytes = new Uint8Array(hexString.length / 2);
              for (let i = 0; i < hexString.length; i += 2) {
                bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
              }
              return bytes;
            };

            return {
              id: nftId,
              name: new TextDecoder().decode(hexToUint8Array(name.slice(2))),
              description: new TextDecoder().decode(hexToUint8Array(description.slice(2))),
              uri: new TextDecoder().decode(hexToUint8Array(uri.slice(2))),
              rarity,
              price: price / 100000000, // Convert octas to APT
              for_sale: forSale,
            };
          } catch (error) {
            console.error(`Error fetching details for NFT ID ${id}:`, error);
            return null;
          }
        })
      )).filter((nft): nft is NFT => nft !== null);

      console.log("User NFTs:", userNFTs);
      setNfts(userNFTs);
    } catch (error) {
      console.error("Error fetching NFTs:", error);
      antMessage.error("Failed to fetch your NFTs.");
    }
  }, [account, marketplaceAddr]);


  const handleSellClick = (nft: NFT) => {
    setSelectedNft(nft);
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedNft(null);
    setSalePrice("");
  };

  const handleConfirmListing = async () => {
    if (!selectedNft || !salePrice) return;

    try {
      const priceInOctas = parseFloat(salePrice) * 100000000;

      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::list_for_sale`,
        type_arguments: [],
        arguments: [
          marketplaceAddr,
          selectedNft.id.toString(),
          priceInOctas.toString()
        ],
      };

      const response = await window.aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);

      antMessage.success("NFT listed successfully!");
      setIsModalVisible(false);
      setSalePrice("");
      fetchUserNFTs();
    } catch (error) {
      console.error("Error listing NFT:", error);
      antMessage.error("Failed to list NFT");
    }
  };


  const handleCreateAuction = async () => {
    if (!selectedNft || !startingBid || !auctionDuration) return;

    try {
      const startingBidInOctas = Math.floor(parseFloat(startingBid) * 100000000).toString();

      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::create_auction`,
        type_arguments: [],
        arguments: [
          marketplaceAddr,
          selectedNft.id.toString(),
          startingBidInOctas,
          auctionDuration,
          "10000000"
        ],
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      antMessage.success("Auction created successfully!");
      setIsAuctionModalVisible(false);
      fetchUserNFTs();
    } catch (error) {
      console.error("Error creating auction:", error);
      antMessage.error("Failed to create auction.");
    }
  };

  const fetchAuctionDetails = async (nftId: number) => {
    try {
      const response = await client.view({
        function: `${marketplaceAddr}::NFTMarketplace::get_auction_info`,
        type_arguments: [],
        arguments: [marketplaceAddr, nftId.toString()]
      });

      setAuctionDetails(prev => ({
        ...prev,
        [nftId]: {
          isAuction: response[0],
          endTime: response[1],
          startingBid: response[2],
          currentBid: response[3],
          highestBidder: response[4]
        }
      }));
    } catch (error) {
      console.error("Error fetching auction details:", error);
    }
  };

  const handleEndAuction = async (nftId: number) => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::end_auction`,
        type_arguments: [],
        arguments: [marketplaceAddr, nftId.toString()]
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      antMessage.success("Auction ended successfully!");
      fetchUserNFTs();
    } catch (error) {
      console.error("Error ending auction:", error);
      antMessage.error("Failed to end auction");
    }
  };

  const handleTransfer = async (toAddress: string, message: string, isGift: boolean) => {
    if (!selectedNFTForTransfer) return;


    try {
      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::transfer_nft_with_message`,
        type_arguments: [],
        arguments: [
          marketplaceAddr,
          selectedNFTForTransfer.id.toString(),
          toAddress,
          Array.from(new TextEncoder().encode(message)),
          isGift
        ],
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      antMessage.success('NFT transferred successfully!');
      setIsTransferModalVisible(false);
      fetchUserNFTs();
    } catch (error) {
      console.error('Transfer error:', error);
      antMessage.error('Failed to transfer NFT');
    }
  };

  const fetchGiftDetails = async (nftId: number) => {
    try {
      const response = await client.view({
        function: `${marketplaceAddr}::NFTMarketplace::get_nft_gift_details`,
        arguments: [marketplaceAddr, nftId],
        type_arguments: [],
      });

      const [isGift, message, from, timestamp] = response;
      if (isGift && isHexString(message)) {
        setGiftDetails(prev => ({
          ...prev,
          [nftId]: {
            isGift,
            message: new TextDecoder().decode(hexToUint8Array(message.slice(2))),
            from,
            timestamp
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching gift details:', error);
    }
  };


  const formatTimeRemaining = (endTime: number) => {
    const now = Math.floor(Date.now() / 1000);
    const remaining = endTime - now;

    if (remaining <= 0) return "Auction Ended";

    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  };

  useEffect(() => {
    fetchUserNFTs();
  }, [fetchUserNFTs, currentPage]);

  useEffect(() => {
    const loadGiftDetails = async () => {
      for (const nft of nfts) {
        await fetchGiftDetails(nft.id);
      }
    };

    if (nfts.length > 0) {
      loadGiftDetails();
    }
  }, [nfts]);

  useEffect(() => {
    if (nfts.length > 0) {
      nfts.forEach(nft => {
        fetchAuctionDetails(nft.id);
      });
    }
  }, [nfts]);

  const filteredNFTs = getFilteredNFTs();
  const paginatedNFTs = filteredNFTs.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div
      style={{
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Title level={2} style={{ marginBottom: "20px" }}>My Collection</Title>
      <p>Your personal collection of NFTs.</p>

      {/* Add the filter buttons */}
      <div style={{ marginBottom: "20px" }}>
        <Button.Group>
          <Button
            type={filterType === 'not_listed' ? 'primary' : 'default'}
            onClick={() => setFilterType('not_listed')}
          >
            Not Listed
          </Button>
          <Button
            type={filterType === 'for_sale' ? 'primary' : 'default'}
            onClick={() => setFilterType('for_sale')}
          >
            For Sale
          </Button>
          <Button
            type={filterType === 'for_auction' ? 'primary' : 'default'}
            onClick={() => setFilterType('for_auction')}
          >
            For Auction
          </Button>
        </Button.Group>
      </div>

      {/* Card Grid */}
      <Row
        gutter={[24, 24]}
        style={{
          marginTop: 20,
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {paginatedNFTs.map((nft) => (
          <Col
            key={nft.id}
            xs={24} sm={12} md={8} lg={8} xl={6}
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Card
              hoverable
              style={{
                width: "100%",
                maxWidth: "280px",
                minWidth: "220px",
                margin: "0 auto",
                position: "relative"
              }}
              cover={
                <div style={{ position: "relative" }}>
                  <img alt={nft.name} src={nft.uri} style={{paddingTop:"15px"}}/>
                  {giftDetails[nft.id]?.isGift && (
                    <div style={{
                      position: "absolute",
                      top: "10px",
                      right: "10px",
                      zIndex: 2,
                      background: "rgba(255, 255, 255, 0.8)",
                      borderRadius: "50%",
                      padding: "8px",
                      cursor: "pointer"
                    }}>
                      <GiftOutlined
                        style={{ color: '#ff4d4f', fontSize: '24px' }}
                        onClick={() => {
                          Modal.info({
                            title: 'Gift Message',
                            content: (
                              <div>
                                <p>{giftDetails[nft.id].message}</p>
                                <p>From: {giftDetails[nft.id].from}</p>
                                <p>Received: {new Date(giftDetails[nft.id].timestamp * 1000).toLocaleString()}</p>
                              </div>
                            ),
                          });
                        }}
                      />
                    </div>
                  )}
                </div>
              }
              actions={[
                auctionDetails[nft.id]?.isAuction ? (
                  <Button
                    type="primary"
                    danger
                    disabled={Date.now() / 1000 <= auctionDetails[nft.id].endTime}
                    onClick={() => handleEndAuction(nft.id)}
                  >
                    End Auction
                  </Button>
                ) : (
                  <>
                    <Button type="link" onClick={() => handleSellClick(nft)}>Sell</Button>
                    <Button type="link" onClick={() => {
                      setSelectedNft(nft);
                      setIsAuctionModalVisible(true);
                    }}>Create Auction</Button>
                    <Button
                      type="link"
                      onClick={() => {
                        setSelectedNFTForTransfer(nft);
                        setIsTransferModalVisible(true);
                      }}
                    >
                      Transfer
                    </Button>
                  </>
                )
              ]}
            >

              <Meta
                title={nft.name}
                description={
                  <div style={{ padding: '10px 0' }}>
                    <RarityBadge rarity={nft.rarity} />
                    {auctionDetails[nft.id]?.isAuction ? (
                      <>
                        <div style={{ marginBottom: '8px' }}>
                          <strong>Current Bid:</strong> {auctionDetails[nft.id].currentBid / 100000000} APT
                        </div>
                        <div style={{
                          padding: '8px',
                          background: '#f5f5f5',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }}>
                          <strong>Time Remaining:</strong>{' '}
                          <CountdownTimer
                            endTime={Number(auctionDetails[nft.id].endTime)}
                            onEnd={() => fetchAuctionDetails(nft.id)}
                            type="auction"
                          />
                        </div>
                      </>
                    ) : (
                      <div style={{ marginBottom: '8px' }}>
                        <strong>Price:</strong> {nft.price} APT
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
                      {nft.description}
                    </div>
                  </div>
                }
              />
              <p>ID: {nft.id}</p>
              <p style={{ margin: "10px 0" }}>
                Status: {auctionDetails[nft.id]?.isAuction ? "In Auction" : nft.for_sale ? "For Sale" : "Not Listed"}

              </p>
            </Card>
          </Col>
        ))}
      </Row>


      <div style={{ marginTop: 30, marginBottom: 30 }}>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={filteredNFTs.length}
          onChange={(page) => setCurrentPage(page)}
          style={{ display: "flex", justifyContent: "center" }}
        />
      </div>

      <Modal
        title="Sell NFT"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="confirm" type="primary" onClick={handleConfirmListing}>
            Confirm Listing
          </Button>,
        ]}
      >
        {selectedNft && (
          <>
            <p><strong>NFT ID:</strong> {selectedNft.id}</p>
            <p><strong>Name:</strong> {selectedNft.name}</p>
            <p><strong>Description:</strong> {selectedNft.description}</p>
            <p><strong>Rarity:</strong> {selectedNft.rarity}</p>
            <p><strong>Current Price:</strong> {selectedNft.price} APT</p>

            <Input
              type="number"
              placeholder="Enter sale price in APT"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              style={{ marginTop: 10 }}
            />
          </>
        )}
      </Modal>

      <Modal
        title="Create Auction"
        visible={isAuctionModalVisible}
        onCancel={() => setIsAuctionModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsAuctionModalVisible(false)}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleCreateAuction}>
            Create Auction
          </Button>
        ]}
      >
        <Input
          type="number"
          placeholder="Starting bid in APT"
          value={startingBid}
          onChange={(e) => setStartingBid(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input
          type="number"
          placeholder="Duration in seconds"
          value={auctionDuration}
          onChange={(e) => setAuctionDuration(e.target.value)}
        />
      </Modal>

      <TransferModal
        visible={isTransferModalVisible}
        nft={selectedNFTForTransfer}
        onCancel={() => {
          setIsTransferModalVisible(false);
          setSelectedNFTForTransfer(null);
        }}
        onTransfer={handleTransfer}
      />
    </div>
  );
});

export default MyNFTs;