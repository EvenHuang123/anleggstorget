export type Category =
  | 'gravemaskin'
  | 'traktor'
  | 'hjullaster'
  | 'dumper'
  | 'kranbil'
  | 'skogsutstyr'
  | 'betong'
  | 'annet'

export type PriceType = 'fast_price' | 'negotiable' | 'auction'

export type ListingStatus = 'active' | 'sold' | 'reserved' | 'draft'

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
