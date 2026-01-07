import { create } from 'zustand';

// Notification types
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type DialogType = 'confirm' | 'prompt' | 'alert';

export type Notification = {
  id: string;
  type: NotificationType;
  message: string;
  duration?: number;
};

export type Dialog = {
  id: string;
  type: DialogType;
  title: string;
  message: string;
  defaultValue?: string;
  onConfirm?: (value?: string) => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
};

type NotificationStore = {
  notifications: Notification[];
  dialogs: Dialog[];

  // Toast notifications
  showNotification: (message: string, type?: NotificationType, duration?: number) => void;
  removeNotification: (id: string) => void;

  // Dialogs
  showAlert: (message: string, title?: string) => Promise<void>;
  showConfirm: (message: string, title?: string) => Promise<boolean>;
  showPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
  closeDialog: (id: string, result?: string | boolean) => void;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  dialogs: [],

  showNotification: (message, type = 'info', duration = 4000) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const notification: Notification = { id, message, type, duration };

    set((state) => ({
      notifications: [...state.notifications, notification],
    }));

    if (duration > 0) {
      setTimeout(() => {
        get().removeNotification(id);
      }, duration);
    }
  },

  removeNotification: (id) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  showAlert: (message, title = 'Alert') => {
    return new Promise<void>((resolve) => {
      const id = `dialog-${Date.now()}-${Math.random()}`;
      const dialog: Dialog = {
        id,
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          get().closeDialog(id);
          resolve();
        },
        confirmText: 'OK',
      };

      set((state) => ({
        dialogs: [...state.dialogs, dialog],
      }));
    });
  },

  showConfirm: (message, title = 'Confirm') => {
    return new Promise<boolean>((resolve) => {
      const id = `dialog-${Date.now()}-${Math.random()}`;
      const dialog: Dialog = {
        id,
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          get().closeDialog(id);
          resolve(true);
        },
        onCancel: () => {
          get().closeDialog(id);
          resolve(false);
        },
        confirmText: 'Confirm',
        cancelText: 'Cancel',
      };

      set((state) => ({
        dialogs: [...state.dialogs, dialog],
      }));
    });
  },

  showPrompt: (message, defaultValue = '', title = 'Input') => {
    return new Promise<string | null>((resolve) => {
      const id = `dialog-${Date.now()}-${Math.random()}`;
      const dialog: Dialog = {
        id,
        type: 'prompt',
        title,
        message,
        defaultValue,
        onConfirm: (value) => {
          get().closeDialog(id);
          resolve(value || defaultValue);
        },
        onCancel: () => {
          get().closeDialog(id);
          resolve(null);
        },
        confirmText: 'OK',
        cancelText: 'Cancel',
      };

      set((state) => ({
        dialogs: [...state.dialogs, dialog],
      }));
    });
  },

  closeDialog: (id) => {
    set((state) => ({
      dialogs: state.dialogs.filter((d) => d.id !== id),
    }));
  },
}));
