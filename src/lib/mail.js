import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user:  process.env.EMAIL_USER,
        pass:  process.env.EMAIL_PASS,
    }
})

export async function sendInviteEmail(email, name, token) {
    const inviteLink = `${process.env.NEXTAUTH_URL}/setup-password?token=${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "You are invited to Venture Builder Platform",
        html: `
            <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                <h2>Welcome ${name}!</h2>
                <p>You have been invited to the Venture Builder Management System.</p>
                <p>Click the button below to set up your password and get started.</p>
                <a href="${inviteLink}"
                   style="display: inline-block; padding: 12px 24px;
                          background: #2563eb; color: white;
                          border-radius: 8px; text-decoration: none;
                          margin: 16px 0;">
                    Set Up Password
                </a>
                <p style="color: #888; font-size: 12px;">
                    Link expires in 24 hours.
                </p>
            </div>
        `
    })

}

// Verification email when VB sign up
export async function sendVerificationEmail (email, name, token) {
    const verifyLink = `${process.env.NEXTAUTH_URL}/api/verify-email?token=${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Verify your Venture Builder account",
        html: `
        <div style="
            font-family: Arial, sans-serif;
            background: #f4f4f4;
            padding: 30px;
        ">
            <div style="
                max-width: 500px;
                margin: auto;
                background: white;
                padding: 30px;
                border-radius: 12px;
                text-align: center;
                box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            ">
                <h2 style="color: #111827;">
                    Welcome ${name}!
                </h2>

                <p style="color: #4b5563; line-height: 1.6;">
                    Thank you for registering with the 
                    <strong>Venture Builder Management System</strong>.
                </p>

                <p style="color: #4b5563; line-height: 1.6;">
                    Please verify your email address by clicking the button below.
                </p>

                <a 
                    href="${verifyLink}"
                    style="
                        display: inline-block;
                        margin: 20px 0;
                        padding: 12px 24px;
                        background-color: #2563eb;
                        color: white;
                        text-decoration: none;
                        border-radius: 8px;
                        font-weight: 600;
                    "
                >
                    Verify Email
                </a>

                <p style="
                    font-size: 12px;
                    color: #9ca3af;
                    margin-top: 20px;
                ">
                    This verification link will expire in 24 hours.
                </p>

                <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />

                <p style="font-size: 12px; color: #6b7280;">
                    If you did not create this account, you can safely ignore this email.
                </p>
            </div>
        </div>
        `
    })
}

export async function SendResetEmail(email, name, token) {
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`

    await transporter.sendMail({
        from: process.env.EMAIL_FROM,
        to: email,
        subject: "Reset your password",
         html: `
            <div style="font-family: sans-serif; max-width: 480px;
                        margin: 0 auto;">
                <h2>Reset Password</h2>
                <p>Hi ${name},</p>
                <p>Click below to reset your password.
                   Link expires in 1 hour.</p>
                <a href="${resetLink}"
                   style="display: inline-block; padding: 12px 24px;
                          background: #2563eb; color: white;
                          border-radius: 8px; text-decoration: none;
                          margin: 16px 0;">
                    Reset Password
                </a>
                <p style="color: #888; font-size: 12px;">
                    If you didn't request this, ignore this email.
                </p>
            </div>
        `
    })
}


// Add this to your existing mail.js

export async function sendHubInviteEmail(email, name, token, hubName) {
    const setupLink = `${process.env.NEXTAUTH_URL}/setup-password?token=${token}`

    const mailOptions = {
        from:    process.env.EMAIL_FROM,
        to:      email,
        subject: `You've been added as Hub Manager — ${hubName}`,
        html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8"/>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                   background: #f9fafb; margin: 0; padding: 40px 16px; }
            .card { max-width: 480px; margin: 0 auto; background: #fff;
                    border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; }
            .logo { font-size: 12px; font-weight: 700; color: #2563eb;
                    text-transform: uppercase; letter-spacing: .06em;
                    margin-bottom: 24px; }
            h1 { font-size: 20px; font-weight: 600; color: #111827; margin: 0 0 8px; }
            p { font-size: 14px; color: #6b7280; margin: 0 0 16px; line-height: 1.6; }
            .hub-badge { display: inline-block; background: #eff6ff;
                         color: #1d4ed8; border: 1px solid #bfdbfe;
                         padding: 4px 12px; border-radius: 999px;
                         font-size: 13px; font-weight: 500; margin-bottom: 20px; }
            .btn { display: block; background: #2563eb; color: #fff;
                   text-decoration: none; text-align: center; padding: 12px 24px;
                   border-radius: 10px; font-size: 14px; font-weight: 500;
                   margin: 20px 0; }
            .note { font-size: 12px; color: #9ca3af; }
            .footer { margin-top: 24px; padding-top: 16px; border-top: 1px solid #f3f4f6;
                      font-size: 11px; color: #9ca3af; text-align: center; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">StartupTN</div>
            <h1>You're a Hub Manager 🎉</h1>
            <p>Hi ${name},</p>
            <p>You have been added as the manager for:</p>
            <div class="hub-badge">🏢 ${hubName}</div>
            <p>Click the button below to set your password and access
               the Hub Dashboard.</p>
            <a href="${setupLink}" class="btn">Set password & sign in →</a>
            <p class="note">
              This link expires in 7 days. If you didn't expect this,
              please ignore this email.
            </p>
            <div class="footer">
              StartupTN Venture Builder Portal · Confidential
            </div>
          </div>
        </body>
        </html>
        `
    }

    await transporter.sendMail(mailOptions)
}


// ── Milestone assigned email (sent to VB) ────────────────
export async function sendMilestoneAssigned(email, name, title, deadline) {
    const dashboardLink =
        `${process.env.NEXTAUTH_URL}/VB-dashboard/milestones`

    const deadlineText = deadline
        ? new Date(deadline).toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric"
          })
        : null

    try {
        await transporter.sendMail({
            from:    process.env.EMAIL_FROM,
            to:      email,
            subject: `New milestone assigned — ${title}`,
            html: `
                <div style="font-family: sans-serif; max-width: 520px;
                            margin: 0 auto; padding: 24px;">

                    <h2 style="color: #111827; margin-bottom: 8px;">
                        New milestone assigned
                    </h2>

                    <p style="color: #6b7280; font-size: 14px;">
                        Hi ${name}, a new milestone has been assigned
                        to you on the StartupTN Venture Builder Platform.
                    </p>

                    <div style="background: #f3f4f6; border-radius: 10px;
                                padding: 16px; margin: 20px 0;">
                        <p style="margin: 0 0 6px 0; font-size: 13px;
                                  color: #6b7280;">
                            Milestone
                        </p>
                        <p style="margin: 0; font-size: 16px; font-weight: 600;
                                  color: #111827;">
                            ${title}
                        </p>

                        ${deadlineText ? `
                        <p style="margin: 10px 0 0 0; font-size: 13px;
                                  color: #d97706;">
                            📅 Deadline: ${deadlineText}
                        </p>` : ""}
                    </div>

                    <a href="${dashboardLink}"
                       style="display: inline-block; padding: 12px 28px;
                              background: #2563eb; color: white;
                              border-radius: 8px; text-decoration: none;
                              font-size: 14px; font-weight: 500;">
                        View Milestone
                    </a>

                    <p style="color: #9ca3af; font-size: 12px;
                              margin-top: 20px;">
                        Log in to your dashboard to start working
                        on this milestone.
                    </p>

                </div>
            `
        })
    } catch (error) {
        console.log("sendMilestoneAssigned error:", error)
        throw error
    }
}


// ── Milestone reviewed email (approved or rejected) ──────
export async function sendMilestoneReviewed(
    email,
    name,
    title,
    status,
    adminNote
) {
    const isApproved   = status === "APPROVED"
    const dashboardLink = `${process.env.NEXTAUTH_URL}/VB-dashboard/milestones`

    // different content based on status
    const statusConfig = {
        APPROVED: {
            subject:     `Milestone approved ✅ — ${title}`,
            heading:     "Milestone approved!",
            message:     `Congratulations! Your submission for
                         <strong>${title}</strong> has been reviewed
                         and approved by the admin.`,
            badgeColor:  "#dcfce7",
            badgeText:   "#16a34a",
            badgeLabel:  "✓ Approved",
            buttonColor: "#16a34a",
            buttonLabel: "View milestone"
        },
        REJECTED: {
            subject:     `Milestone rejected — ${title}`,
            heading:     "Milestone needs revision",
            message:     `Your submission for <strong>${title}</strong>
                         has been reviewed. The admin has requested
                         changes — please review the feedback and
                         resubmit.`,
            badgeColor:  "#fee2e2",
            badgeText:   "#dc2626",
            badgeLabel:  "✗ Rejected",
            buttonColor: "#2563eb",
            buttonLabel: "Resubmit milestone"
        }
    }

    const config = statusConfig[status] || statusConfig.REJECTED

    try {
        await transporter.sendMail({
            from:    process.env.EMAIL_FROM,
            to:      email,
            subject: config.subject,
            html: `
                <div style="font-family: sans-serif; max-width: 520px;
                            margin: 0 auto; padding: 24px;">

                    <h2 style="color: #111827; margin-bottom: 8px;">
                        ${config.heading}
                    </h2>

                    <p style="color: #6b7280; font-size: 14px;
                              line-height: 1.6;">
                        Hi ${name},
                        ${config.message}
                    </p>

                    <!-- Milestone info box -->
                    <div style="background: #f9fafb; border: 1px solid #e5e7eb;
                                border-radius: 10px; padding: 16px;
                                margin: 20px 0;">

                        <div style="display: flex; align-items: center;
                                    justify-content: space-between;
                                    margin-bottom: 10px;">
                            <p style="margin: 0; font-size: 15px;
                                      font-weight: 600; color: #111827;">
                                ${title}
                            </p>
                            <span style="background: ${config.badgeColor};
                                         color: ${config.badgeText};
                                         font-size: 12px; font-weight: 500;
                                         padding: 4px 10px;
                                         border-radius: 999px;">
                                ${config.badgeLabel}
                            </span>
                        </div>

                        ${adminNote ? `
                        <div style="background: #f3f4f6; border-radius: 8px;
                                    padding: 12px; margin-top: 10px;">
                            <p style="margin: 0 0 4px 0; font-size: 12px;
                                      color: #9ca3af; font-weight: 500;">
                                Admin feedback
                            </p>
                            <p style="margin: 0; font-size: 13px;
                                      color: #374151; line-height: 1.5;">
                                ${adminNote}
                            </p>
                        </div>
                        ` : ""}

                    </div>

                    <a href="${dashboardLink}"
                       style="display: inline-block; padding: 12px 28px;
                              background: ${config.buttonColor}; color: white;
                              border-radius: 8px; text-decoration: none;
                              font-size: 14px; font-weight: 500;">
                        ${config.buttonLabel}
                    </a>

                    ${!isApproved ? `
                    <p style="color: #6b7280; font-size: 13px;
                              margin-top: 16px; line-height: 1.6;">
                        Upload your revised evidence and resubmit
                        from your dashboard.
                    </p>
                    ` : `
                    <p style="color: #6b7280; font-size: 13px;
                              margin-top: 16px; line-height: 1.6;">
                        Keep up the great work! Check your dashboard
                        for your next milestone.
                    </p>
                    `}

                    <p style="color: #d1d5db; font-size: 12px;
                              margin-top: 24px; border-top: 1px solid #f3f4f6;
                              padding-top: 16px;">
                        StartupTN Venture Builder Platform
                    </p>

                </div>
            `
        })
    } catch (error) {
        console.log("sendMilestoneReviewed error:", error)
        throw error
    }
}