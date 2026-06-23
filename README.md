# 🚀 Venture Builder Management System (VBMS)

A full-stack role-based web application developed to manage Venture Builders (VBs), Regional Hubs, milestone tracking, document submissions, and approval workflows.

The platform enables administrators to manage the complete Venture Builder lifecycle, assign milestones, monitor progress, and coordinate with Hub Managers.

---

## 🌟 Features

### 👨‍💼 Admin Module

- Secure admin authentication
- Create and manage Venture Builder accounts
- Send invitation emails with password setup links
- Create and manage Regional Hubs
- Create Hub Manager accounts
- Assign Venture Builders to Hubs
- Create and manage milestones
- Assign milestones with deadlines
- View VB profile completion status
- Create or edit VB profiles on behalf of Venture Builders
- Review milestone submissions
- Approve or reject submitted milestones
- Monitor overall progress and activities

---

### 🚀 Venture Builder (VB) Module

- Self-registration with email verification
- Secure login with credentials
- Complete and edit organization profile
- Upload required documents
- View assigned milestones
- Submit milestone progress
- Track milestone status
- View profile completion percentage

Supported document formats:

- PDF (.pdf)
- Word Documents (.doc, .docx)
- Images (.jpg, .jpeg, .png)

---

### 🏢 Hub Manager Module

- Receive invitation email from Admin
- Setup account password
- Login securely
- View assigned Venture Builders
- Monitor VB profile completion
- Track milestone progress and submissions

---

# 🔐 Authentication & Security

- NextAuth.js authentication
- JWT-based session management
- Role-based route protection
- Password encryption using bcrypt
- Email verification system
- Password setup invitation links
- Protected dashboards using middleware

---

# 📋 Venture Builder Profile

The system maintains complete Venture Builder organization information.

### Organization Details

- Organization Name
- Legal Entity Type
- Registration Number (CIN/LLPIN etc.)
- Date of Incorporation
- GST Number
- Registered Office Address

### Contact Details

- Contact Person Name
- Designation
- Email Address
- Mobile Number

### Organization Information

- Founder Experience
- Minimum Viable Product (MVP)
- Mentor Network Access
- Startup Framework & Approach
- Tier-2 & Tier-3 Startup Strategy

### Documents

- Legal Entity Proof
- MVP Documents
- Past Engagement Documents

---

# 🎯 Milestone Management

The system tracks Venture Builder performance through four major milestones.

## Milestone 1 - DPIIT Registration

Target: 25 Startups

- Startup scouting
- Startup onboarding
- StartupTN Smart Card distribution
- DPIIT startup registration reporting

---

## Milestone 2 - Prototyping & Validation

Target: 25 Startups

- Startup incubation center connections
- Gap analysis
- StartupTN service utilization
- Mentor connect programs

---

## Milestone 3 - MVP Development

Target: 25 Startups

- Product review sessions
- Business model development
- Credit access support
- Fundraising sessions

---

## Milestone 4 - Review & Analysis

Target: 25 Startups

- Startup progress review
- Success stories documentation
- Final performance report submission

---

# 📊 Milestone Workflow

```
Pending
   ↓
Submitted
   ↓
Approved / Rejected
```

---

# 🏢 Hub Management

Administrators can:

- Create Regional Hubs
- Assign Hub Managers
- Assign Venture Builders to Hubs
- Monitor Hub-wise VB progress

---

# 🧰 Tech Stack

## Frontend

- Next.js
- React.js
- Tailwind CSS
- JavaScript

## Backend

- Next.js API Routes
- Prisma ORM

## Database

- PostgreSQL
- Supabase

## Authentication

- NextAuth.js
- JWT
- bcrypt.js

## Email Service

- Nodemailer

---

# 🗄 Database Models

- User
- VentureBuilderProfile
- Hub
- HubAssignment
- Milestone
- MilestoneAssignment
- Document

---

# 📈 Dashboards

## Admin Dashboard

- User Management
- Venture Builder Management
- Hub Management
- Milestone Assignment
- Submission Review
- Progress Tracking

---

## Venture Builder Dashboard

- Profile Management
- Document Upload
- Assigned Milestones
- Submission Status

---

## Hub Dashboard

- Assigned Venture Builders
- Profile Status Monitoring
- Milestone Progress Tracking

---

# ⚙️ Installation & Setup

## 1. Clone Repository

```bash
git clone https://github.com/your-username/venture-builder-management.git
cd venture-builder-management
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Setup Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_supabase_database_url

NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000

EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_address
EMAIL_PASS=your_email_password
EMAIL_FROM=your_sender_email
```

---

## 4. Setup Database

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Generate Prisma client:

```bash
npx prisma generate
```

---

## 5. Run Development Server

```bash
npm run dev
```

Application will run on:

```
http://localhost:3000
```

---

# 📧 Email Notifications

The system sends automated emails for:

- Venture Builder invitations
- Hub Manager invitations
- Password setup links
- Email verification
- Milestone assignments

---

# 🔮 Future Enhancements

- Dashboard analytics and charts
- Notification center
- Report generation (PDF/Excel)
- Advanced search and filtering
- Activity logs
- Cloud file storage integration

---

# 👨‍💻 Developer

**Ramkumar**

Full Stack Developer

Built using **Next.js, Prisma, PostgreSQL, Supabase, and NextAuth.js**

---

## 📄 License

This project is developed for Venture Builder management and internal workflow automation.
