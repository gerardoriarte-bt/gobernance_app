
import { MasterSchema } from './types';

export const MEDIA_OWNERS = ['Buentipo', 'Hermano', 'LoBueno'] as const;


export const MASTER_SCHEMA: MasterSchema = {
  "config": { "separator": "/", "case": "PascalCase" },
  "dictionaries": {
    "Country": ["Mexico", "Colombia", "Brazil", "Chile", "Peru"],
    "BudgetSource": ["Brand", "Performance", "Ecommerce"],
    "CampaignName": ["SS22GiftOfTheGame", "SS23Curry10", "FW24BlackDays", "AlwaysOn"],
    "Platform": ["Meta", "Meta Ads", "Google Ads", "TikTok", "YouTube", "DV360", "Spotify", "Amazon Ads", "LinkedIn", "Pinterest", "Snapchat", "X"],
    "Objective": ["Reach", "VideoViews", "Traffic", "Conversions", "CatalogSales", "AppInstalls"],
    "Channel": ["Social Media", "Carrusel", "Video", "Imagen", "Story", "Paid Search", "Display", "Online Video", "Connected TV", "Influencer", "Programmatic", "Audio", "Native", "Affiliate"],
    "FunnelStage": ["Attract", "Consider", "Convert"],
    "Audience": ["Prospecting", "Retargeting", "Retention", "DABA", "DPA"],
    "AudienceSegment": ["Broad", "Affinity", "InMarket", "LAL1to3", "SocialEngagers", "SiteVisitors", "AddToCart"],
    "Placement": ["Auto", "Feeds", "StoriesReels", "RightColumn"],
    "CreativeFormat": ["Video", "SingleImage", "Carousel", "Collection", "RichMedia"],
    "CreativeSpecs": ["Static", "06Sec", "10Sec", "15Sec", "30Sec", "1x1", "9x16", "16x9"],
    "CreativeConcept": ["Anthem", "ProductFocus", "Lifestyle", "Promo", "UGC", "Testimonial"],
    "CreativeVariation": ["Main", "Men", "Women", "CoGender", "Cutdown"]
  },
  "structures": {
    "campaign": "{Country}/{BudgetSource}/{CampaignName}/{Platform}/{Objective}/{Channel}/{FunnelStage}",
    "adset": "{parentCampaign}/{Audience}/{AudienceSegment}/{Placement}",
    "ad": "{parentCampaignName}/{parentPlatform}/{CreativeFormat}/{CreativeSpecs}/{CreativeConcept}/{CreativeVariation}"
  },
  "dependencies": {
    "campaign": [
      { 
        "field": "Platform", 
        "value": ["Meta", "Meta Ads", "TikTok", "LinkedIn", "Pinterest", "Snapchat", "X"], 
        "filter": "Channel", 
        "allow": ["Social Media", "Carrusel", "Video", "Imagen", "Story"] 
      },
      { "field": "Platform", "value": ["Google Ads"], "filter": "Channel", "allow": ["Paid Search", "Display", "Online Video"] },
      { "field": "Platform", "value": ["Spotify"], "lock": "Channel", "to": "Audio" }
    ],
    "adset": [
      { "field": "Audience", "value": ["DABA"], "lock": "AudienceSegment", "to": "Broad" },
      { "field": "Audience", "value": ["Retargeting", "DPA"], "filter": "AudienceSegment", "allow": ["SocialEngagers", "SiteVisitors", "AddToCart"] }
    ],
    "ad": [
      { "field": "CreativeFormat", "value": ["SingleImage", "Carousel"], "filter": "CreativeSpecs", "allow": ["Static", "1x1", "9x16", "16x9"] },
      { "field": "CreativeFormat", "value": ["Video"], "filter": "CreativeSpecs", "allow": ["06Sec", "15Sec", "30Sec", "60Sec", "1x1", "9x16"] }
    ]
  }
};
