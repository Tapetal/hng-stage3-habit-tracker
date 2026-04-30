'use client';

import { useState, FormEvent, useEffect } from 'react';
import { Habit } from '@/types/habit';
import { validateHabitName } from '@/lib/validators';

interface HabitFormProps {
  editingHabit?: Habit | null;
  onSave: (data: { name: string; description: string; frequency: 'daily' }) => void;
  onCancel: () => void;
}

export default function HabitForm({ editingHabit, onSave, onCancel }: HabitFormProps) {
  const [name, setName]             = useState('');
  const [description, setDescription] = useState('');
  const [frequency] = useState<'daily'>('daily');
  const [nameError, setNameError]   = useState<string | null>(null);

  useEffect(() => {
    if (editingHabit) {
      setName(editingHabit.name);
      setDescription(editingHabit.description);
    } else {
      setName('');
      setDescription('');
    }
    setNameError(null);
  }, [editingHabit]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const validation = validateHabitName(name);
    if (!validation.valid) {
      setNameError(validation.error);
      return;
    }
    setNameError(null);
    onSave({ name: validation.value, description: description.trim(), frequency });
  }

  return (
    <form
      data-testid="habit-form"
      onSubmit={handleSubmit}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4"
    >
      <h3 className="font-semibold text-slate-800 text-base">
        {editingHabit ? 'Edit habit' : 'New habit'}
      </h3>

      <div>
        <label htmlFor="habit-name-input" className="block text-sm font-medium text-slate-700 mb-1.5">
          Habit name <span aria-hidden="true" className="text-red-500">*</span>
        </label>
        <input
          id="habit-name-input"
          data-testid="habit-name-input"
          type="text"
          value={name}
          onChange={e => { setName(e.target.value); setNameError(null); }}
          placeholder="e.g. Drink Water"
          className={`w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
            nameError ? 'border-red-400 bg-red-50' : 'border-slate-300'
          }`}
          aria-describedby={nameError ? 'name-error' : undefined}
        />
        {nameError && (
          <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-600">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="habit-description-input" className="block text-sm font-medium text-slate-700 mb-1.5">
          Description <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="habit-description-input"
          data-testid="habit-description-input"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Why does this habit matter to you?"
          rows={2}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
        />
      </div>

      <div>
        <label htmlFor="habit-frequency-select" className="block text-sm font-medium text-slate-700 mb-1.5">
          Frequency
        </label>
        <select
          id="habit-frequency-select"
          data-testid="habit-frequency-select"
          value={frequency}
          disabled
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm bg-slate-50 text-slate-600 focus:outline-none"
        >
          <option value="daily">Daily</option>
        </select>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          data-testid="habit-save-button"
          className="flex-1 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
        >
          {editingHabit ? 'Save changes' : 'Create habit'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2.5 border border-slate-300 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
