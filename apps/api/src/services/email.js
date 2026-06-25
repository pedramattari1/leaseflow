import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null

export async function sendEmail({ to, subject, html }) {
  if (!resend) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 EMAIL STUB (set RESEND_API_KEY to send real emails)`)
    console.log(`   To: ${to}`)
    console.log(`   Subject: ${subject}`)
    console.log(`   Body length: ${html.length} chars`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    return { id: `stub-${Date.now()}`, to, subject }
  }

  const { data, error } = await resend.emails.send({
    from: process.env.RESEND_FROM || 'LeaseFlow <notifications@leaseflow.app>',
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  })

  if (error) throw new Error(error.message)
  return data
}
