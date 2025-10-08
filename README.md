# Frontend README

## Support Ticket System - Frontend

A modern, responsive React application for managing support tickets with real-time chat, reviews, and analytics.

### 🚀 Features

- **User Authentication**: Secure login/registration with role-based access
- **Ticket Management**: Create, view, update, and delete support tickets
- **Real-time Chat**: Live messaging system for ticket communication
- **Reviews & Ratings**: Customer feedback system with 5-star ratings
- **Analytics Dashboard**: Performance metrics and ticket statistics
- **Knowledge Base**: Article management for customer support
- **Responsive Design**: Works on all device sizes

### 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom UI components
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Fetch API
- **UI Components**: Custom-built using Radix UI primitives
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Notifications**: Sonner toast library

### 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Base UI components (buttons, cards, etc.)
│   └── tickets/        # Ticket-specific components
├── contexts/           # React Context providers
├── pages/              # Route components
├── types/              # TypeScript type definitions
├── lib/                # Utility functions and mock data
└── routes/             # API route definitions
```

### 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd support-ticket-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env.local
```

4. Update environment variables:
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

5. Start the development server:
```bash
npm run dev
```

### 🚦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### 🔐 Authentication Flow

1. User logs in via `/auth` route
2. JWT token is stored in localStorage
3. Token is attached to all API requests
4. User role determines available features

### 📊 Available Roles

- **Customer**: Create tickets, chat with agents, rate support
- **Agent**: View assigned tickets, update status, reply to reviews
- **Admin**: Full access to all features, user management

### 📈 Key Components

- **TicketCard**: Displays ticket summary with status/priority indicators
- **ChatWidget**: Real-time messaging interface
- **ReviewForm**: Customer rating and feedback form
- **TicketDetail**: Full ticket view with all interactions
- **Dashboard**: Analytics and quick ticket overview

### 📝 API Integration

The frontend communicates with the backend through:
- `/api/tickets` - Ticket management
- `/api/chats` - Real-time messaging
- `/api/reviews` - Customer feedback
- `/api/users` - User management
- `/api/blogs` - Knowledge base articles

### 🧪 Testing

- Unit tests with React Testing Library
- Integration tests for API interactions
- Component testing with Storybook (planned)

### 🚀 Deployment

1. Build for production:
```bash
npm run build
```

2. Serve the `dist/` folder using:
- Static hosting (Netlify, Vercel, GitHub Pages)
- Web server (Apache, Nginx)
- Node.js server

### 🔒 Security Considerations

- JWT tokens stored in localStorage (consider HttpOnly cookies in production)
- Input validation on client-side
- Role-based access control
- Secure API communication over HTTPS

### 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### 📄 License

MIT License - see LICENSE file for details.

---

