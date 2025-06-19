# Contributing to Fluffly

Thank you for considering contributing to Fluffly! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please be respectful and considerate of others.

## How Can I Contribute?

### Reporting Bugs

Before submitting a bug report:
- Check the issue tracker to see if the bug has already been reported
- Collect information about the bug (steps to reproduce, expected vs. actual behavior)
- Include screenshots if applicable

Submit a bug report with a clear title and detailed description.

### Suggesting Features

Feature suggestions are welcome! Please provide:
- A clear description of the feature
- The problem it solves
- Any design ideas or mockups you have

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting
5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to your branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
cd fluffly-backend

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start server
node basic-server-prisma.js
```

## Coding Guidelines

### JavaScript/TypeScript
- Use ES6+ features
- Follow the existing code style
- Add proper TypeScript types
- Use async/await for asynchronous operations

### React Components
- Use functional components with hooks
- Keep components focused on a single responsibility
- Use proper prop types
- Follow the existing folder structure

### CSS/Styling
- Use Tailwind CSS utility classes
- Follow the design system in `ui.md`
- Maintain consistent spacing and sizing

## Testing

- Write tests for new features
- Ensure all tests pass before submitting a pull request
- Test your changes in different browsers if applicable

## Documentation

- Update documentation when changing functionality
- Document new features
- Keep code comments clear and helpful

## Git Workflow

- Keep commits focused and atomic
- Write clear commit messages
- Rebase your branch before submitting a pull request
- Reference issues in commit messages when applicable

Thank you for contributing to Fluffly!
