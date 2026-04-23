// Supabase Edge Function — send-notification
// Triggered by database webhooks (or called directly from server actions)
// Deploy with: supabase functions deploy send-notification

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface NotificationPayload {
  type: 'new_meeting' | 'new_announcement' | 'issue_report' | 'user_registration' | 'user_approved'
  data: Record<string, unknown>
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  try {
    const payload: NotificationPayload = await req.json()
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    switch (payload.type) {
      case 'new_meeting': {
        // Email all subscribed members about a new meeting
        const { data: subscribers } = await supabase
          .from('notification_subscriptions')
          .select('user_id, users(email, full_name)')
          .eq('meetings', true)

        const meeting = payload.data as { title: string; date: string; time: string; location: string }

        for (const sub of subscribers ?? []) {
          const user = (sub as Record<string, unknown>).users as { email: string; full_name: string }
          if (!user?.email) continue

          await supabase.auth.admin.sendRawEmail({
            to: user.email,
            subject: `📋 Board Meeting Scheduled: ${meeting.title}`,
            html: `
              <p>Hi ${user.full_name},</p>
              <p>A new board meeting has been scheduled:</p>
              <ul>
                <li><strong>Title:</strong> ${meeting.title}</li>
                <li><strong>Date:</strong> ${meeting.date}</li>
                <li><strong>Time:</strong> ${meeting.time}</li>
                <li><strong>Location:</strong> ${meeting.location}</li>
              </ul>
              <p>Log in to <a href="https://fortmason.info/meetings">fortmason.info</a> to RSVP.</p>
              <p>— Fort Mason HOA Board</p>
            `,
          })
        }
        break
      }

      case 'new_announcement': {
        // Email all members about a new board correspondence
        const { data: members } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('approved', true)

        const announcement = payload.data as { subject: string; body: string }

        for (const member of members ?? []) {
          if (!member.email) continue
          await supabase.auth.admin.sendRawEmail({
            to: member.email,
            subject: `📢 Fort Mason HOA: ${announcement.subject}`,
            html: `
              <p>Dear Fort Mason Community Member,</p>
              <p>${announcement.body.replace(/\n/g, '<br>')}</p>
              <p>— Fort Mason HOA Board<br>
              <a href="mailto:board@fortmason.info">board@fortmason.info</a></p>
            `,
          })
        }
        break
      }

      case 'issue_report': {
        // Email board about a new issue report
        const report = payload.data as { body: string; submitter: string }
        await supabase.auth.admin.sendRawEmail({
          to: 'board@fortmason.info',
          subject: '📞 New Issue Report — fortmason.info',
          html: `
            <p>A new issue has been reported by a community member:</p>
            <blockquote style="border-left:3px solid #ccc;padding-left:12px;margin:12px 0;">
              ${report.body.replace(/\n/g, '<br>')}
            </blockquote>
            <p>Submitted by: ${report.submitter}</p>
            <p>Log in to <a href="https://fortmason.info/status">fortmason.info</a> to review.</p>
          `,
        })
        break
      }

      case 'user_registration': {
        // Email board when a new user registers
        const user = payload.data as { full_name: string; email: string; property_address: string }
        await supabase.auth.admin.sendRawEmail({
          to: 'board@fortmason.info',
          subject: `👤 New Access Request: ${user.full_name}`,
          html: `
            <p>A new resident has requested portal access:</p>
            <ul>
              <li><strong>Name:</strong> ${user.full_name}</li>
              <li><strong>Email:</strong> ${user.email}</li>
              <li><strong>Property:</strong> ${user.property_address ?? 'Not provided'}</li>
            </ul>
            <p>Please review and approve (or deny) their account in the
            <a href="https://fortmason.info">admin portal</a>.</p>
          `,
        })
        break
      }

      case 'user_approved': {
        // Email the user when their account is approved
        const user = payload.data as { email: string; full_name: string }
        await supabase.auth.admin.sendRawEmail({
          to: user.email,
          subject: '✅ Your Fort Mason HOA Access Has Been Approved',
          html: `
            <p>Hi ${user.full_name},</p>
            <p>Your account has been approved! You can now log in to the community portal at
            <a href="https://fortmason.info">fortmason.info</a>.</p>
            <p>Welcome to the community!</p>
            <p>— Fort Mason HOA Board<br>
            <a href="mailto:board@fortmason.info">board@fortmason.info</a></p>
          `,
        })
        break
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Notification error:', error)
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
