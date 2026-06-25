// After DB migration (ALTER TABLE listings ALTER COLUMN category TYPE TEXT),
// category is free text. Type accepts both new strings and legacy enum values.
export type Category =
  // New values (post-migration)
  | 'Gravemaskiner'
  | 'Hjullastere'
  | 'Dumpers'
  | 'Kompaktmaskiner'
  | 'Kraner og løft'
  | 'Annet'
  // Legacy enum values (pre-migration compatibility)
  | 'gravemaskin'
  | 'traktor'
  | 'hjullaster'
  | 'dumper'
  | 'kranbil'
  | 'skogsutstyr'
  | 'betong'
  | 'annet'
  | 'teleskoplaster'
  | 'kompaktlaster'
  | 'kompaktmaskin'
  | 'kran'
  | string // catch-all for any future values

export type PriceType = 'fast_price' | 'negotiable' | 'auction'

// listing_type requires DB migration:
// ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'teleskoplaster';
// ALTER TYPE listing_category ADD VALUE IF NOT EXISTS 'kompaktlaster';
// CREATE TYPE listing_type AS ENUM ('sale', 'rent', 'both');
// ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS listing_type listing_type NOT NULL DEFAULT 'sale';
export type ListingType = 'sale' | 'rent' | 'both'

export type ListingStatus = 'active' | 'sold' | 'reserved' | 'draft' | 'removed_by_sync'

export type InquiryStatus = 'new' | 'read' | 'replied'

export interface Profile {
  id: string
  company_name: string
  org_number: string
  contact_person: string | null
  phone: string | null
  bio?: string | null
  verified: boolean
  slug?: string | null
  created_at: string
}

export interface Review {
  id: string
  listing_id: string
  seller_id: string
  reviewer_id: string
  rating: number
  comment: string | null
  created_at: string
  profiles?: Profile
}

export interface Listing {
  id: string
  seller_id: string
  category: Category
  title: string
  description: string | null
  brand: string | null
  model: string | null
  year: number | null
  operating_hours: number | null
  weight_class: string | null
  price: number
  price_type: PriceType
  listing_type?: ListingType
  subcategory?: string | null
  price_ex_vat?: number | null
  price_inc_vat?: number | null
  vat_rate?: number | null
  location: string | null
  status: ListingStatus
  images: string[]
  featured: boolean
  views: number
  slug?: string | null
  favorites_count?: { count: number }[]
  sold_at?: string | null
  sold_price?: number | null
  created_at: string
  updated_at: string
  profiles?: Profile
}

export interface Favorite {
  id: string
  user_id: string
  listing_id: string
  created_at: string
  listings?: Listing
}

export interface Inquiry {
  id: string
  listing_id: string
  sender_id: string
  message: string
  phone: string | null
  email: string | null
  status: InquiryStatus
  created_at: string
  listings?: Listing
  profiles?: Profile
}

export type Database = {
  public: {
    PostgrestVersion?: '12'
    Tables: {
      profiles: {
        Row: Profile
        Insert: {
          id?: string
          company_name: string
          org_number: string
          contact_person?: string | null
          phone?: string | null
          bio?: string | null
          verified?: boolean
          created_at?: string
        }
        Update: {
          company_name?: string
          org_number?: string
          contact_person?: string | null
          phone?: string | null
          bio?: string | null
          verified?: boolean
        }
        Relationships: []
      }
      listings: {
        Row: Listing
        Insert: {
          id?: string
          seller_id: string
          category: Category
          title: string
          description?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          operating_hours?: number | null
          weight_class?: string | null
          price: number
          price_type?: PriceType
          location?: string | null
          status?: ListingStatus
          images?: string[]
          featured?: boolean
          views?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          category?: Category
          title?: string
          description?: string | null
          brand?: string | null
          model?: string | null
          year?: number | null
          operating_hours?: number | null
          weight_class?: string | null
          price?: number
          price_type?: PriceType
          location?: string | null
          status?: ListingStatus
          images?: string[]
          featured?: boolean
          views?: number
          sold_at?: string | null
          sold_price?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      favorites: {
        Row: Favorite
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: Record<string, never>
        Relationships: []
      }
      inquiries: {
        Row: Inquiry
        Insert: {
          id?: string
          listing_id: string
          sender_id: string
          message: string
          phone?: string | null
          email?: string | null
          status?: InquiryStatus
          created_at?: string
        }
        Update: {
          status?: InquiryStatus
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      increment_listing_views: {
        Args: { listing_id: string }
        Returns: void
      }
    }
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
