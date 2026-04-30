'use client';

import { useState } from 'react';
import { Habit } from '@/types/habit';
import { getHabitSlug } from '@/lib/slug';
import { calculateCurrentStreak } from '@/lib/streaks';

interface HabitCardProps {
  habit: Habit;
  today: string;
  onToggleComplete: (habit: Habit) => void;
  onEdit: (habit: Habit) => void;
  onDelete: (habitId: string) => void;
}

export default function HabitCard({
  habit,
  today,
  onToggleComplete,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const slug = getHabitSlug(habit.name);
  const isCompleted = habit.completions.includes(today);
  const streak = calculateCurrentStreak(habit.completions, today);

  function handleDeleteClick() {
    setConfirmingDelete(true);
  }

  function handleConfirmDelete() {
    onDelete(habit.id);
    setConfirmingDelete(false);
  }

  function handleCancelDelete() {
    setConfirmingDelete(false);
  }

  return (
    <article
      data-testid={`habit-card-${slug}`}
      className={`bg-white rounded-xl border shadow-sm p-4 transition-all ${
        isCompleted
          ? 'border-brand-200 bg-brand-50'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3">
        {/* Complete toggle */}
        <button
          data-testid={`habit-complete-${slug}`}
          onClick={() => onToggleComplete(habit)}
          aria-label={isCompleted ? `Mark ${habit.name} incomplete` : `Mark ${habit.name} complete`}
          aria-pressed={isCompleted}
          className={`mt-0.5 w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
            isCompleted
              ? 'bg-brand-600 border-brand-600 text-white'
              : 'border-slate-400 hover:border-brand-500'
          }`}
        >
          {isCompleted && (
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm leading-snug ${isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>
            {habit.name}
          </h3>
          {habit.description && (
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{habit.description}</p>
          )}
        </div>

        {/* Streak */}
        <div
          data-testid={`habit-streak-${slug}`}
          className="flex-shrink-0 flex items-center gap-1 text-xs font-semibold"
          aria-label={`${streak} day streak`}
        >
          <span className="text-base" aria-hidden="true">{streak > 0 ? '🔥' : '⭕'}</span>
          <span className={streak > 0 ? 'text-orange-500' : 'text-slate-400'}>
            {streak}
          </span>
        </div>
      </div>

      {/* Delete confirmation */}
      {confirmingDelete && (
        <div
          role="alertdialog"
          aria-labelledby="delete-confirm-label"
          className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg"
        >
          <p id="delete-confirm-label" className="text-sm text-red-700 font-medium mb-2">
            Delete &ldquo;{habit.name}&rdquo;? This cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              data-testid="confirm-delete-button"
              onClick={handleConfirmDelete}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold py-1.5 px-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Yes, delete
            </button>
            <button
              onClick={handleCancelDelete}
              className="flex-1 border border-red-300 text-red-600 hover:bg-red-100 text-xs font-semibold py-1.5 px-3 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {!confirmingDelete && (
        <div className="flex gap-2 mt-3 justify-end">
          <button
            data-testid={`habit-edit-${slug}`}
            onClick={() => onEdit(habit)}
            aria-label={`Edit ${habit.name}`}
            className="text-xs text-slate-500 hover:text-brand-600 font-medium px-2.5 py-1 rounded-md hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-1"
          >
            Edit
          </button>
          <button
            data-testid={`habit-delete-${slug}`}
            onClick={handleDeleteClick}
            aria-label={`Delete ${habit.name}`}
            className="text-xs text-slate-500 hover:text-red-600 font-medium px-2.5 py-1 rounded-md hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
