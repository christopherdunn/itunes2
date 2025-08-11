// Basic shared types for the app
export type FeedType = "topsongs" | "topalbums" | "topmusicvideos";
export type Storefront = "us" | "gb" | "ca" | "au" | "de" | "fr" | "jp" | "br";

export interface ChartItem {
  index: number;
  id: string;
  name: string;
  artist: string;
  artwork: string;
  price: string;
  time: string; // m:ss
  linkUrl: string; 
}

// Note: No console logs here—this file is purely types.
