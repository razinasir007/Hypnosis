// Helper function to check if the last check-in is within a week
function isWithinAWeek(lastCheckin) {
  const now = new Date();
  const lastCheckinDate = new Date(lastCheckin);
  const timeDifference = now - lastCheckinDate;
  const oneWeekInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

  return timeDifference <= oneWeekInMilliseconds;
}

const zeroPad = (num) => {
  return String(num).padStart(2, '0');
};

const secondsToTime = (secs) => {
  const hours = Math.floor(secs / (60 * 60));

  const divisor_for_minutes = secs % (60 * 60);
  const minutes = Math.floor(divisor_for_minutes / 60);

  const divisor_for_seconds = divisor_for_minutes % 60;
  const seconds = Math.ceil(divisor_for_seconds);

  let formatted = '';

  if (hours > 0) {
    formatted += `${zeroPad(hours)}:`;
  }

  formatted += `${zeroPad(minutes)}:`;
  formatted += `${zeroPad(seconds)}`;

  return formatted;
};

module.exports = { isWithinAWeek,secondsToTime };
