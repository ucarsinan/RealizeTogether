import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string
  subject: string
  html: string
}

// Fire-and-forget: logs on failure, never throws.
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  try {
    await resend.emails.send({
      from: 'Realize Together <noreply@realizetogether.com>',
      to,
      subject,
      html,
    })
  } catch (err) {
    console.error('[email] Failed to send:', { to, subject, error: err })
  }
}
