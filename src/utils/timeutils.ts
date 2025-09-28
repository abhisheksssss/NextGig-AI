export function timeAgo(dataString: string): string {
  const now = new Date();
  const date = new Date(dataString);
  const second = Math.floor((now.getTime() - date.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const units: { unit: Intl.RelativeTimeFormatUnit; seconds: number }[] = [
    { unit: 'year', seconds: 31536000 },
    { unit: 'month', seconds: 2592000 },
    { unit: 'day', seconds: 86400 },
    { unit: 'hour', seconds: 3600 },
    { unit: 'minute', seconds: 60 },
    { unit: 'second', seconds: 1 },
  ];

  for (const { unit, seconds: unitSeconds } of units) {
    const value = Math.floor(second / unitSeconds);
    if (value >= 1) return rtf.format(-value, unit);
  }

  return 'just now';
}
