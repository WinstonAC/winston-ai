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
      options: ['default', 'outline', 'ghost', 'danger'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    loading: {
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
 * Default button variant
 */
export const Default: Story = {
  args: {
    children: 'Button',
    variant: 'default',
  },
};

/**
 * Outline button variant
 */
export const Outline: Story = {
  args: {
    children: 'Button',
    variant: 'outline',
  },
};

/**
 * Ghost button variant
 */
export const Ghost: Story = {
  args: {
    children: 'Button',
    variant: 'ghost',
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
 * Small size button
 */
export const Small: Story = {
  args: {
    children: 'Small Button',
    variant: 'default',
    size: 'sm',
  },
};

/**
 * Large size button
 */
export const Large: Story = {
  args: {
    children: 'Large Button',
    variant: 'default',
    size: 'lg',
  },
};

/**
 * Loading state button
 */
export const Loading: Story = {
  args: {
    children: 'Button',
    loading: true,
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
    variant: 'default',
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