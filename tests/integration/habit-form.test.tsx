import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

const mockReplace = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

import DashboardClient from '@/components/dashboard/DashboardClient';
import { saveSession } from '@/lib/storage';
import { signUp } from '@/lib/auth';

function setupUser(email = 'habits@example.com', password = 'pass123') {
  localStorage.clear();
  signUp(email, password);
  // Session is already saved by signUp
}

describe('habit form', () => {
  beforeEach(() => {
    mockReplace.mockClear();
    setupUser();
  });

  it('shows a validation error when habit name is empty', async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    await waitFor(() => screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('create-habit-button'));
    await waitFor(() => screen.getByTestId('habit-form'));

    // Submit with empty name
    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(screen.getByText('Habit name is required')).toBeInTheDocument();
    });
  });

  it('creates a new habit and renders it in the list', async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    await waitFor(() => screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('create-habit-button'));
    await waitFor(() => screen.getByTestId('habit-form'));

    await user.type(screen.getByTestId('habit-name-input'), 'Drink Water');
    await user.type(screen.getByTestId('habit-description-input'), 'Stay hydrated');
    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('habit-card-drink-water')).toBeInTheDocument();
    });
  });

  it('edits an existing habit and preserves immutable fields', async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    // Create habit first
    await waitFor(() => screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('create-habit-button'));
    await waitFor(() => screen.getByTestId('habit-form'));
    await user.type(screen.getByTestId('habit-name-input'), 'Read Books');
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => screen.getByTestId('habit-card-read-books'));

    // Get original habit from storage to check immutable fields
    const habitsBefore = JSON.parse(localStorage.getItem('habit-tracker-habits') ?? '[]');
    const originalId = habitsBefore[0].id;
    const originalCreatedAt = habitsBefore[0].createdAt;

    // Edit it
    await user.click(screen.getByTestId('habit-edit-read-books'));
    await waitFor(() => screen.getByTestId('habit-form'));

    const nameInput = screen.getByTestId('habit-name-input');
    await user.clear(nameInput);
    await user.type(nameInput, 'Read More Books');
    await user.click(screen.getByTestId('habit-save-button'));

    await waitFor(() => {
      expect(screen.getByTestId('habit-card-read-more-books')).toBeInTheDocument();
    });

    // Verify immutable fields preserved
    const habitsAfter = JSON.parse(localStorage.getItem('habit-tracker-habits') ?? '[]');
    const updated = habitsAfter[0];
    expect(updated.id).toBe(originalId);
    expect(updated.createdAt).toBe(originalCreatedAt);
    expect(updated.name).toBe('Read More Books');
  });

  it('deletes a habit only after explicit confirmation', async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    // Create habit
    await waitFor(() => screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('create-habit-button'));
    await waitFor(() => screen.getByTestId('habit-form'));
    await user.type(screen.getByTestId('habit-name-input'), 'Exercise');
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => screen.getByTestId('habit-card-exercise'));

    // Click delete — should show confirmation, not delete yet
    await user.click(screen.getByTestId('habit-delete-exercise'));
    expect(screen.getByTestId('habit-card-exercise')).toBeInTheDocument();
    expect(screen.getByTestId('confirm-delete-button')).toBeInTheDocument();

    // Confirm deletion
    await user.click(screen.getByTestId('confirm-delete-button'));
    await waitFor(() => {
      expect(screen.queryByTestId('habit-card-exercise')).not.toBeInTheDocument();
    });
  });

  it('toggles completion and updates the streak display', async () => {
    const user = userEvent.setup();
    render(<DashboardClient />);

    // Create habit
    await waitFor(() => screen.getByTestId('create-habit-button'));
    await user.click(screen.getByTestId('create-habit-button'));
    await waitFor(() => screen.getByTestId('habit-form'));
    await user.type(screen.getByTestId('habit-name-input'), 'Meditate');
    await user.click(screen.getByTestId('habit-save-button'));
    await waitFor(() => screen.getByTestId('habit-card-meditate'));

    // Initial streak is 0
    expect(screen.getByTestId('habit-streak-meditate')).toHaveTextContent('0');

    // Toggle complete
    await user.click(screen.getByTestId('habit-complete-meditate'));

    // Streak should now be 1
    await waitFor(() => {
      expect(screen.getByTestId('habit-streak-meditate')).toHaveTextContent('1');
    });

    // Toggle back — streak returns to 0
    await user.click(screen.getByTestId('habit-complete-meditate'));
    await waitFor(() => {
      expect(screen.getByTestId('habit-streak-meditate')).toHaveTextContent('0');
    });
  });
});
