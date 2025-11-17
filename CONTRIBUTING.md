# Contributing to Financial Analytics Dashboard

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to the Financial Analytics Dashboard project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## 📜 Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

**Our Standards:**

- Be respectful and inclusive
- Welcome diverse perspectives
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## 🚀 Getting Started

1. **Fork the Repository**
   ```bash
   # Click "Fork" button on GitHub
   # Clone your fork
   git clone https://github.com/YOUR_USERNAME/financial-analytics-dashboard.git
   cd financial-analytics-dashboard
   ```

2. **Set Up Development Environment**
   ```bash
   # Install dependencies
   npm run install:all

   # Set up environment variables
   cp .env.example .env
   # Edit .env with your configuration

   # Start PostgreSQL (with Docker)
   docker-compose up -d postgres

   # Run migrations
   npm run migrate

   # Seed database
   npm run seed
   ```

3. **Start Development Services**
   ```bash
   # Start all services
   npm run dev

   # Or start individual services
   npm run dev:auth
   npm run dev:analytics
   # etc.
   ```

## 🔄 Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/bug-description
   ```

2. **Make Your Changes**
   - Write clean, readable code
   - Follow existing patterns and conventions
   - Add tests for new features
   - Update documentation as needed

3. **Test Your Changes**
   ```bash
   # Run tests
   npm test

   # Run linter
   npm run lint

   # Check formatting
   npm run format:check
   ```

4. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Link any related issues

## 🎨 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper types (avoid `any`)
- Use interfaces for object structures
- Export types for reusability

```typescript
// Good
interface User {
  id: string;
  email: string;
  role: UserRole;
}

async function getUser(id: string): Promise<User> {
  return await userService.findById(id);
}

// Bad
async function getUser(id: any): Promise<any> {
  return await userService.findById(id);
}
```

### Naming Conventions

- **Files**: kebab-case (`user-service.ts`)
- **Classes**: PascalCase (`UserService`)
- **Functions**: camelCase (`getUserById`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with `I` prefix optional (`User` or `IUser`)

### Code Style

- Use 2 spaces for indentation
- Maximum line length: 100 characters
- Use single quotes for strings
- Add semicolons at end of statements
- Use arrow functions where appropriate

```typescript
// Good
const calculateTotal = (items: Item[]): number => {
  return items.reduce((sum, item) => sum + item.price, 0);
};

// Bad
function calculateTotal(items) {
  var total = 0
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price
  }
  return total
}
```

### Backend (NestJS)

- Use dependency injection
- Implement proper DTOs for validation
- Use decorators for routes and validation
- Implement proper error handling

```typescript
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getUser(@Param('id') id: string): Promise<UserDto> {
    return await this.userService.findById(id);
  }

  @Post()
  @UsePipes(new ValidationPipe())
  async createUser(@Body() dto: CreateUserDto): Promise<UserDto> {
    return await this.userService.create(dto);
  }
}
```

### Frontend (React)

- Use functional components with hooks
- Use TypeScript for props
- Keep components small and focused
- Use Material-UI components

```typescript
interface KPICardProps {
  title: string;
  value: number;
  trend: 'up' | 'down' | 'stable';
}

export const KPICard: React.FC<KPICardProps> = ({ title, value, trend }) => {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{title}</Typography>
        <Typography variant="h4">{value}</Typography>
        <TrendIndicator trend={trend} />
      </CardContent>
    </Card>
  );
};
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

### Examples

```bash
feat(analytics): add revenue forecasting
fix(auth): resolve JWT token expiration bug
docs(readme): update installation instructions
test(api): add integration tests for analytics service
refactor(data): improve query performance
```

## 🔀 Pull Request Process

1. **Ensure CI Passes**
   - All tests pass
   - No linting errors
   - Build succeeds

2. **Update Documentation**
   - Update README if needed
   - Add/update API documentation
   - Update CHANGELOG

3. **Request Review**
   - Assign relevant reviewers
   - Respond to feedback promptly
   - Make requested changes

4. **Merge Requirements**
   - At least 1 approval from maintainers
   - All CI checks passing
   - No merge conflicts
   - Branch up to date with main

### PR Title Format

Use conventional commits format:

```
feat(analytics): add revenue forecasting capability
fix(auth): resolve token refresh issue
```

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm test

# Specific service
cd backend/auth-service && npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e
```

### Writing Tests

**Unit Tests:**

```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    service = new UserService();
  });

  it('should create a user', async () => {
    const user = await service.create({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(user).toBeDefined();
    expect(user.email).toBe('test@example.com');
  });
});
```

**Integration Tests:**

```typescript
describe('Auth API', () => {
  it('POST /auth/login should return JWT token', async () => {
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@healthcare.com',
        password: 'Admin@2024',
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('access_token');
  });
});
```

## 📚 Documentation

### Code Comments

- Add comments for complex logic
- Use JSDoc for functions
- Explain "why" not "what"

```typescript
/**
 * Calculates the collection rate percentage
 * @param collections - Total cash collections
 * @param netRevenue - Net revenue after adjustments
 * @returns Collection rate as percentage (0-100)
 */
function calculateCollectionRate(
  collections: number,
  netRevenue: number
): number {
  if (netRevenue === 0) return 0;
  return (collections / netRevenue) * 100;
}
```

### README Updates

Update relevant README files when:
- Adding new features
- Changing configuration
- Updating dependencies
- Modifying setup process

## 🤝 Community

- Join our [Discord](https://discord.gg/healthcare-analytics)
- Ask questions in [GitHub Discussions](https://github.com/yourusername/financial-analytics-dashboard/discussions)
- Report bugs in [Issues](https://github.com/yourusername/financial-analytics-dashboard/issues)

## 📞 Getting Help

If you need help:

1. Check existing documentation
2. Search closed issues
3. Ask in Discord
4. Create a GitHub Discussion
5. Contact maintainers

## 🎉 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project website

Thank you for contributing! 🙏
