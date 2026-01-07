import { useState, useEffect } from 'react';
import { useNotificationStore } from '../stores/notificationStore';
import './DialogContainer.css';

export const DialogContainer = () => {
  const { dialogs } = useNotificationStore();
  const [inputValues, setInputValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize input values for prompt dialogs
    dialogs.forEach((dialog) => {
      if (dialog.type === 'prompt' && !inputValues[dialog.id]) {
        setInputValues((prev) => ({
          ...prev,
          [dialog.id]: dialog.defaultValue || '',
        }));
      }
    });
  }, [dialogs]);

  if (dialogs.length === 0) return null;

  return (
    <div className="dialog-overlay">
      {dialogs.map((dialog) => (
        <div key={dialog.id} className="dialog-backdrop">
          <div className="dialog">
            <div className="dialog-header">
              <h3 className="dialog-title">{dialog.title}</h3>
            </div>

            <div className="dialog-body">
              <p className="dialog-message">{dialog.message}</p>

              {dialog.type === 'prompt' && (
                <input
                  type="text"
                  className="dialog-input"
                  value={inputValues[dialog.id] || dialog.defaultValue || ''}
                  onChange={(e) =>
                    setInputValues((prev) => ({
                      ...prev,
                      [dialog.id]: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      dialog.onConfirm?.(inputValues[dialog.id]);
                    } else if (e.key === 'Escape') {
                      dialog.onCancel?.();
                    }
                  }}
                  autoFocus
                />
              )}
            </div>

            <div className="dialog-footer">
              {dialog.onCancel && (
                <button
                  className="dialog-button dialog-button-cancel"
                  onClick={() => dialog.onCancel?.()}
                >
                  {dialog.cancelText || 'Cancel'}
                </button>
              )}
              <button
                className="dialog-button dialog-button-confirm"
                onClick={() => {
                  if (dialog.type === 'prompt') {
                    dialog.onConfirm?.(inputValues[dialog.id]);
                  } else {
                    dialog.onConfirm?.();
                  }
                }}
              >
                {dialog.confirmText || 'OK'}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
