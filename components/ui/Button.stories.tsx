import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';

/**
 * A brutalist button component with various styles and states.
 */
const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A brutalist button component that supports various styles, sizes, and states.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'success'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    isLoading: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    children: {
      control: 'text',
      description: 'The content of the button',
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Primary button variant
 */
export const Primary: Story = {
  args: {
    children: 'Button',
    variant: 'primary',
  },
};

/**
 * Secondary button variant
 */
export const Secondary: Story = {
  args: {
    children: 'Button',
    variant: 'secondary',
  },
};

/**
 * Danger button variant
 */
export const Danger: Story = {
  args: {
    children: 'Button',
    variant: 'danger',
  },
};

/**
 * Success button variant
 */
export const Success: Story = {
  args: {
    children: 'Button',
    variant: 'success',
  },
};

/**
 * Small size button
 */
export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'primary',
    size: 'sm',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'primary',
    size: 'lg',
  },
};

/**
 * Loading state button
 */
export const Loading: Story = {
  args: {
    children: 'Button',
    isLoading: true,
  },
};

/**
 * Disabled state button
 */
export const Disabled: Story = {
  args: {
    children: 'Button',
    disabled: true,
  },
};

/**
 * Button with icon
 */
export const WithIcon: Story = {
  args: {
    children: 'Button with Icon',
    variant: 'primary',
    leftIcon: (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4v16m8-8H4"
        />
      </svg>
    ),
  },
}; 