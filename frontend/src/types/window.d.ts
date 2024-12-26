interface Window {
    aptos: {
      signAndSubmitTransaction: (payload: any) => Promise<any>;
    };
    marketplaceContract: MarketplaceContract;
  }
  
  interface MarketplaceContract {
    get_market_stats: () => Promise<number[]>;
    get_category_volume: (category: string) => Promise<number>;
    get_rarity_volume: (rarity: number) => Promise<number>;
    get_price_history: (id: string) => Promise<number[]>;
    get_nft_details: (id: string) => Promise<any>;
    get_all_nfts_for_sale: () => Promise<string[]>;
  }