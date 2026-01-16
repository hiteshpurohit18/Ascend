export const getWeeklyInsight = (history) => {
  if (!history.length) return null;
  const count = {};
  history.slice(-7).forEach((h) => {
    count[h.mood.label] = (count[h.mood.label] || 0) + 1;
  });
  return Object.keys(count).sort((a, b) => count[b] - count[a])[0];
};

export const calculateStreak = (history) => {
  if (!history || history.length === 0) return 0;

  
  const now = new Date();
  const validHistory = history.filter(entry => new Date(entry.date) <= now);

  
  const sortedHistory = [...validHistory].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  const uniqueDates = new Set();
  const todayStr = new Date().toDateString();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();

  
  const normalizedDates = sortedHistory.map((entry) =>
    new Date(entry.date).toDateString()
  );

  const lastEntryDate = normalizedDates[0];

  
  if (lastEntryDate !== todayStr && lastEntryDate !== yesterdayStr) {
    return 0;
  }

  let streak = 0;
  let currentDateToCheck = lastEntryDate; 

  for (const date of normalizedDates) {
    if (date === currentDateToCheck) {
      if (!uniqueDates.has(date)) {
        streak++;
        uniqueDates.add(date);
        
        
        const prevDate = new Date(currentDateToCheck);
        prevDate.setDate(prevDate.getDate() - 1);
        currentDateToCheck = prevDate.toDateString();
      }
    }
  }

  return streak;
};
