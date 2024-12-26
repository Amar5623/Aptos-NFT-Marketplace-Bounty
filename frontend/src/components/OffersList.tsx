import React, { useState } from 'react';
import { Button, Modal, Input, message } from 'antd';
import { AptosClient } from 'aptos';
import CountdownTimer from './CountdownTimer';
import { Provider } from "aptos";
import { Network } from "aptos";
import { Types } from 'aptos';
import { InputTransactionData } from "@aptos-labs/wallet-adapter-core";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
const provider = new Provider(Network.DEVNET);

interface Offer {
  offerId: string;
  amount: string;
  expiration: string;
  buyer: string;
  status: string;
  nftId: string;
}

const truncateAddress = (address: string, start = 6, end = 4) => {
  return `${address.slice(0, start)}...${address.slice(-end)}`;
};

const formatAmount = (amountStr: string) => {
  const amount = parseInt(amountStr);
  if (isNaN(amount)) return '0';
  return (amount / 100000000).toFixed(4);
};

const OFFER_STATUS: { [key: string]: string } = {
  '0': 'PENDING',
  '1': 'ACCEPTED',
  '2': 'REJECTED',
  '3': 'COUNTERED',
  '4': 'COUNTER'
};


export const OffersList = ({ 
  offers, 
  onAcceptOffer,
  isOwner = false,
  marketplaceAddr 
}: { 
  offers: Offer[], 
  onAcceptOffer: (offerId: string) => void,
  isOwner?: boolean,
  marketplaceAddr: string 
}) => {
  const [counterOfferAmount, setCounterOfferAmount] = useState("");
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [isCounterModalVisible, setIsCounterModalVisible] = useState(false);
  const { signAndSubmitTransaction, account } = useWallet();

  const handleCounterOffer = async () => {
    if (!selectedOffer || !counterOfferAmount || !account) return;
    
    try {
        const transaction: InputTransactionData = {
            data: {
                function: `${marketplaceAddr}::NFTMarketplace::counter_offer`,
                typeArguments: [],
                functionArguments: [
                    marketplaceAddr,
                    selectedOffer.nftId.toString(),
                    selectedOffer.offerId.toString(),
                    Math.floor(parseFloat(counterOfferAmount) * 100000000).toString()
                ]
            }
        };

        const response = await signAndSubmitTransaction(transaction);
        await provider.waitForTransaction(response.hash);
        message.success("Counter offer sent successfully!");
        setIsCounterModalVisible(false);
    } catch (error: any) {
        console.error("Error creating counter offer:", error);
        message.error("Counter offer creation failed. Please try again.");
    }
};



  const handleCancelOffer = async (offerId: string) => {
    try {
      const payload = {
        type: "entry_function_payload",
        function: `${marketplaceAddr}::NFTMarketplace::cancel_offer`,
        type_arguments: [],
        arguments: [marketplaceAddr, offerId]
      };

      const response = await (window as any).aptos.signAndSubmitTransaction(payload);
      await client.waitForTransaction(response.hash);
      message.success("Offer cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling offer:", error);
      message.error("Failed to cancel offer");
    }
  };

  return (
    <div className="offers-list">
      {offers.map((offer) => {
        console.log('Offer expiration:', {
          rawExpiration: offer.expiration,
          parsedExpiration: parseInt(offer.expiration),
          currentTime: Math.floor(Date.now() / 1000)
        });

        return (
          <div key={offer.offerId} style={{
            padding: "20px",
            border: "1px solid #e8e8e8",
            borderRadius: "8px",
            marginBottom: "15px",
            backgroundColor: "#fafafa",
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "20px",
            minHeight: "200px"
          }}>
            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>
              From: {truncateAddress(offer.buyer)}
            </div>
            <div style={{ color: "#1890ff", marginBottom: "5px" }}>
              Amount: {formatAmount(offer.amount)} APT
            </div>
            <div style={{ color: "#666", fontSize: "14px", marginBottom: "10px" }}>
              Expires in: <CountdownTimer 
                endTime={parseInt(offer.expiration)} 
                onEnd={() => {}} 
                type="offer"
              />
            </div>
            <div style={{ color: "#888", marginBottom: "10px" }}>
              Status: {OFFER_STATUS[offer.status] || 'UNKNOWN'}
            </div>
            
            {isOwner ? (
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                flexWrap: 'wrap', 
                justifyContent: 'space-between' 
              }}>
                <Button 
                  type="primary"
                  onClick={() => onAcceptOffer(offer.offerId)}
                  style={{ flex: '1', minWidth: '100px' }}
                >
                  Accept
                </Button>
                <Button 
                  onClick={() => {
                    setSelectedOffer(offer);
                    setIsCounterModalVisible(true);
                  }}
                  style={{ flex: '1', minWidth: '100px' }}
                >
                  Counter
                </Button>
              </div>
            ) : (
              <Button 
                danger
                onClick={() => handleCancelOffer(offer.offerId)}
                style={{ width: '100%' }}
              >
                Cancel Offer
              </Button>
            )}
          </div>
        );
      })}

      <Modal
        title="Make Counter Offer"
        visible={isCounterModalVisible}
        onCancel={() => setIsCounterModalVisible(false)}
        onOk={handleCounterOffer}
      >
        <Input
          type="number"
          placeholder="Enter counter offer amount in APT"
          value={counterOfferAmount}
          onChange={(e) => setCounterOfferAmount(e.target.value)}
          step="0.1"
        />
      </Modal>
    </div>
  );
}