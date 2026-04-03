# KA cave

A modern web application for creating, reading, and managing digital books with collaborative features.

## Features

- **Book Creation & Editing**: Advanced creator studio with rich text editing
- **Reading Experience**: Modern reader interface with customizable settings
- **User Management**: Authentication, profiles, and social features
- **Analytics**: Creator analytics and engagement tracking
- **Community**: Messaging, comments, and social interactions
- **Moderation**: Safety center and content moderation tools

## Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Tailwind CSS for styling
- Vite for build tooling

### Backend
- Node.js with Express
- Supabase for database and authentication
- JWT for session management

### Database
- PostgreSQL (via Supabase)

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/f24608043-commits/bookwriter.git
cd ka-cave
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your Supabase credentials and other configuration.

4. Start the development server:
```bash
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Database Configuration
DATABASE_URL=your_database_url_here

# JWT Configuration
JWT_SECRET=your_jwt_secret_here

# API Configuration
API_BASE_URL=http://localhost:3000
PORT=3000

# Environment
NODE_ENV=development
```

## Project Structure

```
ka-cave/
├── backend/                 # Backend API services
│   ├── auth.js             # Authentication logic
│   ├── services.js         # Business logic services
│   ├── supabase.js         # Database connection
│   └── seed.js             # Database seeding
├── components/             # Reusable UI components
├── pages/                  # Page-specific components
├── scripts/                # Utility scripts
├── styles/                 # CSS and styling files
├── assets/                 # Static assets
├── images/                 # Image files
└── dist/                   # Build output
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on GitHub.

---

**🎉 KA cave - Your modern platform for digital storytelling!**
