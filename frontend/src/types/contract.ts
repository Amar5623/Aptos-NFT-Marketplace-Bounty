import { AptosClient, Types } from "aptos";

export interface PricePoint {
  timestamp: number;
  price: number;
}

export interface NFTDetails {
    id: number;
    price: number;
    rarity: number;
  }
  

export interface MarketplaceContract {
  get_market_stats: () => Promise<number[]>;
  get_category_volume: (category: string) => Promise<number>;
  get_rarity_volume: (rarity: number) => Promise<number>;
  get_price_history: (id: string) => Promise<PricePoint[]>;
  get_nft_details: (id: string) => Promise<NFTDetails>;
  get_all_nfts_for_sale: () => Promise<NFTDetails[]>;
}

declare global {
    var marketplaceContract: MarketplaceContract;
    var aptosClient: AptosClient;
  }

export const initializeContract = () => {
  const contractAddress = "YOUR-MARKETPLACE-ADDRESS-HERE";
  const moduleId = "NFTMarketplace";
  const client = new AptosClient("https://fullnode.testnet.aptoslabs.com/v1");
  
  const contract: MarketplaceContract = {
    get_market_stats: async () => {
      const result = await client.view({
        function: `${contractAddress}::${moduleId}::get_market_stats`,
        type_arguments: [],
        arguments: [contractAddress]
      });
      return result as number[];
    },

    get_rarity_volume: async (rarity: number) => {
        const result = await client.view({
          function: `${contractAddress}::${moduleId}::get_rarity_volume`,
          type_arguments: [],
          arguments: [contractAddress, rarity]
        });
        return Number((result as Types.MoveValue[])[0]);
      },

    get_category_volume: async (category: string) => {
      const hexCategory = stringToHex(category);
      const result = await client.view({
        function: `${contractAddress}::${moduleId}::get_category_volume`,
        type_arguments: [],
        arguments: [contractAddress, hexCategory]
      });
      return Number((result as Types.MoveValue[])[0]);
    },

    get_price_history: async (id: string) => {
      const result = await client.view({
        function: `${contractAddress}::${moduleId}::get_price_history`,
        type_arguments: [],
        arguments: [contractAddress, id]
      }) as unknown;
      return result as PricePoint[];
    },

    get_nft_details: async (id: string) => {
      const result = await client.view({
        function: `${contractAddress}::${moduleId}::get_nft_details`,
        type_arguments: [],
        arguments: [contractAddress, id]
      }) as unknown;
      return result as NFTDetails;
    },

    get_all_nfts_for_sale: async () => {
        const result = await client.view({
          function: `${contractAddress}::NFTMarketplace::get_all_nfts_for_sale`,
          type_arguments: [],
          arguments: [
            contractAddress,
            "0", 
            "100" 
          ]
        });
        
        return (result as Array<{
          id: string,
          price: string,
          rarity: number
        }>).map(nft => ({
          id: Number(nft.id),
          price: Number(nft.price),
          rarity: nft.rarity
        }));
      }
  };


    const stringToHex = (text: string) => {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(text);
    return "0x" + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    };

    (window as any).aptosClient = client;
    (window as any).marketplaceContract = contract;

  return contract;

};
