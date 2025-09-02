import React, {useEffect, useState} from 'react'
import {toHTML} from '@portabletext/to-html'
import {createClient} from '@sanity/client'

interface PostPreviewPaneProps {
  document: any
}

export function PostPreviewPane({document}: PostPreviewPaneProps) {
  const [resolvedDocument, setResolvedDocument] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Debug the document structure
  console.log('PostPreviewPane received document:', document)
  console.log('Document structure:', {
    hasDocument: !!document,
    hasId: !!document?._id,
    hasDraft: !!document?.draft,
    hasPublished: !!document?.published,
    draftId: document?.draft?._id,
    publishedId: document?.published?._id,
  })

  // Log the full document structure for debugging
  console.log('Full document structure:', JSON.stringify(document, null, 2))

  // Extract the document ID, handling both draft and published states
  const docId = document?._id || document?.draft?._id || document?.published?._id

  // For draft documents, we need to strip the "draft." prefix to get the base document ID
  const baseDocId = docId?.startsWith('draft.') ? docId.replace('draft.', '') : docId

  console.log('DocId:', docId)
  console.log('Base DocId (for query):', baseDocId)
  useEffect(() => {
    async function resolveDocument() {
      if (!baseDocId) {
        console.log('No base document ID found:', {
          docId,
          baseDocId,
          document,
          draft: document?.draft,
          published: document?.published,
        })
        setLoading(false)
        return
      }

      console.log('Using base document ID for query:', baseDocId)

      try {
        // Create a Sanity client to resolve references
        // useCdn: false + perspective: 'raw' ensures we get real-time data including draft documents
        const client = createClient({
          projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'your-project-id',
          dataset: process.env.SANITY_STUDIO_DATASET || 'production',
          token: process.env.SANITY_STUDIO_TOKEN,
          apiVersion: '2025-08-27',
          useCdn: false, // Use real-time data for preview
          perspective: 'raw', // Get raw data including drafts and versions
        })

        // Fetch the full document with all references resolved using GROQ
        // For draft documents, we need to query both the draft and published versions
        const query = `*[_id == $id][0]{
          _id,
          _type,
          title,
          status,
          body[]{
            _type,
            _key,
            // Handle image blocks
            _type == "image" => {
              asset->{
                url,
                metadata
              },
              alt
            },
            // Handle product blocks
            _type == "products" => {
              _type,
              products[]->{
                _type,
                ...,
                store
              }
            },
            // Handle text blocks
            _type == "block" => {
              ...,
              children[]{
                ...,
                // Resolve any marks that might have references
                _type == "span" => {
                  ...,
                  markDefs[]{
                    ...,
                    _type == "link" => {
                      ...,
                      internalLink->{
                        _id,
                        _type,
                        title,
                        slug
                      }
                    }
                  }
                }
              }
            }
          }
        }`

        console.log('Querying with baseDocId:', baseDocId)
        console.log('Query:', query)

        const fullDocument = await client.fetch(query, {id: baseDocId})
        console.log('Full document:', fullDocument)
        setResolvedDocument(fullDocument)
      } catch (error) {
        console.error('Error resolving document:', error)
      } finally {
        setLoading(false)
      }
    }

    resolveDocument()
  }, [baseDocId])

  console.log('Resolved document:', resolvedDocument)

  if (loading) {
    return (
      <div style={{padding: '20px', textAlign: 'center', color: '#6b7280'}}>Loading preview...</div>
    )
  }

  if (!baseDocId) {
    return (
      <div style={{padding: '20px', textAlign: 'center', color: '#6b7280'}}>
        <div style={{fontSize: '18px', marginBottom: '8px'}}>Unable to preview</div>
        <div style={{fontSize: '14px'}}>
          No base document ID found. This might be a draft document.
        </div>
        <div
          style={{
            fontSize: '12px',
            marginTop: '12px',
            padding: '12px',
            backgroundColor: '#f3f4f6',
            borderRadius: '6px',
          }}
        >
          <strong>Debug info:</strong>
          <br />
          DocId: {docId}
          <br />
          Base DocId: {baseDocId}
          <br />
          Document: {JSON.stringify(document, null, 2)}
        </div>
      </div>
    )
  }

  if (!resolvedDocument) {
    return (
      <div style={{padding: '20px', textAlign: 'center', color: '#6b7280'}}>
        <div style={{fontSize: '18px', marginBottom: '8px'}}>Loading document...</div>
        <div style={{fontSize: '14px'}}>Document ID: {docId}</div>
      </div>
    )
  }

  const {title, body: bodyContent, status} = resolvedDocument

  console.log('Resolved document:', resolvedDocument)
  console.log('Body content:', bodyContent)

  // Extract and flatten all products from the body
  const products = bodyContent
    ?.filter((block: any) => block._type === 'products')
    .map((block: any) => block.products || [])
    .flat()
    .filter(Boolean)

  return (
    <div style={{padding: '20px', maxWidth: '800px', margin: '0 auto'}}>
      {bodyContent && bodyContent.length > 0 ? (
        <>
          <style
            dangerouslySetInnerHTML={{
              __html: `
body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6}.email-container{max-width:600px;margin:0 auto;background-color:#fff}.header{text-align:center;padding:48px 24px}.logo{font-size:24px;font-weight:700;color:#d97706;letter-spacing:2px;margin-bottom:4px}.logo-subtitle{font-size:12px;color:#6b7280;letter-spacing:3px;margin-bottom:32px}.main-headline{font-size:32px;font-weight:300;color:#111827;margin-bottom:16px;line-height:1.2}.main-description{font-size:16px;color:#6b7280;line-height:1.6;max-width:400px;margin:0 auto}.product-section{padding:0 24px}.product-card{margin-bottom:32px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}.product-image{width:100%;height:320px;object-fit:contain;display:block}.product-badge{position:absolute;top:16px;left:16px;background-color:#ec4899;color:#fff;padding:4px 12px;font-size:12px;font-weight:500;border-radius:20px}.product-info{padding:24px;background-color:#fff}.product-name{font-size:20px;font-weight:500;color:#111827;margin-bottom:8px}.product-pricing{margin-bottom:16px}.product-price{font-size:20px;font-weight:300;color:#d97706;margin-right:12px}.product-original-price{font-size:16px;color:#6b7280;text-decoration:line-through}.btn{display:inline-block;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:500;text-align:center;width:100%;box-sizing:border-box}.btn-primary{background-color:#d97706;color:#fff}.btn-outline{background-color:transparent;color:#d97706;border:2px solid #d97706}.btn-secondary{background-color:#ec4899;color:#fff}.collection-cta{padding:48px 24px}.collection-card{background-color:#f9fafb;padding:32px;border-radius:8px;text-align:center}.collection-title{font-size:24px;font-weight:300;color:#111827;margin-bottom:12px}.collection-description{color:#6b7280;margin-bottom:24px;line-height:1.6}.experience-cta{padding:0 24px 48px;text-align:center}.experience-title{font-size:24px;font-weight:300;color:#111827;margin-bottom:12px}.experience-description{color:#6b7280;margin-bottom:24px;line-height:1.6;max-width:400px;margin:0 auto}.footer{padding:32px 24px;border-top:1px solid #e5e7eb;text-align:center}.footer-links{margin-bottom:16px}.footer-link{color:#6b7280;text-decoration:none;margin:0 12px}.footer-text{font-size:12px;color:#6b7280;margin-bottom:8px}.footer-link:hover{color:#ec4899}@media only screen and (max-width:600px){.main-headline{font-size:28px}.product-section{padding:0 16px}.collection-cta,.experience-cta{padding-left:16px;padding-right:16px}};
`,
            }}
          />
          <div className="email-container">
            <div className="header">
              <div className="logo">SANITY</div>
              <div className="logo-subtitle">Squiggle Mart</div>
              <div
                dangerouslySetInnerHTML={{
                  __html: toHTML(bodyContent || [], {
                    components: {
                      types: {
                        image: ({value}) => {
                          if (!value?.asset?.url) return ''
                          return `<img src="${value.asset.url}" alt="${value.alt || ''}" style="max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px;" />`
                        },
                        products: ({value}) => {
                          console.log('Products block value:', value)
                          if (!value?.products || !Array.isArray(value.products)) return ''
                          console.log('Products:', value.products)
                          return `
                             <div class="product-section">
                               ${value.products
                                 .map(
                                   (product: any) => `
                                     <div class="product-card">
                                       <div style="position: relative;">
                                         <img src="${product.store.previewImageUrl || ''}" alt="${product.title || 'Product'}" class="product-image">
                                         ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
                                       </div>
                                       <div class="product-info">
                                         <h3 class="product-name">${product.store.title || 'Untitled Product'}</h3>
                                         <div class="product-pricing">
                                           <span class="">$${product.store?.priceRange?.minVariantPrice}</span>
                                         </div>
                                         <a href="https://squigglemart.com/products/${product.slug || '#'}" class="btn btn-primary">Shop Now</a>
                                       </div>
                                     </div>
                                   `,
                                 )
                                 .join('')}
                             </div>`
                        },
                      },
                      marks: {
                        strong: ({children}) => `<strong>${children}</strong>`,
                        em: ({children}) => `<em>${children}</em>`,
                        underline: ({children}) => `<u>${children}</u>`,
                      },
                      block: {
                        h1: ({children}) =>
                          `<h1 style="font-size: 24px; margin: 24px 0;">${children}</h1>`,
                        h2: ({children}) =>
                          `<h2 style="font-size: 20px; margin: 20px 0;">${children}</h2>`,
                        h3: ({children}) =>
                          `<h3 style="font-size: 18px; margin: 18px 0;">${children}</h3>`,
                        normal: ({children}) =>
                          `<p style="font-size: 16px; line-height: 1.6; margin: 16px 0;">${children}</p>`,
                        blockquote: ({children}) =>
                          `<blockquote style="font-style: italic; margin: 20px 0; padding-left: 20px; border-left: 4px solid #ccc;">${children}</blockquote>`,
                      },
                    },
                  }),
                }}
              />
            </div>

            <div className="collection-cta">
              <div className="collection-card">
                <h3 className="collection-title">Explore the Complete Collection'</h3>
                <p className="collection-description">
                  Show your love for Squiggle Mart with this limited edition collection.
                </p>
                <a href="https://squigglemart.com/collections/all" className="btn btn-outline">
                  View All Items
                </a>
              </div>
            </div>

            <div className="footer">
              <div className="footer-links">
                <a href="https://www.instagram.com/squigglemart" className="footer-link">
                  Instagram
                </a>
                <a href="https://www.pinterest.com/squigglemart" className="footer-link">
                  Pinterest
                </a>
                <a href="https://www.facebook.com/squigglemart" className="footer-link">
                  Facebook
                </a>
              </div>
              <p className="footer-text">
                © ${new Date().getFullYear()} Sanity. All rights reserved.
              </p>
              <p className="footer-text">
                You're receiving this because you subscribed to our newsletter.
                <a href="https://squigglemart.com/unsubscribe" className="footer-link">
                  Unsubscribe
                </a>
              </p>
            </div>
          </div>
        </>
      ) : (
        <div
          style={{
            padding: '40px',
            textAlign: 'center',
            color: '#6b7280',
            backgroundColor: '#f9fafb',
            borderRadius: '8px',
            border: '2px dashed #d1d5db',
          }}
        >
          <div style={{fontSize: '18px', marginBottom: '8px'}}>No content yet</div>
          <div style={{fontSize: '14px'}}>
            Add some content to the body field to see a preview here
          </div>
        </div>
      )}
    </div>
  )
}
