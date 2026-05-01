# Salon Management System 💇‍♀️

A complete, production-ready salon management web application for tracking employees, sales, commissions, expenses, and generating financial reports.

## 🚀 Live Demo

[View Live App](https://project-b3e9o.vercel.app/)
<img width="1706" height="944" alt="Screenshot 2026-04-26 at 16 41 22" src="https://github.com/user-attachments/assets/1db0610a-acae-4e6e-b86c-d417d7bb0dd6" />

**Demo Credentials:**

- sign in: `demo@salon.com` / `Demo@12345`
- PIN: `0000`
  
- or sign up

## ✨ Features

### Core Features
- **Employee Management** - Add, edit, delete employees, clock in/out
- **Sales Tracking** - Record sales with manual commission entry
- **Expense Management** - Track expenses by category (rent, products, utilities, marketing)
- **Customer History** - Automatic customer visit tracking
- **Payroll System** - Process commission payments on any day
- **Reports** - Generate CSV reports and income statements
- **Supervisor Dashboard** - Read-only view for managers

### Technical Features
- 🔐 **Authentication** - Supabase Auth with Row Level Security
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- ⌨️ **Keyboard Shortcuts** - `⌘K` for quick sale, `⌘P` for command palette
- 💾 **Cloud Backup** - All data backed up to Supabase
- 📊 **Financial Reports** - Income statement generation

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript, Tailwind CSS
- **Routing:** React Router v6
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Charts:** Recharts
- **Icons:** Lucide React
- **Deployment:** Netlify

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/Ayandajp/salon-management-app.git

# Navigate to project
cd salon-management-app

# Install dependencies
npm install

# Create .env file with your Supabase credentials
echo "VITE_SUPABASE_URL=your_supabase_url" >> .env
echo "VITE_SUPABASE_ANON_KEY=your_supabase_anon_key" >> .env

# Start development server
npm run dev

git add README.md
git commit -m "Add README"
git push
