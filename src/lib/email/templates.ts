const BASE_URL = 'https://realizetogether.com'

const ORANGE = '#e8621a'
const BG = '#f2f0ed'
const INK = '#1a1918'
const MID = '#6b6762'

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <style>
    body { margin: 0; padding: 0; background: ${BG}; font-family: 'DM Sans', Arial, sans-serif; }
    .wrap { max-width: 560px; margin: 40px auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e0ddd8; }
    .header { background: ${ORANGE}; padding: 24px 32px; }
    .logo { color: #fff; font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; text-decoration: none; }
    .content { padding: 32px; color: ${INK}; font-size: 15px; line-height: 1.7; }
    .content h1 { font-size: 22px; font-weight: 700; margin: 0 0 16px; color: ${INK}; }
    .content p { margin: 0 0 16px; color: ${MID}; }
    .btn { display: inline-block; margin-top: 8px; padding: 12px 24px; background: ${ORANGE}; color: #fff; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 14px; }
    .footer { padding: 20px 32px; border-top: 1px solid #e0ddd8; font-size: 12px; color: #999; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <a href="${BASE_URL}" class="logo">Realize Together</a>
    </div>
    <div class="content">${body}</div>
    <div class="footer">You received this email because you have an account on Realize Together. © ${new Date().getFullYear()} Realize Together</div>
  </div>
</body>
</html>`
}

// 1. New application — sent to the project creator
export function newApplicationEmail(params: {
  projectTitle: string
  applicantName: string
  projectId: string
}): { subject: string; html: string } {
  const { projectTitle, applicantName, projectId } = params
  return {
    subject: `New application for "${projectTitle}"`,
    html: layout(`
      <h1>Someone applied to your project</h1>
      <p><strong>${applicantName}</strong> has applied to <strong>${projectTitle}</strong>.</p>
      <p>Review their profile and decide whether to open a conversation.</p>
      <a href="${BASE_URL}/projects/${projectId}/applications" class="btn">Review application →</a>
    `),
  }
}

// 2. Application accepted — sent to the applicant
export function applicationAcceptedEmail(params: {
  projectTitle: string
  creatorName: string
  conversationId: string
}): { subject: string; html: string } {
  const { projectTitle, creatorName, conversationId } = params
  return {
    subject: `Your application to "${projectTitle}" was accepted`,
    html: layout(`
      <h1>You're in talks!</h1>
      <p><strong>${creatorName}</strong> accepted your application for <strong>${projectTitle}</strong>.</p>
      <p>A conversation has been opened. Say hello and keep the momentum going.</p>
      <a href="${BASE_URL}/messages/${conversationId}" class="btn">Open conversation →</a>
    `),
  }
}

// 3. Match complete — sent to both parties
export function matchCompleteEmail(params: {
  projectTitle: string
  otherPartyName: string
  projectId: string
}): { subject: string; html: string } {
  const { projectTitle, otherPartyName, projectId } = params
  return {
    subject: `You matched on "${projectTitle}"`,
    html: layout(`
      <h1>It's a match!</h1>
      <p>You and <strong>${otherPartyName}</strong> have both confirmed your collaboration on <strong>${projectTitle}</strong>.</p>
      <p>The project is now <strong>in progress</strong>. Time to make something great.</p>
      <a href="${BASE_URL}/projects/${projectId}" class="btn">View project →</a>
    `),
  }
}

// 4. New message — sent to the recipient
export function newMessageEmail(params: {
  senderName: string
  projectTitle: string
  preview: string
  conversationId: string
}): { subject: string; html: string } {
  const { senderName, projectTitle, preview, conversationId } = params
  const safePreview = preview.length > 120 ? preview.slice(0, 120) + '…' : preview
  return {
    subject: `${senderName} sent you a message`,
    html: layout(`
      <h1>New message from ${senderName}</h1>
      <p>Re: <strong>${projectTitle}</strong></p>
      <p style="background:#f2f0ed;border-radius:8px;padding:16px;font-style:italic;color:${INK};">"${safePreview}"</p>
      <a href="${BASE_URL}/messages/${conversationId}" class="btn">Reply →</a>
    `),
  }
}
