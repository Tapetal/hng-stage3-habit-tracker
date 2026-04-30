'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Habit } from '@/types/habit';
import { Session } from '@/types/auth';
import { getSession, logOut } from '@/lib/auth';
import { getHabits, saveHabits } from '@/lib/storage';
import { toggleHabitCompletion } from '@/lib/habits';
import HabitCard from './HabitCard';
import HabitForm from './HabitForm';

function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

export default function DashboardClient() {
  const router = useRouter();
  const [session, setSession]         = useState<Session | null>(null);
  const [habits, setHabits]           = useState<Habit[]>([]);
  const [showForm, setShowForm]       = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const today = getToday();

  // Load session + habits on mount
  useEffect(() => {
    const s = getSession();
    if (!s) {
      router.replace('/login');
      return;
    }
    setSession(s);
    const all = getHabits();
    setHabits(all.filter(h => h.userId === s.userId));
  }, [router]);

  // Persist whenever habits change
  const persistHabits = useCallback((updated: Habit[], userId: string) => {
    const all = getHabits();
    const others = all.filter(h => h.userId !== userId);
    saveHabits([...others, ...updated]);
  }, []);

  function handleLogout() {
    logOut();
    router.replace('/login');
  }

  function handleCreateHabit(data: { name: string; description: string; frequency: 'daily' }) {
    if (!session) return;
    const newHabit: Habit = {
      id: generateId(),
      userId: session.userId,
      name: data.name,
      description: data.description,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      completions: [],
    };
    const updated = [...habits, newHabit];
    setHabits(updated);
    persistHabits(updated, session.userId);
    setShowForm(false);
  }

  function handleUpdateHabit(data: { name: string; description: string; frequency: 'daily' }) {
    if (!session || !editingHabit) return;
    const updated = habits.map(h =>
      h.id === editingHabit.id
        ? {
            ...h,
            name: data.name,
            description: data.description,
            // preserve id, userId, createdAt, completions
          }
        : h
    );
    setHabits(updated);
    persistHabits(updated, session.userId);
    setEditingHabit(null);
    setShowForm(false);
  }

  function handleToggleComplete(habit: Habit) {
    if (!session) return;
    const toggled = toggleHabitCompletion(habit, today);
    const updated = habits.map(h => (h.id === habit.id ? toggled : h));
    setHabits(updated);
    persistHabits(updated, session.userId);
  }

  function handleEdit(habit: Habit) {
    setEditingHabit(habit);
    setShowForm(true);
  }

  function handleDelete(habitId: string) {
    if (!session) return;
    const updated = habits.filter(h => h.id !== habitId);
    setHabits(updated);
    persistHabits(updated, session.userId);
  }

  function handleFormCancel() {
    setShowForm(false);
    setEditingHabit(null);
  }

  function handleNewClick() {
    setEditingHabit(null);
    setShowForm(true);
  }

  if (!session) return null;

  const completedCount = habits.filter(h => h.completions.includes(today)).length;

  return (
    <div
      data-testid="dashboard-page"
      className="min-h-screen bg-slate-50"
    >
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎯</span>
            <span className="font-bold text-slate-800 text-base">Habit Tracker</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500 hidden sm:block">{session.email}</span>
            <button
              data-testid="auth-logout-button"
              onClick={handleLogout}
              className="text-xs text-slate-600 hover:text-red-600 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-1"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Summary */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Today&rsquo;s habits</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {today} · {completedCount}/{habits.length} done
            </p>
          </div>
          {!showForm && (
            <button
              data-testid="create-habit-button"
              onClick={handleNewClick}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              + New habit
            </button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <HabitForm
            editingHabit={editingHabit}
            onSave={editingHabit ? handleUpdateHabit : handleCreateHabit}
            onCancel={handleFormCancel}
          />
        )}

        {/* Habit list */}
        {habits.length === 0 && !showForm ? (
          <div
            data-testid="empty-state"
            className="text-center py-16"
          >
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">No habits yet</h2>
            <p className="text-sm text-slate-500 mb-5">Start building great habits today!</p>
            <button
              onClick={handleNewClick}
              className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
            >
              Create your first habit
            </button>
          </div>
        ) : (
          <ul className="space-y-3" aria-label="Your habits">
            {habits.map(habit => (
              <li key={habit.id}>
                <HabitCard
                  habit={habit}
                  today={today}
                  onToggleComplete={handleToggleComplete}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
