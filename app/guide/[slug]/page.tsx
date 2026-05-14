import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Clock, Calendar, ChevronRight, BookOpen } from 'lucide-react'
import Navbar from '@/components/shared/Navbar'
import Footer from '@/components/shared/Footer'
import { articles, getArticle } from '@/lib/guides/articles'
import type { ContentBlock } from '@/lib/guides/articles'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return articles.map(a => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) return {}
  return {
    title: `${article.title} | Anleggstorget`,
    description: article.description,
    keywords: article.keywords,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
    },
  }
}

function Block({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'h2':
      return (
        <h2 id={block.id} style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 800, fontSize: 'clamp(20px, 3vw, 26px)',
          color: 'var(--t1)', letterSpacing: '0.02em',
          marginTop: 48, marginBottom: 16, scrollMarginTop: 100,
        }}>
          {block.text}
        </h2>
      )
    case 'h3':
      return (
        <h3 style={{
          fontFamily: 'Barlow Condensed, sans-serif',
          fontWeight: 700, fontSize: 18,
          color: 'var(--t1)', letterSpacing: '0.01em',
          marginTop: 28, marginBottom: 10,
        }}>
          {block.text}
        </h3>
      )
    case 'p':
      return (
        <p style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.8, marginBottom: 18 }}>
          {block.text}
        </p>
      )
    case 'ul':
      return (
        <ul style={{ paddingLeft: 20, marginBottom: 18 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.75, marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>
      )
    case 'ol':
      return (
        <ol style={{ paddingLeft: 20, marginBottom: 18 }}>
          {block.items.map((item, i) => (
            <li key={i} style={{ color: 'var(--t2)', fontSize: 15, lineHeight: 1.75, marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ol>
      )
    case 'callout':
      return (
        <div style={{
          background: 'rgba(200,149,58,0.07)',
          border: '1px solid rgba(200,149,58,0.25)',
          borderLeft: '3px solid var(--gold)',
          borderRadius: 4, padding: '16px 20px', marginBottom: 24,
        }}>
          <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.75, margin: 0 }}>
            {block.text}
          </p>
        </div>
      )
    case 'cta':
      return (
        <div style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 4, padding: '20px 24px',
          marginBottom: 24, marginTop: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 12,
        }}>
          <p style={{ color: 'var(--t2)', fontSize: 14, margin: 0, maxWidth: 480 }}>
            {block.text}
          </p>
          <Link href={block.href} className="btn-primary" style={{ fontSize: 12, padding: '9px 18px', flexShrink: 0 }}>
            {block.label} <ArrowRight size={12} />
          </Link>
        </div>
      )
    default:
      return null
  }
}

export default async function GuideArticlePage({ params }: Props) {
  const { slug } = await params
  const article = getArticle(slug)
  if (!article) notFound()

  const h2Blocks = article.content.filter(b => b.type === 'h2') as Extract<ContentBlock, { type: 'h2' }>[]
  const otherArticles = articles.filter(a => a.slug !== article.slug)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    author: { '@type': 'Organization', name: 'Anleggstorget' },
    publisher: { '@type': 'Organization', name: 'Anleggstorget', url: 'https://anleggstorget.no' },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `https://anleggstorget.no/guide/${article.slug}` },
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: article.faq.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <Navbar />
      <main style={{ minHeight: '100vh', background: 'var(--bg)', paddingTop: 80 }}>

        {/* Hero */}
        <section style={{
          background: 'var(--bg2)',
          borderBottom: '1px solid var(--border)',
          padding: '48px 0 40px',
        }}>
          <div className="container-main" style={{ maxWidth: 860 }}>
            <nav style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, fontSize: 12, color: 'var(--t3)' }}>
              <Link href="/" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Hjem</Link>
              <ChevronRight size={12} />
              <Link href="/guide" style={{ color: 'var(--t3)', textDecoration: 'none' }}>Guider</Link>
              <ChevronRight size={12} />
              <span style={{ color: 'var(--t2)' }}>{article.shortTitle}</span>
            </nav>
            <p style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 600, fontSize: 11,
              letterSpacing: '0.14em', textTransform: 'uppercase',
              color: 'var(--gold)', marginBottom: 12,
            }}>
              {article.category}
            </p>
            <h1 style={{
              fontFamily: 'Barlow Condensed, sans-serif',
              fontWeight: 800, fontSize: 'clamp(26px, 4vw, 44px)',
              color: 'var(--t1)', letterSpacing: '0.02em', lineHeight: 1.15,
              marginBottom: 20,
            }}>
              {article.title}
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--t3)', fontSize: 13 }}>
                <Clock size={13} /> {article.readingMinutes} minutters lesing
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--t3)', fontSize: 13 }}>
                <Calendar size={13} /> Oppdatert {new Date(article.updatedAt).toLocaleDateString('nb-NO', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>
        </section>

        {/* Content area */}
        <div className="container-main guide-layout" style={{ padding: '48px 0 80px' }}>

          {/* TOC sidebar */}
          {h2Blocks.length > 0 && (
            <aside className="guide-toc">
              <div style={{
                background: 'var(--bg2)',
                border: '1px solid var(--border)',
                borderRadius: 4, padding: '20px 20px 16px',
                position: 'sticky', top: 80,
              }}>
                <p style={{
                  fontFamily: 'Barlow Condensed, sans-serif',
                  fontWeight: 700, fontSize: 12,
                  letterSpacing: '0.1em', textTransform: 'uppercase',
                  color: 'var(--t3)', marginBottom: 12,
                }}>
                  Innhold
                </p>
                <nav>
                  {h2Blocks.map(block => (
                    <a key={block.id} href={`#${block.id}`} style={{
                      display: 'block',
                      color: 'var(--t2)', fontSize: 13, lineHeight: 1.5,
                      textDecoration: 'none', padding: '5px 0',
                      borderBottom: '1px solid var(--border)',
                      transition: 'color 0.15s',
                    }} className="toc-link">
                      {block.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}

          {/* Article body */}
          <article className="guide-body">
            {article.content.map((block, i) => (
              <Block key={i} block={block} />
            ))}

            {/* FAQ */}
            <section style={{ marginTop: 56 }}>
              <h2 style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 800, fontSize: 'clamp(20px, 3vw, 26px)',
                color: 'var(--t1)', letterSpacing: '0.02em', marginBottom: 24,
              }}>
                Ofte stilte spørsmål
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {article.faq.map(({ q, a }) => (
                  <div key={q} style={{
                    background: 'var(--bg2)', border: '1px solid var(--border)',
                    borderRadius: 4, padding: '18px 22px',
                  }}>
                    <h3 style={{
                      fontFamily: 'Barlow Condensed, sans-serif',
                      fontWeight: 700, fontSize: 15,
                      color: 'var(--t1)', marginBottom: 8, letterSpacing: '0.01em',
                    }}>
                      {q}
                    </h3>
                    <p style={{ color: 'var(--t2)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                      {a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </article>
        </div>

        {/* Related articles */}
        {otherArticles.length > 0 && (
          <section style={{
            background: 'var(--bg2)',
            borderTop: '1px solid var(--border)',
            padding: '48px 0',
          }}>
            <div className="container-main">
              <p style={{
                fontFamily: 'Barlow Condensed, sans-serif',
                fontWeight: 600, fontSize: 11,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'var(--t3)', marginBottom: 20,
              }}>
                Les også
              </p>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {otherArticles.map(a => (
                  <Link key={a.slug} href={`/guide/${a.slug}`} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'var(--bg3)', border: '1px solid var(--border)',
                    borderRadius: 3, padding: '10px 16px',
                    color: 'var(--t2)', fontSize: 13, textDecoration: 'none',
                    fontFamily: 'Barlow Condensed', fontWeight: 500,
                    transition: 'border-color 0.15s, color 0.15s',
                  }} className="related-link">
                    <BookOpen size={13} style={{ color: 'var(--gold)', flexShrink: 0 }} />
                    {a.shortTitle} <ArrowRight size={12} />
                  </Link>
                ))}
                <Link href="/guide" style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'var(--bg3)', border: '1px solid var(--border)',
                  borderRadius: 3, padding: '10px 16px',
                  color: 'var(--t2)', fontSize: 13, textDecoration: 'none',
                  fontFamily: 'Barlow Condensed', fontWeight: 500,
                  transition: 'border-color 0.15s, color 0.15s',
                }} className="related-link">
                  Alle guider <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </section>
        )}

      </main>
      <Footer />

      <style>{`
        .guide-layout {
          display: grid;
          grid-template-columns: 220px 1fr;
          gap: 48px;
          align-items: start;
          max-width: 1040px !important;
        }
        .guide-body { min-width: 0; }
        .guide-toc { display: block; }
        @media (max-width: 800px) {
          .guide-layout { grid-template-columns: 1fr; }
          .guide-toc { display: none; }
        }
        .toc-link:hover { color: var(--gold) !important; }
        .related-link:hover { border-color: rgba(200,149,58,0.4) !important; color: var(--gold) !important; }
        .guide-body h2 { border-top: 1px solid var(--border); padding-top: 40px; margin-top: 40px; }
        .guide-body h2:first-of-type { border-top: none; padding-top: 0; margin-top: 24px; }
      `}</style>
    </>
  )
}
