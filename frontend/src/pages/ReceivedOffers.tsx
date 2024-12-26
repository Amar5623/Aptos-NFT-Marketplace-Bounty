import React, { useEffect, useState, useCallback } from "react";
import { Typography, Card, Row, Col, message } from "antd";
import { AptosClient } from "aptos";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
import { OffersList } from '../components/OffersList';
import { NFT } from '../types/NFT';

const { Title } = Typography;
const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");

const ReceivedOffers = () => {
  const [nfts, setNfts] = useState<NFT[]>([]);
  const [nftOffers, setNFTOffers] = useState<Record<number, any[]>>({});
  const [totalNFTs, setTotalNFTs] = useState(0);
  const [auctionDetails, setAuctionDetails] = useState<Record<number, any>>({});
  const { account } = useWallet();
  const marketplaceAddr = "YOUR-MARKETPLACE-ADDRESS-HERE";

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
              price: price / 100000000,
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
      message.error("Failed to fetch your NFTs.");
    }
  }, [account, marketplaceAddr]);


  const fetchOffersForNFT = async (nftId: number): Promise<void> => {
    try {
      // Get offer IDs
      const response = await client.view({
        function: `${marketplaceAddr}::NFTMarketplace::get_offers_for_nft`,
        type_arguments: [],
        arguments: [marketplaceAddr, nftId.toString()]
      });
      
      const offerIds = (response as any[])[0] as string[];
      
      // Fetch and filter valid offers
      const currentTime = Math.floor(Date.now() / 1000);
      const offersWithDetails = await Promise.all(
        offerIds.map(async (offerId: string) => {
          const details = await client.view({
            function: `${marketplaceAddr}::NFTMarketplace::get_offer_details`,
            type_arguments: [],
            arguments: [marketplaceAddr, offerId.toString()]
          });
          
          // Only return non-expired offers
          if (Number(details[3]) > currentTime) {
            return {
              offerId,
              nftId: details[0],
              buyer: details[1],
              amount: details[2],
              expiration: Number(details[3]),
              status: details[4]
            };
          }
          return null;
        })
      );
  
      const validOffers = offersWithDetails.filter(offer => offer !== null);
      setNFTOffers(prev => ({
        ...prev,
        [nftId]: validOffers
      }));
    } catch (error) {
      console.error('MyNFTs - Error fetching offers:', error);
    }
  };

  
  const handleAcceptOffer = async (nftId: number, offerId: string) => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::accept_offer`,
        type_arguments: [],
        arguments: [marketplaceAddr, nftId.toString(), offerId]
      };
      
      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      fetchOffersForNFT(nftId);
      fetchUserNFTs();
    } catch (error) {
      console.error("Error accepting offer:", error);
      message.error("Failed to accept offer");
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

  useEffect(() => {
    fetchUserNFTs();
  }, []);

  useEffect(() => {
    if (nfts.length > 0) {
      nfts.forEach(nft => {
        fetchAuctionDetails(nft.id);
        fetchOffersForNFT(nft.id);
      });
    }
  }, [nfts]);

  return (
    <div style={{ padding: "20px" }}>
      <Title level={2} style={{ marginBottom: "20px", textAlign: "center" }}>Received Offers</Title>
      
      {nfts.filter(nft => 
        (nftOffers[nft.id] || []).length > 0 && 
        (nft.for_sale || auctionDetails[nft.id]?.isAuction)
      ).length > 0 ? (
        <Row 
          gutter={[24, 24]}
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {nfts
            .filter(nft => 
              (nftOffers[nft.id] || []).length > 0 && 
              (nft.for_sale || auctionDetails[nft.id]?.isAuction)
            )
            .map(nft => (
              <Col key={nft.id} xs={24} sm={12} md={8} lg={6}>
                <Card 
                  title={`Offers for ${nft.name}`}
                  style={{ 
                    width: "100%",
                    marginBottom: "20px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
                  }}
                >
                  <img 
                    src={nft.uri} 
                    alt={nft.name}
                    style={{ 
                      width: "100%", 
                      height: "200px",
                      objectFit: "cover",
                      marginBottom: "15px"
                    }}
                  />
                  <OffersList 
                    offers={nftOffers[nft.id] || []}
                    onAcceptOffer={(offerId) => handleAcceptOffer(nft.id, offerId)}
                    isOwner={true}
                    marketplaceAddr={marketplaceAddr}
                  />
                </Card>
              </Col>
            ))}
        </Row>
      ) : (
        <p style={{ color: "#666", fontSize: "16px", textAlign: "center" }}>
          No offers received for listed NFTs
        </p>
      )}
    </div>
  );
};

export default ReceivedOffers;
