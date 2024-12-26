import React from 'react';
import { Card, Button } from 'antd';
import RarityBadge from './RarityBadge';
import CountdownTimer from './CountdownTimer';
import { type NFT } from '../pages/MarketView';

const { Meta } = Card;

interface NFTCardProps {
  nft: NFT;
  onBuyClick: (nft: NFT) => void;
  onBidClick: (nft: NFT) => void;
  onOfferClick: (nft: NFT) => void;
}

const NFTCard: React.FC<NFTCardProps> = ({ nft, onBuyClick, onBidClick, onOfferClick }) => {
  return (
    <Card
      hoverable
      style={{ width: 240 }}
      cover={<img alt={nft.name} src={nft.uri} style={{ height: 240, objectFit: 'cover' }} />}
      actions={[
        nft.is_auction ? (
          <Button onClick={() => onBidClick(nft)}>Place Bid</Button>
        ) : (
          <>
            <Button onClick={() => onBuyClick(nft)}>Buy Now</Button>
            <Button onClick={() => onOfferClick(nft)}>Make Offer</Button>
          </>
        )
      ]}
    >
      <Meta
        title={nft.name}
        description={
          <div style={{ padding: '10px 0' }}>
            <RarityBadge rarity={nft.rarity} />
            
            {nft.is_auction ? (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <strong>Current Bid:</strong> {nft.highest_bid / 100000000} APT
                </div>
                <div style={{ 
                  padding: '8px', 
                  background: '#f5f5f5', 
                  borderRadius: '4px',
                  marginBottom: '8px' 
                }}>
                  <strong>Auction Ends:</strong>{' '}
                  <CountdownTimer 
                    endTime={nft.auction_end} 
                    onEnd={() => {}} 
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
    </Card>
  );
};

export default NFTCard;
