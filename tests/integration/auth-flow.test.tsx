import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock next/navigation
const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

describe('auth flow', () => {
  beforeEach(() => {
    localStorage.clear();
    mockReplace.mockClear();
  });

  it('submits the signup form and creates a session', async () => {
    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByTestId('auth-signup-email'), 'test@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    await waitFor(() => {
      // Session should be stored
      const session = JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null');
      expect(session).not.toBeNull();
      expect(session.email).toBe('test@example.com');
      // Should redirect to dashboard
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error for duplicate signup email', async () => {
    const user = userEvent.setup();

    // First signup
    render(<SignupForm />);
    await user.type(screen.getByTestId('auth-signup-email'), 'dupe@example.com');
    await user.type(screen.getByTestId('auth-signup-password'), 'password123');
    await user.click(screen.getByTestId('auth-signup-submit'));

    // Second signup with same email
    localStorage.removeItem('habit-tracker-session');
    render(<SignupForm />);
    const emailInputs = screen.getAllByTestId('auth-signup-email');
    const passwordInputs = screen.getAllByTestId('auth-signup-password');
    const submitBtns = screen.getAllByTestId('auth-signup-submit');

    await user.clear(emailInputs[1]);
    await user.type(emailInputs[1], 'dupe@example.com');
    await user.type(passwordInputs[1], 'different');
    await user.click(submitBtns[1]);

    await waitFor(() => {
      expect(screen.getAllByText('User already exists').length).toBeGreaterThan(0);
    });
  });

  it('submits the login form and stores the active session', async () => {
    const user = userEvent.setup();

    // Create user first
    const { signUp } = await import('@/lib/auth');
    signUp('login@example.com', 'mypassword');
    localStorage.removeItem('habit-tracker-session');

    render(<LoginForm />);
    await user.type(screen.getByTestId('auth-login-email'), 'login@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'mypassword');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      const session = JSON.parse(localStorage.getItem('habit-tracker-session') ?? 'null');
      expect(session).not.toBeNull();
      expect(session.email).toBe('login@example.com');
      expect(mockReplace).toHaveBeenCalledWith('/dashboard');
    });
  });

  it('shows an error for invalid login credentials', async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByTestId('auth-login-email'), 'nobody@example.com');
    await user.type(screen.getByTestId('auth-login-password'), 'wrongpassword');
    await user.click(screen.getByTestId('auth-login-submit'));

    await waitFor(() => {
      expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
    });
  });
});
