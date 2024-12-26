export interface NFT {
    id: number;
    owner: string;
    name: string;
    description: string;
    uri: string;
    price: number;
    for_sale: boolean;
    rarity: number;
    is_auction: boolean;
    auction_end: number;
    highest_bid: number;
    highest_bidder: string;
    starting_bid: number;
}
