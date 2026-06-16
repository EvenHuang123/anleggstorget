'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusSquare, Eye, MessageSquare, Heart, TrendingUp, Shield, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatRelativeDate, CATEGORIES } from '@/lib/utils/format'
import type { Listing, Inquiry } from '@/lib/supabase/types'

export default function DashboardPage() {
  const supabase = createClient()
  const [profile, setProfile] = useState<{ company_name: string; verified: boolean; org_number: string } | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [inquiries, setInquiries] = useState<Inquiry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/logg-inn'; return }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sb = supabase as any
      // Resolve profile.id via user_id (scraped sellers have profile.id ≠ auth user id)
      const { data: profileData } = await sb
        .from('profiles')
        .select('id, company_name, verified, org_number')
        .eq('user_id', session.user.id)
        .single()
      const sellerId: string = profileData?.id ?? session.user.id

      const { data: listingsData } = await sb.from('listings').select('*').eq('seller_id', sellerId).order('created_at', { ascending: false }).limit(5)
      const { data: inquiriesData } = await sb.from('inquiries').select('*, listings(title)').in('listing_id', (listingsData as Listing[] | null)?.map((l: Listing) => l.id) || []).order('created_at', { ascending: false }).limit(5)

      setProfile(profileData)
      setListings((listingsData as Listing[]) || [])
      setInquiries((inquiriesData as Inquiry[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const activeListings = listings.filter(l => l.status === 'active').length
  const totalViews = listings.reduce((sum, l) => sum + l.views, 0)
  const newInquiries = inquiries.filter(i => i.status === 'new').length

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card shimmer" style={{ height: 100 }} />)}
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: 36 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
            {profile?.company_name || 'Min side'}
          </h1>
          {profile?.verified && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)', borderRadius: 20, padding: '3px 10px' }}>
              <Shield size={11} style={{ color: 'var(--gold)' }} />
              <span style={{ fontSize: 11, color: 'var(--gold)', fontFamily: 'Barlow Condensed', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Verifisert</span>
            </div>
          )}
        </div>
        <p style={{ color: 'var(--t3)', fontSize: 13 }}>Org.nr: {profile?.org_number || '—'}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 36 }} className="dash-stats">
        {[
          { icon: TrendingUp, value: activeListings, label: 'Aktive annonser', color: 'var(--gold)' },
          { icon: Eye, value: totalViews, label: 'Totale visninger', color: '#60a5fa' },
          { icon: MessageSquare, value: newInquiries, label: 'Nye forespørsler', color: '#4ade80' },
          { icon: Heart, value: 0, label: 'Favoritter mottatt', color: '#f472b6' },
        ].map(({ icon: Icon, value, label, color }) => (
          <div key={label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <Icon size={15} style={{ color }} />
              <span style={{ fontSize: 12, color: 'var(--t3)', fontFamily: 'Barlow Condensed', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</span>
            </div>
            <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 28, color: 'var(--t1)' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={{ marginBottom: 36 }}>
        <Link href="/ny-annonse" className="btn-primary" style={{ marginRight: 12 }}>
          <PlusSquare size={15} /> Legg ut ny annonse
        </Link>
        <Link href="/dashboard/annonser" className="btn-secondary">
          Se alle annonser <ChevronRight size={14} />
        </Link>
      </div>

      {/* Recent listings */}
      {listings.length > 0 && (
        <div style={{ marginBottom: 36 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Mine annonser
            </h2>
            <Link href="/dashboard/annonser" style={{ fontSize: 12, color: 'var(--gold)', textDecoration: 'none' }}>Se alle →</Link>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {listings.map((listing, i) => (
              <div key={listing.id} style={{
                display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px',
                borderBottom: i < listings.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 15, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                    {listing.title}
                  </p>
                  <p style={{ fontSize: 12, color: 'var(--t3)' }}>
                    {CATEGORIES[listing.category]?.label} · {formatRelativeDate(listing.created_at)}
                  </p>
                </div>
                <div className="price-display" style={{ fontSize: 15, flexShrink: 0 }}>{formatPrice(listing.price)}</div>
                <div className={`tag ${listing.status === 'active' ? 'tag-green' : listing.status === 'sold' ? 'tag-muted' : 'tag-gold'}`} style={{ flexShrink: 0 }}>
                  {listing.status === 'active' ? 'Aktiv' : listing.status === 'sold' ? 'Solgt' : listing.status === 'draft' ? 'Kladd' : 'Reservert'}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--t3)', fontSize: 12, flexShrink: 0 }}>
                  <Eye size={11} /> {listing.views}
                </div>
                <Link href={`/annonse/${listing.slug || listing.id}`} style={{ color: 'var(--t3)', flexShrink: 0 }}>
                  <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent inquiries */}
      {inquiries.length > 0 && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <h2 style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 18, color: 'var(--t1)', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
              Siste forespørsler
            </h2>
          </div>
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
            {inquiries.map((inquiry, i) => (
              <div key={inquiry.id} style={{
                padding: '14px 18px',
                borderBottom: i < inquiries.length - 1 ? '1px solid var(--border)' : 'none',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 13, color: 'var(--t1)' }}>
                    {(inquiry.listings as unknown as Listing)?.title || 'Ukjent annonse'}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {inquiry.status === 'new' && <div className="tag tag-green">Ny</div>}
                    <span style={{ fontSize: 11, color: 'var(--t3)' }}>{formatRelativeDate(inquiry.created_at)}</span>
                  </div>
                </div>
                <p style={{ color: 'var(--t2)', fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {inquiry.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {listings.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 20, color: 'var(--t1)', marginBottom: 8 }}>
            Ingen annonser ennå
          </p>
          <p style={{ color: 'var(--t3)', fontSize: 14, marginBottom: 24 }}>
            Legg ut din første maskin til salgs nå
          </p>
          <Link href="/ny-annonse" className="btn-primary">
            <PlusSquare size={15} /> Legg ut annonse
          </Link>
        </div>
      )}

      <style>{`
        .dash-stats { grid-template-columns: repeat(4,1fr) !important; }
        @media (max-width: 900px) { .dash-stats { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 560px) { .dash-stats { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  )
}
