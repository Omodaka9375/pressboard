type KeyboardShortcutsProps = {
  isOpen: boolean;
  onClose: () => void;
};

const shortcuts = [
  {
    category: 'General',
    items: [
      { keys: 'Ctrl + Z', action: 'Undo' },
      { keys: 'Ctrl + Y', action: 'Redo' },
      { keys: 'Ctrl + Shift + Z', action: 'Redo' },
      { keys: '?', action: 'Toggle shortcuts help' },
    ],
  },
  {
    category: 'Components',
    items: [
      { keys: 'R', action: 'Rotate selected component 90°' },
      { keys: 'Delete', action: 'Delete selected component' },
      { keys: 'Backspace', action: 'Delete selected component' },
    ],
  },
  {
    category: 'Canvas',
    items: [
      { keys: 'G', action: 'Toggle snap-to-grid' },
      { keys: 'Escape', action: 'Cancel current operation' },
    ],
  },
  {
    category: '3D Preview',
    items: [
      { keys: 'Left Mouse + Drag', action: 'Orbit view' },
      { keys: 'Right Mouse + Drag', action: 'Pan view' },
      { keys: 'Scroll Wheel', action: 'Zoom' },
    ],
  },
];

const KeyboardShortcuts = ({ isOpen, onClose }: KeyboardShortcutsProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
          padding: '24px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', color: 'var(--text-primary)' }}>
            Keyboard Shortcuts
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: '0 8px',
            }}
          >
            ×
          </button>
        </div>

        {shortcuts.map((section) => (
          <div key={section.category} style={{ marginBottom: '20px' }}>
            <h3
              style={{
                margin: '0 0 10px 0',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                borderBottom: '1px solid var(--border-light)',
                paddingBottom: '6px',
              }}
            >
              {section.category}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {section.items.map((item, i) => (
                <div
                  key={i}
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <span style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                    {item.action}
                  </span>
                  <kbd
                    style={{
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      fontSize: '12px',
                      fontFamily: 'monospace',
                      color: 'var(--text-primary)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    {item.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            color: 'var(--text-muted)',
            fontSize: '12px',
          }}
        >
          Press{' '}
          <kbd
            style={{
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '11px',
              color: 'var(--text-primary)',
            }}
          >
            ?
          </kbd>{' '}
          to toggle this panel
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
