export interface ProductOption {
  id: string;
  name: string;
  priceMultiplier?: number;
  priceAdd?: number;
  description?: string;
}

export interface ProductConfigSchema {
  sizes: ProductOption[];
  materials: ProductOption[];
  finishes: ProductOption[];
  sides: ProductOption[];
  quantities: {
    qty: number;
    unitPrice?: number;
    popular?: boolean;
    discountPercent?: number;
    label?: string;
  }[];
}

export type ProductCategory = 
  | 'paper-documents'
  | 'cards-invitations'
  | 'custom-promotional'
  | 'signage-vinyl'
  | 'finishing-binding'
  | 'business-cards' 
  | 'standees-banners' 
  | 'apparel' 
  | 'photo-gifts' 
  | 'stamps-seals' 
  | 'stationery' 
  | 'packaging' 
  | 'invitation-cards'
  | 'id-cards'
  | 'binding-prints'
  | 'all'
  | string;

export interface ProductItem {
  id: string;
  slug: string;
  title: string;
  category: ProductCategory;
  categoryLabel: string;
  shortDescription: string;
  detailedDescription: string;
  rating: number;
  reviewCount: number;
  dispatchTag: string;
  minPrice?: number;
  badge?: string;
  subtitle?: string;
  featureBadge?: string;
  images: {
    url: string;
    alt: string;
    caption: string;
  }[];
  specs: {
    label: string;
    value: string;
  }[];
  config: ProductConfigSchema;
}

export interface SelectedConfig {
  sizeId: string;
  materialId: string;
  finishId: string;
  sideId: string;
  quantity: number;
  customNotes?: string;
  hasArtwork: boolean;
}

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  config: SelectedConfig;
  sizeLabel: string;
  materialLabel: string;
  finishLabel: string;
  sideLabel: string;
  imageUrl: string;
}

export interface FaqItem {
  id: string;
  category: 'artwork' | 'ordering' | 'delivery' | 'corporate';
  question: string;
  answer: string;
}
