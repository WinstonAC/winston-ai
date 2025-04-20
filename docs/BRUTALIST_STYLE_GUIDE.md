# Brutalist Design System

## Core Principles

1. **High Contrast**
   - Black and white as primary colors
   - No gradients or subtle color variations
   - Maximum contrast for readability
   - Pure, solid colors only

2. **Bold Structure**
   - Thick borders (2px minimum)
   - No rounded corners
   - Grid-based layouts
   - Clear, defined sections

3. **Minimalist Typography**
   - Sans-serif fonts only
   - Bold weights for emphasis
   - No decorative fonts
   - Clear hierarchy through size and weight

4. **Direct Interaction**
   - Immediate visual feedback
   - No subtle transitions
   - Clear click/tap targets
   - Simple hover states

## Color Palette

```css
/* Primary Colors */
--color-black: #000000;
--color-white: #FFFFFF;
--color-red: #FF0000;

/* Usage */
background-color: var(--color-white);
color: var(--color-black);
border-color: var(--color-black);
```

## Typography

```css
/* Font Family */
font-family: system-ui, -apple-system, sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */

/* Font Weights */
--font-normal: 400;
--font-bold: 700;
```

## Components

### Buttons

```css
/* Primary Button */
.btn-primary {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-black);
  background-color: var(--color-black);
  color: var(--color-white);
  font-weight: var(--font-bold);
}

.btn-primary:hover {
  background-color: var(--color-white);
  color: var(--color-black);
}

/* Secondary Button */
.btn-secondary {
  padding: 0.5rem 1rem;
  border: 2px solid var(--color-black);
  background-color: var(--color-white);
  color: var(--color-black);
  font-weight: var(--font-bold);
}

.btn-secondary:hover {
  background-color: var(--color-black);
  color: var(--color-white);
}
```

### Forms

```css
/* Input Fields */
.input {
  padding: 0.5rem;
  border: 2px solid var(--color-black);
  background-color: var(--color-white);
  color: var(--color-black);
}

.input:focus {
  outline: none;
  border-color: var(--color-black);
}

/* Error States */
.input-error {
  border-color: var(--color-red);
}

.error-message {
  color: var(--color-red);
  font-size: var(--text-sm);
  font-weight: var(--font-bold);
}
```

### Tables

```css
/* Table Structure */
.table {
  width: 100%;
  border: 2px solid var(--color-black);
  border-collapse: collapse;
}

.table th {
  background-color: var(--color-black);
  color: var(--color-white);
  padding: 0.5rem;
  text-align: left;
  font-weight: var(--font-bold);
}

.table td {
  padding: 0.5rem;
  border-bottom: 2px solid var(--color-black);
}
```

### Modals

```css
/* Modal Container */
.modal {
  background-color: var(--color-white);
  border: 2px solid var(--color-black);
  padding: 1.5rem;
}

.modal-overlay {
  background-color: rgba(0, 0, 0, 0.5);
}

/* Modal Header */
.modal-header {
  border-bottom: 2px solid var(--color-black);
  padding-bottom: 1rem;
  margin-bottom: 1rem;
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: var(--font-bold);
}
```

### Loading States

```css
/* Spinner */
.spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid var(--color-black);
  border-top-color: transparent;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

### Alerts & Notifications

```css
/* Toast Notifications */
.toast {
  padding: 1rem;
  border: 2px solid var(--color-black);
  background-color: var(--color-white);
  color: var(--color-black);
  font-weight: var(--font-bold);
}

.toast-success {
  border-color: var(--color-black);
}

.toast-error {
  border-color: var(--color-red);
  color: var(--color-red);
}
```

## Layout Guidelines

1. **Grid System**
   - Use CSS Grid for layouts
   - Maintain consistent spacing
   - No rounded corners
   - Clear visual hierarchy

2. **Spacing**
   - Use multiples of 4px
   - Consistent padding/margins
   - Clear separation between sections

3. **Responsive Design**
   - Maintain brutalist style at all breakpoints
   - Simple, clear layouts
   - No complex responsive patterns

## Animation Guidelines

1. **Transitions**
   - No subtle animations
   - Immediate state changes
   - Simple hover effects
   - No complex transitions

2. **Loading States**
   - Simple spinners
   - Clear loading indicators
   - No fancy animations

## Accessibility

1. **Color Contrast**
   - Maintain high contrast
   - Test with WCAG guidelines
   - Ensure readability

2. **Focus States**
   - Clear focus indicators
   - No subtle outlines
   - Maintain brutalist style

## Implementation Examples

### React Component Example

```typescript
import React from 'react';

interface BrutalistButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export const BrutalistButton: React.FC<BrutalistButtonProps> = ({
  children,
  onClick,
  variant = 'primary'
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 border-2 border-black
        ${variant === 'primary' 
          ? 'bg-black text-white hover:bg-white hover:text-black' 
          : 'bg-white text-black hover:bg-black hover:text-white'
        }
        font-bold
      `}
    >
      {children}
    </button>
  );
};
```

### Form Component Example

```typescript
import React from 'react';

interface BrutalistInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const BrutalistInput: React.FC<BrutalistInputProps> = ({
  label,
  value,
  onChange,
  error
}) => {
  return (
    <div>
      <label className="block text-sm font-bold mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
          w-full p-2 border-2
          ${error ? 'border-red-500' : 'border-black'}
        `}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1 flex items-center">
          <ExclamationCircleIcon className="w-4 h-4 mr-1" />
          {error}
        </p>
      )}
    </div>
  );
};
```

## Best Practices

1. **Consistency**
   - Follow the style guide strictly
   - Maintain brutalist principles
   - Use provided components

2. **Simplicity**
   - Keep designs simple
   - Avoid unnecessary decoration
   - Focus on functionality

3. **Performance**
   - Minimize animations
   - Optimize for speed
   - Keep code clean

4. **Maintenance**
   - Document all components
   - Keep styles organized
   - Update guide as needed 