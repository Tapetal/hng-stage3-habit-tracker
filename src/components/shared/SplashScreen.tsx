export default function SplashScreen() {
  return (
    <div
      data-testid="splash-screen"
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-brand-600 to-brand-700"
    >
      <div className="text-center">
        <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <span className="text-4xl">🎯</span>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Habit Tracker</h1>
        <p className="text-brand-100 text-lg">Build better habits, one day at a time</p>
        <div className="mt-8 flex justify-center gap-1">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 bg-white rounded-full opacity-60 animate-pulse"
              style={{ animationDelay: `${i * 200}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
