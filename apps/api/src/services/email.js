import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({ to, subject, html, attachments }) {
  if (!resend) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 EMAIL STUB (set RESEND_API_KEY to send real emails)`)
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body length: ${html?.length || 0} chars`)
    if (attachments?.length) {
      console.log(`   Attachments: ${attachments.map(a => `${a.filename} (${a.content?.length || 0} bytes)`).join(', ')}`)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return { id: `stub-${Date.now()}`, to, subject }
  }

  const payload = {
    from: process.env.RESEND_FROM || 'LeaseFlow <notifications@leaseflow.app>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  }
  if (attachments?.length) {
    // Resend expects content as a base64 string or Buffer per attachment.
    payload.attachments = attachments.map(a => ({
      filename: a.filename,
      content: Buffer.isBuffer(a.content) ? a.content : Buffer.from(a.content),
    }))
  }

  const { data, error } = await resend.emails.send(payload)

  if (error) throw new Error(error.message)
  return data
}
