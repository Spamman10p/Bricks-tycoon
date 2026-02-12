import React from 'react';

interface Stats {
  totalClicks: number;
  totalEarned: number;
  timePlayed: number; // in seconds
  bestCombo: number;
  totalPrestiges: number;
  highestBalance: number;
  totalSpent: number;
  startDate: string; // ISO date string
}

interface StatsProps {
  stats: Stats;
}

const formatNumber = (num: number): string => {
  if (num === 0) return '0';
  if (num < 1000) return num.toLocaleString();
  if (num < 1000000) return `${(num / 1000).toFixed(1)}k`;
  if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num < 1000000000000) return `${(num / 1000000000).toFixed(1)}B`;
  return `${(num / 1000000000000).toFixed(1)}T`;
};

const formatDuration = (seconds: number): string => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.slice(0, 2).join(' '); // Show max 2 parts
};

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const StatsCard: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div style={styles.card}>
    <div style={styles.label}>{label}</div>
    <div style={styles.value}>{value}</div>
  </div>
);

export const Stats: React.FC<StatsProps> = ({ stats }) => {
  const statsData = [
    { label: 'Total Clicks', value: formatNumber(stats.totalClicks) },
    { label: 'Total Earned', value: formatNumber(stats.totalEarned) },
    { label: 'Time Played', value: formatDuration(stats.timePlayed) },
    { label: 'Best Combo', value: formatNumber(stats.bestCombo) },
    { label: 'Prestiges', value: formatNumber(stats.totalPrestiges) },
    { label: 'Highest Balance', value: formatNumber(stats.highestBalance) },
    { label: 'Total Spent', value: formatNumber(stats.totalSpent) },
    { label: 'Started', value: formatDate(stats.startDate) },
  ];

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Lifetime Stats</h2>
      <div style={styles.grid}>
        {statsData.map((stat, index) => (
          <StatsCard key={index} label={stat.label} value={stat.value} />
        ))}
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    backgroundColor: '#1a1a2e',
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    border: '1px solid #2d2d44',
  },
  title: {
    color: '#fff',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 20px 0',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '12px',
  },
  card: {
    backgroundColor: '#252542',
    borderRadius: '8px',
    padding: '16px',
    textAlign: 'center',
    border: '1px solid #3d3d5c',
    transition: 'transform 0.2s, border-color 0.2s',
  },
  label: {
    color: '#8b8b9a',
    fontSize: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '8px',
  },
  value: {
    color: '#00d4ff',
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
};

export default Stats;
