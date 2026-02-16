# Contributing to PulseKart

> 🎯 **For Interns**: Follow this guide when making changes to the project.

---

## 🚀 Quick Start

### 1. Setup (First Time)
```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Start local database
docker-compose up -d

# Setup database
npm run db:migrate
npm run db:seed
```

### 2. Run Development Server
```bash
# Terminal 1: Backend
cd backend
npm run start:dev

# Terminal 2: Frontend
npm run dev
```

Open http://localhost:3000

---

## 📝 Before You Start Coding

### 1. Create a Branch
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming**:
- `feature/add-search-bar`
- `fix/login-redirect`
- `update/readme`

### 2. Understand the Code
- Read `PROJECT_STRUCTURE.md`
- Look at similar existing code
- Ask if something is unclear

---

## 💻 Coding Guidelines

### Code Style
- **Use TypeScript** - Always define types
- **Use Tailwind** - No custom CSS files
- **Format on save** - Use Prettier extension

### Example: Good Code
```tsx
// Good: TypeScript + Tailwind
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export default function Button({ label, onClick, variant = 'primary' }: ButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-lg font-medium ${
        variant === 'primary' 
          ? 'bg-teal-500 text-white' 
          : 'bg-white/10 text-gray-300'
      }`}
    >
      {label}
    </button>
  );
}
```

### Example: Bad Code
```tsx
// Bad: No types, inline styles
function Button(props) {
  return <button style={{padding: '10px'}} onClick={props.click}>{props.text}</button>
}
```

---

## 🧪 Testing Your Changes

### Before Committing
1. **Check console** - No red errors
2. **Check build** - Run `npm run build`
3. **Test functionality** - Click through your changes
4. **Test responsive** - Check mobile view (width < 768px)

### Common Issues
| Issue | Solution |
|-------|----------|
| `Module not found` | Run `npm install` |
| `Type error` | Check imports and types |
| `Build fails` | Check terminal for errors |

---

## 📤 Committing Your Work

### Commit Message Format
```
type: Short description

Longer explanation if needed
```

**Types**:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting (no code change)
- `refactor:` Code restructure
- `test:` Adding tests

### Examples
```bash
git commit -m "feat: add search bar to products page"
git commit -m "fix: redirect after login not working"
git commit -m "docs: update API endpoint documentation"
```

---

## 🔀 Creating a Pull Request

### 1. Push Your Branch
```bash
git push origin feature/your-feature-name
```

### 2. Create PR on GitHub
- Title: Clear summary
- Description: What changed and why
- Add screenshots for UI changes

### 3. PR Checklist
- [ ] Code builds without errors
- [ ] No console warnings
- [ ] Tested on mobile view
- [ ] Follows coding guidelines
- [ ] Includes type definitions

---

## 🐛 Reporting Bugs

Create an issue with:
1. **Title**: Brief bug description
2. **Steps to reproduce**
3. **Expected behavior**
4. **Actual behavior**
5. **Screenshots** (if UI bug)
6. **Browser/OS** info

Example:
```
Title: Login button not working on mobile

Steps:
1. Go to /login
2. Enter valid credentials
3. Click Sign In

Expected: Redirect to dashboard
Actual: Nothing happens

Browser: Chrome 120, Android 14
```

---

## 🎨 Design Guidelines

### Colors
```
Background: #030712 (dark navy)
Card BG: bg-white/[0.02] (glass effect)
Brand: teal-400, teal-500, emerald-500
Text White: text-white
Text Gray: text-gray-400, text-gray-500
Danger: text-red-400, bg-red-500/10
```

### Spacing
- Use `p-4` (16px) as base padding
- Use `gap-4` for flex/grid gaps
- Use `rounded-xl` (12px) for cards
- Use `rounded-2xl` (16px) for buttons

### Icons
- Import from `@/lib/icons`
- Use `w-5 h-5` for standard size
- Use `w-4 h-4` for small icons

---

## 📞 Getting Help

### When Stuck
1. Check `PROJECT_STRUCTURE.md`
2. Look at similar existing code
3. Google the error message
4. Ask in team chat with:
   - What you're trying to do
   - What you tried
   - Full error message
   - Screenshot if UI issue

### Useful Commands
```bash
# Check git status
git status

# See recent commits
git log --oneline -10

# Undo last commit (keep changes)
git reset --soft HEAD~1

# See file changes
git diff filename.tsx
```

---

## ✅ Pre-Deployment Checklist

Before merging to main:
- [ ] All builds pass (`npm run build`)
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Tested all changed features
- [ ] Mobile view tested
- [ ] Console is clean (no errors)

---

## 🎓 Learning Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---

**Questions?** Ask your mentor or team lead! 🚀
