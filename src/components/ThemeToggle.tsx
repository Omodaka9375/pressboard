import { useThemeStore } from '../stores/themeStore';

const styles: Record<string, React.CSSProperties> = {
  button: {
    background: 'transparent',
    border: '1px solid var(--btn-border)',
    borderRadius: '6px',
    padding: '6px 10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: 'var(--text-primary)',
    fontSize: '0.85rem',
    transition: 'all 0.2s',
  },
  icon: {
    fontSize: '1rem',
  },
};

/** Toggle button for light/dark theme. */
export function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === 'dark';

  return (
    <button
      style={styles.button}
      onClick={toggleTheme}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span style={styles.icon}>{isDark ? '☀️' : '🌙'}</span>
      {isDark ? 'Light' : 'Dark'}
    </button>
  );
}
