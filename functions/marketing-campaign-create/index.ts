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
      
      // Generate email templates
      const htmlContent = await generateEmailTemplate(title, slug?.current, event.data.body)
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
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title || 'New Post'}</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="padding: 20px 0; text-align: center; background-color: #ffffff;">
            <h1 style="font-size: 24px; color: #333333; margin-bottom: 20px;">
              ${title || 'New Post'}
            </h1>
            <div style="text-align: left; padding: 0 20px; margin-bottom: 30px;">
              ${toHTML(body || [], {
                components: {
                  types: {
                    image: ({value}) => {
                      return `<img src="${value.asset.url}" alt="${value.alt || ''}" style="max-width: 100%; height: auto; margin: 20px 0;" />`
                    }
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
                  }
                }
              })}
            </div>
            <a href="${postUrl}" style="display: inline-block; background-color: #007bff; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">
              Read More
            </a>
          </td>
        </tr>
      </table>
    </body>
    </html>
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