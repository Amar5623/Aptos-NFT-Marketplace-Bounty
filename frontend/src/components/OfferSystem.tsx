import { useState } from 'react';
import { Input, Button, Form } from 'antd';
import { useWallet } from '@aptos-labs/wallet-adapter-react';

interface OfferSystemProps {
  nftId: number;
  currentPrice: number;
  onOfferSubmit: (amount: number, expiration: number) => Promise<void>;
}

export const OfferSystem = ({ nftId, currentPrice, onOfferSubmit }: OfferSystemProps) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [expirationDays, setExpirationDays] = useState('7');
  const { account } = useWallet();

  const handleSubmit = async () => {
    if (!offerAmount || !expirationDays) return;
  
    const currentTime = Math.floor(Date.now() / 1000);
    const daysInSeconds = parseInt(expirationDays) * 24 * 60 * 60;
    const expirationTimestamp = currentTime + daysInSeconds;
  
    console.log('Detailed timestamp calculation:', {
      currentTimeReadable: new Date(currentTime * 1000).toLocaleString(),
      expirationTimeReadable: new Date(expirationTimestamp * 1000).toLocaleString(),
      currentTime,
      daysInSeconds,
      expirationTimestamp,
      difference: expirationTimestamp - currentTime
    });
  
    const amountInOctas = Math.floor(parseFloat(offerAmount) * 100000000);
    await onOfferSubmit(amountInOctas, expirationTimestamp);
  };
  

  return (
    <Form layout="vertical">
      <Form.Item label="Offer Amount (APT)">
        <Input
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          min="0"
          step="0.1"
        />
      </Form.Item>
      <Form.Item label="Expires in (days)">
        <Input
          type="number"
          value={expirationDays}
          onChange={(e) => setExpirationDays(e.target.value)}
          min="1"
        />
      </Form.Item>
      <Button
        type="primary"
        onClick={handleSubmit}
        disabled={!account || !offerAmount}
        block
      >
        Submit Offer
      </Button>
    </Form>
  );
};
