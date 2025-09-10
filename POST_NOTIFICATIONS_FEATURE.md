# Post Notifications Feature

## Overview

This feature adds a custom component to the Post document schema that displays notifications related to that specific post from the marketing campaign functions.

## What It Does

When you open a Post document in Sanity Studio, you'll see a new "Related Notifications" field that shows:

- ✅ **Success notifications** when marketing campaigns are created, updated, or sent
- ❌ **Error notifications** when something goes wrong with the marketing campaign process
- 📊 **Real-time status** of all marketing operations for that post
- 🔍 **Detailed information** including timestamps, error messages, and source functions

## How It Works

### 1. **Automatic Notification Creation**
The marketing campaign functions automatically create notifications when they run:

- **Marketing Campaign Create Function** (`functions/marketing-campaign-create/`)
  - Creates notifications when campaigns are successfully created
  - Creates notifications when templates are updated
  - Creates error notifications if anything fails

- **Marketing Campaign Send Function** (`functions/marketing-campaign-send/`)
  - Creates notifications when campaigns are successfully sent
  - Creates error notifications if sending fails

### 2. **Post Document Integration**
The Post document schema now includes a custom "Related Notifications" field that:

- Queries notifications where `metadata.postTitle` matches the post's title
- Displays them in a user-friendly interface within Sanity Studio
- Updates automatically when new notifications are created
- Shows the most recent 10 notifications

### 3. **Notification Types**

| Type | Source | When It Appears |
|------|--------|----------------|
| **Campaign Created** | `marketing-campaign-create` | When a new marketing campaign is successfully created |
| **Template Updated** | `marketing-campaign-create` | When a campaign template is updated |
| **Campaign Sent** | `marketing-campaign-send` | When a campaign is successfully sent to subscribers |
| **Error** | Both functions | When any operation fails |

## Usage

1. **Create or edit a Post** in Sanity Studio
2. **Save the post** with a title (notifications are matched by title)
3. **Scroll down** to see the "Related Notifications" field
4. **View real-time status** of marketing campaign operations

## Example Notifications

```
✅ Marketing Campaign Created
Successfully created marketing campaign for "New Product Launch"
Source: marketing-campaign-create
Created: 2024-01-15 10:30:00

✅ Marketing Campaign Sent  
Successfully sent marketing campaign for "New Product Launch" to subscribers
Source: marketing-campaign-send
Created: 2024-01-15 11:45:00

❌ Marketing Campaign Error
Failed to create marketing campaign for "Black Friday Deals": Klaviyo API rate limit exceeded
Source: marketing-campaign-create
Created: 2024-01-15 12:15:00
```

## Technical Details

### Files Modified
- `sanity/schemaTypes/documents/post.tsx` - Added notifications field
- `sanity/components/notifications/PostNotifications.tsx` - Custom component
- `functions/marketing-campaign-create/index.ts` - Added notification calls
- `functions/marketing-campaign-send/index.ts` - Added notification calls
- `functions/shared/notification-utils.ts` - Shared notification utilities

### Query Used
```groq
*[_type == "notification" && metadata.postTitle == "${postTitle}" && !(_id in path("drafts.**"))] | order(createdAt desc) [0...10]
```

This query finds all notifications where the `postTitle` in metadata matches the current post's title, excluding drafts, ordered by creation date (newest first), limited to 10 results.

## Benefits

1. **Real-time Visibility** - See the status of marketing operations directly in the post editor
2. **Error Tracking** - Quickly identify and debug issues with marketing campaigns
3. **Audit Trail** - Keep track of all marketing activities for each post
4. **No External Tools** - Everything is visible within Sanity Studio
5. **Automatic Updates** - Notifications appear automatically as functions run

## Future Enhancements

- Mark notifications as read/unread
- Filter notifications by type (success, error, etc.)
- Click to view full error details
- Export notification history
- Email alerts for critical errors
