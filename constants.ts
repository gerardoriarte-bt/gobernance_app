
import { MasterSchema } from './types';

export const MEDIA_OWNERS = ['Buentipo', 'Hermano', 'LoBueno'] as const;


export const MASTER_SCHEMA: MasterSchema = {
  "config": { "separator": "/", "case": "PascalCase" },
  "dictionaries": {
    "country": ["Mexico", "Colombia", "Brazil", "Chile", "Peru"],
    "budgetSource": ["Brand", "Performance", "Ecommerce"],
    "campaignName": ["SS22GiftOfTheGame", "SS23Curry10", "FW24BlackDays", "AlwaysOn"],
    "provider": ["Meta", "Meta Ads", "Google Ads", "TikTok", "YouTube", "DV360", "Spotify", "Amazon Ads", "LinkedIn", "Pinterest", "Snapchat", "X"],
    "objective": ["Reach", "VideoViews", "Traffic", "Conversions", "CatalogSales", "AppInstalls"],
    "channel": ["Social Media", "Carrusel", "Video", "Imagen", "Story", "Paid Search", "Display", "Online Video", "Connected TV", "Influencer", "Programmatic", "Audio", "Native", "Affiliate"],
    "funnel": ["Attract", "Consider", "Convert"],
    "audienceStrategy": ["Prospecting", "Retargeting", "Retention", "DABA", "DPA"],
    "audienceSegment": ["Broad", "Affinity", "InMarket", "LAL1to3", "SocialEngagers", "SiteVisitors", "AddToCart"],
    "placement": ["Auto", "Feeds", "StoriesReels", "RightColumn"],
    "creativeFormat": ["Video", "SingleImage", "Carousel", "Collection", "RichMedia"],
    "creativeSpecs": ["Static", "06Sec", "10Sec", "15Sec", "30Sec", "1x1", "9x16", "16x9"],
    "creativeConcept": ["Anthem", "ProductFocus", "Lifestyle", "Promo", "UGC", "Testimonial"],
    "creativeVariation": ["Main", "Men", "Women", "CoGender", "Cutdown"]
  },
  "structures": {
    "campaign": "{country}/{budgetSource}/{campaignName}/{provider}/{objective}/{channel}/{funnel}",
    "adset": "{parentCampaign}/{audienceStrategy}/{audienceSegment}/{placement}",
    "ad": "{parentCampaignName}/{parentProvider}/{creativeFormat}/{creativeSpecs}/{creativeConcept}/{creativeVariation}"
  },
  "dependencies": {
    "campaign": [
      { 
        "field": "provider", 
        "value": ["Meta", "Meta Ads", "TikTok", "LinkedIn", "Pinterest", "Snapchat", "X"], 
        "filter": "channel", 
        "allow": ["Social Media", "Carrusel", "Video", "Imagen", "Story"] 
      },
      { "field": "provider", "value": ["Google Ads"], "filter": "channel", "allow": ["Paid Search", "Display", "Online Video"] },
      { "field": "provider", "value": ["Spotify"], "lock": "channel", "to": "Audio" }
    ],
    "adset": [
      { "field": "audienceStrategy", "value": ["DABA"], "lock": "audienceSegment", "to": "Broad" },
      { "field": "audienceStrategy", "value": ["Retargeting", "DPA"], "filter": "audienceSegment", "allow": ["SocialEngagers", "SiteVisitors", "AddToCart"] }
    ],
    "ad": [
      { "field": "creativeFormat", "value": ["SingleImage", "Carousel"], "filter": "creativeSpecs", "allow": ["Static", "1x1", "9x16", "16x9"] },
      { "field": "creativeFormat", "value": ["Video"], "filter": "creativeSpecs", "allow": ["06Sec", "15Sec", "30Sec", "60Sec", "1x1", "9x16"] }
    ]
  }
};
