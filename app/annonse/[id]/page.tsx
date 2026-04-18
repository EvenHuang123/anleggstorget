/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import AnnonseContent from './AnnonseContent'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data } = await (supabase as any)
      .from('listings')
      .select('title, description, brand, year, price')
      .eq('id', id)
      .single() as { data: { title: string; description: string | null; brand: string | null; year: number | null; price: number } | null }

    if (!data) return { title: 'Annonse ikke funnet' }

    return {
      title: data.title,
      description: data.description || `${data.brand || ''} ${data.year || ''} – ${data.price.toLocaleString('nb-NO')} kr`,
    }
  } catch {
    return { title: 'Maskin til salgs' }
  }
}

export default async function AnnonsePage({ params }: Props) {
  const { id } = await params

  return (
    <>
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 64 }}>
        <AnnonseContent id={id} />
      </main>
      <Footer />
    </>
  )
}
