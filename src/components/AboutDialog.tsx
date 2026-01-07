type AboutDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

const AboutDialog = ({ isOpen, onClose }: AboutDialogProps) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-sidebar)',
          borderRadius: '12px',
          padding: '24px',
          maxWidth: '400px',
          width: '90%',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          color: 'var(--text-primary)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🔌</div>
          <h2 style={{ margin: '0 0 4px 0', fontSize: '24px' }}>PressBoard</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '13px' }}>
            3D-Printable PCB Designer
          </p>
        </div>

        <div
          style={{
            background: 'var(--btn-bg)',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <p style={{ margin: '0 0 12px 0', fontSize: '13px' }}>
            Design circuit boards with copper tape channels for 3D printing. Create functional
            prototypes without traditional PCB manufacturing.
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
            Version 1.0.0
          </p>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
            Created by
          </div>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>Branislav Djalic</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
          <a
            href="https://github.com/Omodaka9375/pressboard"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--btn-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            <span>📦</span> Source Code on GitHub
          </a>
          <a
            href="https://github.com/Omodaka9375/pressboard/issues"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              background: 'var(--btn-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: '13px',
            }}
          >
            <span>🐛</span> Report Issues
          </a>
        </div>

        <div
          style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            paddingTop: '16px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <p style={{ margin: '0 0 4px 0' }}>MIT License</p>
          <p style={{ margin: 0 }}>© 2026 Branislav Djalic. All rights reserved.</p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '16px',
            padding: '10px',
            background: 'var(--btn-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            color: 'var(--text-primary)',
            cursor: 'pointer',
            fontSize: '13px',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default AboutDialog;
