import { documentEventHandler, type DocumentEvent } from '@sanity/functions'
import { createClient } from '@sanity/client'
import { toHTML } from '@portabletext/to-html'

interface PostDocument {
  _id: string;
  _type: string;
  title?: string;
  slug?: {
    current: string;
  };
  body?: any[];
  marketingCampaign?: {
    _ref: string;
  };
  klaviyoListId?: string;
}

interface KlaviyoCampaignResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      status: string;
    };
  };
}

interface KlaviyoTemplateResponse {
  data: {
    id: string;
    type: string;
    attributes: {
      name: string;
      html: string;
      text: string;
    };
  };
}

export const handler = documentEventHandler(async ({ context, event}: { context: any, event: DocumentEvent<PostDocument> }) => {
  console.log('👋 Marketing Campaign Function called at', new Date().toISOString())
  console.log('👋 Event:', event)


  
  try {
    const { _id, _type, title, slug, klaviyoListId, marketingCampaign } = event.data as PostDocument
   // Get Klaviyo API credentials from environment
   const klaviyoApiKey = process.env.KLAVIYO_API_KEY
   const localKlaviyoListId = klaviyoListId || process.env.KLAVIYO_LIST_ID

   if (!klaviyoApiKey) {
     console.error('❌ KLAVIYO_API_KEY not found in environment variables')
     return
   }

   if (!localKlaviyoListId) {
     console.error('❌ KLAVIYO_LIST_ID not found in environment variables')
     return
   }
    if (_type !== 'post') {
      console.log('⏭️ Skipping non-post document:', _type)
      return
    }
    
    const client = createClient({
      ...context.clientOptions,
      dataset: 'production',
      apiVersion: '2025-06-01',
    })

    // Check if post already has a marketing campaign
    if (marketingCampaign?._ref) {
      console.log('ℹ️ Post already has marketing campaign:', marketingCampaign._ref, '- skipping')
      // if we already have a marketing campaign, grab the templateId from the marekting campaign and update the html of the template with a patch
      const marketingCampaignId = marketingCampaign._ref
      const marketingCampaignDocument = await client.getDocument(marketingCampaignId)

      const templateId = marketingCampaignDocument?.data.templateId

      const htmlContent = await generateEmailTemplate(title, slug?.current, event.data.body)
      const textContent = generateTextContent(title, slug?.current)

      const updatedTemplateData = {
        data: {
          type: 'template',
          attributes: {
            html: htmlContent,
            text: textContent
          }
        }
      }
      const updatedTemplateResponse = await fetch(`https://a.klaviyo.com/api/templates/${templateId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'accept': 'application/vnd.api+json',
          'revision': '2025-07-15'
        },
        body: JSON.stringify(updatedTemplateData)
      })
      if (!updatedTemplateResponse.ok) {
        console.error('❌ Failed to update Klaviyo template:', updatedTemplateResponse.status, updatedTemplateResponse.statusText)
        return
      }
      console.log('✅ Updated Klaviyo template:', templateId)

      return
    }

    console.log('📝 Processing post for marketing campaign:', _id, 'Title:', title)

 

   

    try {
      // Create Klaviyo template
      console.log('🎨 Creating Klaviyo template for post:', title)
      
      if (!title || title.trim().length === 0) {
        console.error('❌ Post title is required for template creation')
        return
      }

      // Lets fetch nested data in the body for html rendering:
      const {body: bodyData} = await client.fetch(`*[_id == "${_id}"][0]{
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
      }`)

      console.log('📋 Body data:', bodyData)
      
      // Generate email templates
      const htmlContent = await generateEmailTemplate(title, slug?.current, bodyData)
      const textContent = generateTextContent(title, slug?.current)
      
      const templateData = {
        data: {
          type: 'template',
          attributes: {
            name: `${title} - Template`,
            editor_type: 'CODE',
            html: htmlContent,
            text: textContent
          }
        }
      }

      console.log('📋 Template data:', {
        name: templateData.data.attributes.name,
        html_length: templateData.data.attributes.html.length,
        text_length: templateData.data.attributes.text.length
      })

      const templateResponse = await fetch('https://a.klaviyo.com/api/templates', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'accept': 'application/vnd.api+json',
          'revision': '2025-07-15'
        },
        body: JSON.stringify(templateData)
      })

      if (!templateResponse.ok) {
        const errorText = await templateResponse.text()
        console.error('❌ Failed to create Klaviyo template:', templateResponse.status, errorText)
        
        // Handle specific error cases
        if (templateResponse.status === 429) {
          console.error('❌ Rate limit exceeded. Klaviyo allows 10/s burst, 150/m steady')
        } else if (templateResponse.status === 400) {
          console.error('❌ Bad request. Check template data format')
        } else if (templateResponse.status === 403) {
          console.error('❌ Forbidden. Check API key permissions (templates:write scope required)')
        }
        return
      }

      const template: KlaviyoTemplateResponse = await templateResponse.json()
      console.log('✅ Created Klaviyo template:', template.data.id, 'Name:', template.data.attributes.name)

      // Create Klaviyo campaign
      console.log('📢 Creating Klaviyo campaign for post:', title)
      const campaignData = {
        data: {
          type: 'campaign',
          attributes: {
            name: `${title} - Campaign`,
            audiences: {
              "included": [localKlaviyoListId]
            },
            "send_strategy": {
              "method": "immediate"
            },
            "send_options": {
              "use_smart_sending": true
            },
            "tracking_options": {
              "add_tracking_params": true,
              "custom_tracking_params": [
                {
                  "type": "dynamic",
                  "value": "campaign_id", 
                  "name": "utm_medium"
                },
                {
                  "type": "static",
                  "value": "email",
                  "name": "utm_source"
                }
              ],
              "is_tracking_clicks": true,
              "is_tracking_opens": true
            },

          "campaign-messages": {
            "data": [
              {
                "type": "campaign-message",
                "attributes": {
                  "definition": {
                    "channel": "email",
                    "label": "My message name",
                    "content": {
                      "subject": title,
                      "preview_text": "My preview text",
                      "from_email": process.env.KLAVIYO_FROM_EMAIL || 'noreply@yourdomain.com',
                      "from_label": "My Company",
                      "reply_to_email": process.env.KLAVIYO_REPLY_TO_EMAIL || 'reply-to@yourdomain.com',
                      "cc_email": process.env.KLAVIYO_CC_EMAIL || 'cc@yourdomain.com',
                      "bcc_email": process.env.KLAVIYO_BCC_EMAIL || 'bcc@yourdomain.com'
                    }
                  }
                }
              }
            ]
          }
          }
        }
      }

      console.log('📋 Campaign data:', {
        name: campaignData.data.attributes.name,
        subject: campaignData.data.attributes.subject,
        from_email: campaignData.data.attributes.from_email,
        list_id: localKlaviyoListId,
        template_id: template.data.id
      })

      const campaignResponse = await fetch('https://a.klaviyo.com/api/campaigns', {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'accept': 'application/vnd.api+json',
          'revision': '2025-07-15'
        },
        body: JSON.stringify(campaignData)
      })

      if (!campaignResponse.ok) {
        const errorText = await campaignResponse.text()
        console.error('❌ Failed to create Klaviyo campaign:', campaignResponse.status, errorText)
        
        // Handle specific error cases
        if (campaignResponse.status === 429) {
          console.error('❌ Rate limit exceeded. Klaviyo allows 10/s burst, 150/m steady')
        } else if (campaignResponse.status === 400) {
          console.error('❌ Bad request. Check campaign data format and required fields')
        } else if (campaignResponse.status === 403) {
          console.error('❌ Forbidden. Check API key permissions (campaigns:write scope required)')
        } else if (campaignResponse.status === 422) {
          console.error('❌ Unprocessable entity. Check relationships (list, template) exist and are valid')
        }
        return
      }

      const campaign: KlaviyoCampaignResponse = await campaignResponse.json()
      console.log('✅ Created Klaviyo campaign:', campaign.data.id, 'Name:', campaign.data.attributes.name)

      // Assign template to campaign message
      console.log('📎 Assigning template to campaign message...')
      // Wait a moment for the campaign to be fully created before assigning template
      await new Promise(resolve => setTimeout(resolve, 2000));

      const campaignMessageId = campaign.data.relationships['campaign-messages'].data[0].id
      
      const assignTemplateResponse = await fetch(`https://a.klaviyo.com/api/campaign-message-assign-template`, {
        method: 'POST',
        headers: {
          'Authorization': `Klaviyo-API-Key ${klaviyoApiKey}`,
          'Content-Type': 'application/json',
          'accept': 'application/vnd.api+json',
          'revision': '2025-07-15'
        },
        body: JSON.stringify({
          data: {
            type: "campaign-message",
            id: campaignMessageId,
            "relationships": {
              "template": {
                "data": {
                  "type": "template",
                  "id": template.data.id
                }
              }
            }
          }
        })
      })

      if (!assignTemplateResponse.ok) {
        const errorText = await assignTemplateResponse.text()
        console.error('❌ Failed to assign template to campaign:', assignTemplateResponse.status, errorText)
        throw new Error(`Failed to assign template: ${errorText}`)
      }

      console.log('✅ Template assigned successfully to campaign message')

      // Create marketingCampaign document in Sanity
      console.log('💾 Creating marketingCampaign document in Sanity')
      const marketingCampaignId = `marketingCampaign-${_id}`
      
      try {
        const newMarketingCampaign = await client.create({
          _id: marketingCampaignId,
          _type: 'marketingCampaign',
          title: `${title} - Marketing Campaign`,
          klaviyoCampaignId: campaign.data.id,
          klaviyoTemplateId: template.data.id,
          status: 'draft',
          post: { _ref: _id, _type: 'reference' },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          description: `Marketing campaign for post: ${title}`
        })

        console.log('✅ Created marketingCampaign document:', newMarketingCampaign._id)

        // Update the post with the marketingCampaign reference
        console.log('🔄 Updating post with marketingCampaign reference')
        await client.patch(_id, {
          set: {
            marketingCampaign: { _ref: newMarketingCampaign._id, _type: 'reference' },
            status: 'ready-for-review'
          }
        }).commit()

        console.log('✅ Post updated successfully with marketingCampaign reference')

        console.log('✅ Marketing campaign creation completed:', {
          postId: _id,
          marketingCampaignId: newMarketingCampaign._id,
          klaviyoCampaignId: campaign.data.id,
          klaviyoTemplateId: template.data.id
        })

      } catch (error) {
        console.error('❌ Error creating marketingCampaign document:', error)
        throw error
      }

    } catch (error) {
      console.error('❌ Error with Klaviyo API:', error)
      throw error
    }

  } catch (error) {
    console.error('❌ Error processing post for marketing campaign:', error)
    throw error
  }
})

// Helper function to generate email template HTML
async function generateEmailTemplate(title: string | undefined, slug: string | undefined, body: any[] | undefined): Promise<string> {
  const postUrl = slug ? `https://yourdomain.com/posts/${slug}` : '#'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'New Post'}</title>
    <style>
body,table,td,p,a,li,blockquote{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}table,td{mso-table-lspace:0pt;mso-table-rspace:0pt}img{-ms-interpolation-mode:bicubic;border:0;height:auto;line-height:100%;outline:none;text-decoration:none}body{margin:0;padding:0;background-color:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.6}.email-container{max-width:600px;margin:0 auto;background-color:#fff}.header{text-align:center;padding:48px 24px}.logo{font-size:24px;font-weight:700;color:#d97706;letter-spacing:2px;margin-bottom:4px}.logo-subtitle{font-size:12px;color:#6b7280;letter-spacing:3px;margin-bottom:32px}.main-headline{font-size:32px;font-weight:300;color:#111827;margin-bottom:16px;line-height:1.2}.main-description{font-size:16px;color:#6b7280;line-height:1.6;max-width:400px;margin:0 auto}.product-section{padding:0 24px}.product-card{margin-bottom:32px;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.1)}.product-image{width:100%;height:320px;object-fit:contain;display:block}.product-badge{position:absolute;top:16px;left:16px;background-color:#ec4899;color:#fff;padding:4px 12px;font-size:12px;font-weight:500;border-radius:20px}.product-info{padding:24px;background-color:#fff}.product-name{font-size:20px;font-weight:500;color:#111827;margin-bottom:8px}.product-pricing{margin-bottom:16px}.product-price{font-size:20px;font-weight:300;color:#d97706;margin-right:12px}.product-original-price{font-size:16px;color:#6b7280;text-decoration:line-through}.btn{display:inline-block;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:500;text-align:center;width:100%;box-sizing:border-box}.btn-primary{background-color:#d97706;color:#fff}.btn-outline{background-color:transparent;color:#d97706;border:2px solid #d97706}.btn-secondary{background-color:#ec4899;color:#fff}.collection-cta{padding:48px 24px}.collection-card{background-color:#f9fafb;padding:32px;border-radius:8px;text-align:center}.collection-title{font-size:24px;font-weight:300;color:#111827;margin-bottom:12px}.collection-description{color:#6b7280;margin-bottom:24px;line-height:1.6}.experience-cta{padding:0 24px 48px;text-align:center}.experience-title{font-size:24px;font-weight:300;color:#111827;margin-bottom:12px}.experience-description{color:#6b7280;margin-bottom:24px;line-height:1.6;max-width:400px;margin:0 auto}.footer{padding:32px 24px;border-top:1px solid #e5e7eb;text-align:center}.footer-links{margin-bottom:16px}.footer-link{color:#6b7280;text-decoration:none;margin:0 12px}.footer-text{font-size:12px;color:#6b7280;margin-bottom:8px}.footer-link:hover{color:#ec4899}@media only screen and (max-width:600px){.main-headline{font-size:28px}.product-section{padding:0 16px}.collection-cta,.experience-cta{padding-left:16px;padding-right:16px}}
    </style>
</head>
<body>
    <div class="email-container">
        <!-- Header -->
        <div class="header">
            <div class="logo">SANITY</div>
            <div class="logo-subtitle">Squiggle Mart</div>
            
            ${toHTML(body || [], {
              components: {
                types: {
                  image: ({value}) => {
                    return `<img src="${value.asset.url}" alt="${value.alt || ''}" style="max-width: 100%; height: auto; margin: 20px 0;" />`
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
                  underline: ({children}) => `<u>${children}</u>`
                },
                block: {
                  h1: ({children}) => `<h1 style="font-size: 24px; margin: 24px 0;">${children}</h1>`,
                  h2: ({children}) => `<h2 style="font-size: 20px; margin: 20px 0;">${children}</h2>`, 
                  h3: ({children}) => `<h3 style="font-size: 18px; margin: 18px 0;">${children}</h3>`,
                  normal: ({children}) => `<p style="font-size: 16px; line-height: 1.6; margin: 16px 0;">${children}</p>`,
                  blockquote: ({children}) => `<blockquote style="font-style: italic; margin: 20px 0; padding-left: 20px; border-left: 4px solid #ccc;">${children}</blockquote>`
                },

              }
            })}
        </div>
        <!-- Collection CTA -->
        <div class="collection-cta">
            <div class="collection-card">
                <h3 class="collection-title">Explore the Complete Collection'</h3>
                <p class="collection-description">
                    Show your love for Squiggle Mart with this limited edition collection.
                </p>
                <a href="https://squigglemart.com/collections/all" class="btn btn-outline">View All Items</a>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <div class="footer-links">
                <a href="https://www.instagram.com/squigglemart" class="footer-link">Instagram</a>
                <a href="https://www.pinterest.com/squigglemart" class="footer-link">Pinterest</a>
                <a href="https://www.facebook.com/squigglemart" class="footer-link">Facebook</a>
            </div>
            <p class="footer-text">© ${new Date().getFullYear()} Sanity. All rights reserved.</p>
            <p class="footer-text">
                You're receiving this because you subscribed to our newsletter. 
                <a href="https://squigglemart.com/unsubscribe" class="footer-link">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
  `
}

// Helper function to generate text content
function generateTextContent(title: string | undefined, slug: string | undefined): string {
  const postUrl = slug ? `https://yourdomain.com/posts/${slug}` : '#'
  
  return `
${title || 'New Post'}

We've just published a new post that we think you'll find interesting.

Read more at: ${postUrl}

Best regards,
Your Team
  `.trim()
}