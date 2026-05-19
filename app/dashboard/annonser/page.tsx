'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { PlusSquare, Eye, Edit, Trash2, ExternalLink, CheckSquare, X } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, formatRelativeDate, CATEGORIES } from '@/lib/utils/format'
import type { Listing } from '@/lib/supabase/types'
import toast from 'react-hot-toast'

function MarkSoldModal({
  listing,
  onClose,
  onConfirm,
}: {
  listing: Listing
  onClose: () => void
  onConfirm: (soldPrice: number | null) => void
}) {
  const [soldPrice, setSoldPrice] = useState('')
  const [saving, setSaving] = useState(false)

  const handleConfirm = async () => {
    setSaving(true)
    await onConfirm(soldPrice ? Number(soldPrice) : null)
    setSaving(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border2)',
        borderRadius: 4, padding: '32px 28px',
        width: '100%', maxWidth: 400,
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 700, fontSize: 20,
            color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.02em',
          }}>
            Merk som solgt
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--t3)', padding: 4 }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ color: 'var(--t2)', fontSize: 14, marginBottom: 20, lineHeight: 1.5 }}>
          Markerer <strong style={{ color: 'var(--t1)' }}>{listing.title}</strong> som solgt og fjerner den fra aktive annonser.
        </p>

        <div style={{ marginBottom: 24 }}>
          <label style={{
            display: 'block', marginBottom: 6,
            fontFamily: 'Barlow Condensed, sans-serif',
            fontWeight: 600, fontSize: 11,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--t3)',
          }}>
            Solgt for (valgfritt)
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="number"
              value={soldPrice}
              onChange={e => setSoldPrice(e.target.value)}
              placeholder={`Listepris: ${formatPrice(listing.price)}`}
              className="input-base"
              min={0}
            />
          </div>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 4 }}>
            Prisen vises på selgerprofilen under "Nylig solgt"
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1, justifyContent: 'center', height: 42 }}>
            Avbryt
          </button>
          <button
            onClick={handleConfirm}
            disabled={saving}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', height: 42 }}
          >
            {saving ? 'Lagrer...' : '✓ Bekreft solgt'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function AnnonserPage() {
  const supabase = createClient()
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'draft' | 'sold'>('all')
  const [markSoldTarget, setMarkSoldTarget] = useState<Listing | null>(null)

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/logg-inn'; return }
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', session.user.id)
        .order('created_at', { ascending: false })
      setListings((data as Listing[]) || [])
      setLoading(false)
    }
    load()
  }, [])

  const deleteListing = async (id: string) => {
    if (!confirm('Er du sikker på at du vil slette denne annonsen?')) return
    const { error } = await supabase.from('listings').delete().eq('id', id)
    if (error) {
      toast.error('Kunne ikke slette annonsen')
    } else {
      setListings(prev => prev.filter(l => l.id !== id))
      toast.success('Annonse slettet')
    }
  }

  const markAsSold = async (id: string, soldPrice: number | null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any)
      .from('listings')
      .update({
        status: 'sold',
        sold_at: new Date().toISOString(),
        sold_price: soldPrice,
      })
      .eq('id', id)
    if (error) {
      toast.error('Feil ved oppdatering')
    } else {
      setListings(prev => prev.map(l =>
        l.id === id ? { ...l, status: 'sold' as Listing['status'], sold_at: new Date().toISOString(), sold_price: soldPrice } : l
      ))
      toast.success('Annonse merket som solgt')
    }
    setMarkSoldTarget(null)
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'draft' : 'active'
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('listings').update({ status: newStatus }).eq('id', id)
    if (error) {
      toast.error('Feil ved oppdatering')
    } else {
      setListings(prev => prev.map(l => l.id === id ? { ...l, status: newStatus as Listing['status'] } : l))
      toast.success(newStatus === 'active' ? 'Annonse publisert' : 'Annonse deaktivert')
    }
  }

  const filtered = filter === 'all' ? listings : listings.filter(l => l.status === filter)

  return (
    <div>
      {markSoldTarget && (
        <MarkSoldModal
          listing={markSoldTarget}
          onClose={() => setMarkSoldTarget(null)}
          onConfirm={(price) => markAsSold(markSoldTarget.id, price)}
        />
      )}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Barlow Condensed', fontWeight: 800, fontSize: 26, color: 'var(--t1)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
          Mine annonser
        </h1>
        <Link href="/ny-annonse" className="btn-primary" style={{ fontSize: 12 }}>
          <PlusSquare size={14} /> Ny annonse
        </Link>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, padding: 4, width: 'fit-content' }}>
        {(['all', 'active', 'draft', 'sold'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'var(--bg4)' : 'transparent',
              border: filter === f ? '1px solid var(--border2)' : '1px solid transparent',
              borderRadius: 3, padding: '6px 14px',
              fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 13,
              color: filter === f ? 'var(--t1)' : 'var(--t3)',
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? 'Alle' : f === 'active' ? 'Aktive' : f === 'draft' ? 'Kladder' : 'Solgte'}
            <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>
              {(f === 'all' ? listings : listings.filter(l => l.status === f)).length}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="card shimmer" style={{ height: 80 }} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4 }}>
          <p style={{ color: 'var(--t3)', fontSize: 14 }}>Ingen annonser i denne kategorien</p>
        </div>
      ) : (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 4, overflow: 'hidden' }}>
          {filtered.map((listing, i) => (
            <div key={listing.id} style={{
              display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px',
              borderBottom: i < filtered.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              {/* Thumbnail */}
              <div style={{
                width: 60, height: 44, borderRadius: 3, flexShrink: 0,
                background: 'var(--bg4)', border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {listing.images?.[0] ? (
                  <img src={listing.images[0]} alt={listing.title} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 16 }}>🏗️</span>
                )}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 15, color: 'var(--t1)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 3 }}>
                  {listing.title}
                </p>
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>{CATEGORIES[listing.category]?.label}</span>
                  <span style={{ fontSize: 12, color: 'var(--t3)' }}>{formatRelativeDate(listing.created_at)}</span>
                  <span style={{ fontSize: 12, color: 'var(--t3)', display: 'flex', alignItems: 'center', gap: 3 }}>
                    <Eye size={10} /> {listing.views} visninger
                  </span>
                </div>
              </div>

              <div className="price-display" style={{ fontSize: 15, flexShrink: 0 }}>{formatPrice(listing.price)}</div>

              {/* Status */}
              <div className={`tag ${listing.status === 'active' ? 'tag-green' : listing.status === 'sold' ? 'tag-muted' : 'tag-gold'}`} style={{ flexShrink: 0 }}>
                {listing.status === 'active' ? 'Aktiv' : listing.status === 'sold' ? 'Solgt' : listing.status === 'draft' ? 'Kladd' : 'Reservert'}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' }}>
                {/* Drafts: prominent Rediger + Publiser */}
                {listing.status === 'draft' && (
                  <>
                    <Link
                      href={`/ny-annonse?id=${listing.id}`}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'var(--bg3)', border: '1px solid var(--border)',
                        borderRadius: 3, padding: '0 12px', height: 32,
                        color: 'var(--t1)', textDecoration: 'none',
                        fontFamily: 'Barlow Condensed', fontWeight: 600, fontSize: 12,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}
                    >
                      <Edit size={11} /> Rediger
                    </Link>
                    <button
                      onClick={() => toggleStatus(listing.id, 'draft')}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'var(--gold)', border: 'none',
                        borderRadius: 3, padding: '0 12px', height: 32,
                        color: '#0d0c0a', cursor: 'pointer',
                        fontFamily: 'Barlow Condensed', fontWeight: 700, fontSize: 12,
                        letterSpacing: '0.04em', textTransform: 'uppercase',
                      }}
                    >
                      <CheckSquare size={11} /> Publiser
                    </button>
                  </>
                )}

                {/* Active/reserved/sold: view + mark-sold + toggle + delete */}
                {listing.status !== 'draft' && (
                  <Link href={`/annonse/${listing.slug || listing.id}`} title="Se annonse" style={{
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 3, width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--t2)', textDecoration: 'none',
                  }}>
                    <ExternalLink size={12} />
                  </Link>
                )}
                {listing.status === 'active' && (
                  <button
                    onClick={() => setMarkSoldTarget(listing)}
                    title="Merk som solgt"
                    style={{
                      background: 'var(--gold3)', border: '1px solid rgba(200,149,58,0.3)',
                      borderRadius: 3, width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--gold)', cursor: 'pointer',
                    }}
                  >
                    <CheckSquare size={12} />
                  </button>
                )}
                {listing.status === 'active' && (
                  <button
                    onClick={() => toggleStatus(listing.id, 'active')}
                    title="Deaktiver"
                    style={{
                      background: 'var(--bg3)', border: '1px solid var(--border)',
                      borderRadius: 3, width: 32, height: 32,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'var(--t2)', cursor: 'pointer',
                    }}
                  >
                    <Edit size={12} />
                  </button>
                )}
                <button
                  onClick={() => deleteListing(listing.id)}
                  title="Slett"
                  style={{
                    background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 3, width: 32, height: 32,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ef4444', cursor: 'pointer',
                  }}
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
