# Diploma Project

This is a Next.js project structured for scalability.

## Project Structure

The project has been organized in a scalable structure:

```
app/
├── components/
│   ├── layout/      # Layout components (Navbar, Layout, etc.)
│   ├── ui/          # UI components (Buttons, Forms, etc.)
│   └── features/    # Feature-specific components
├── context/         # React Context for global state
├── services/        # API services
├── utils/           # Utility functions and constants
└── ...
```

## Scaling Guidelines

### Adding New Features

When adding new features, follow these guidelines:

1. **Component Structure**:

   - Create components in the appropriate directory
   - Use TypeScript interfaces for props
   - Follow the existing component patterns

2. **API Integration**:

   - Use the API service for all API calls
   - Add new API endpoints to the constants file

3. **State Management**:
   - Use local React state for component-specific state
   - Use context for application-wide state
   - Consider adding additional contexts for complex features

### Code Structure Best Practices

- **Component Organization**: Group related components in feature folders
- **Type Safety**: Use TypeScript interfaces for all props and data structures
- **Consistent Naming**: Follow established naming conventions
- **Code Reuse**: Extract common functionality into utility functions

## Deployment

To deploy the application:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

You can also use the provided Dockerfile for containerized deployment.

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
