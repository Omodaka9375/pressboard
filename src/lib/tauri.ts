/**
 * Tauri integration for native desktop features
 */

// Check if running in Tauri environment
export const isTauri = () => {
  return typeof window !== 'undefined' && '__TAURI__' in window;
};

// Native file save with Tauri
export const saveFileNative = async (
  filename: string,
  content: string | Blob,
  filters?: Array<{ name: string; extensions: string[] }>
): Promise<boolean> => {
  if (!isTauri()) return false;

  try {
    const { save } = await import('@tauri-apps/plugin-dialog');
    const { writeTextFile, writeFile } = await import('@tauri-apps/plugin-fs');

    const filePath = await save({
      defaultPath: filename,
      filters: filters || [
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    });

    if (!filePath) return false;

    if (typeof content === 'string') {
      await writeTextFile(filePath, content);
    } else {
      const arrayBuffer = await content.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      await writeFile(filePath, uint8Array);
    }

    return true;
  } catch (error) {
    console.error('Tauri save file failed:', error);
    return false;
  }
};

// Native file open with Tauri
export const openFileNative = async (
  filters?: Array<{ name: string; extensions: string[] }>
): Promise<string | null> => {
  if (!isTauri()) return null;

  try {
    const { open } = await import('@tauri-apps/plugin-dialog');
    const { readTextFile } = await import('@tauri-apps/plugin-fs');

    const selected = await open({
      multiple: false,
      filters: filters || [
        {
          name: 'All Files',
          extensions: ['*'],
        },
      ],
    });

    if (!selected || typeof selected !== 'string') return null;

    const contents = await readTextFile(selected);
    return contents;
  } catch (error) {
    console.error('Tauri open file failed:', error);
    return null;
  }
};

// Show native notification
export const showNativeNotification = async (title: string, body: string) => {
  if (!isTauri()) return;

  try {
    // Tauri 2.x uses permissions API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch (error) {
    console.error('Native notification failed:', error);
  }
};

// Open external URL in default browser
export const openExternal = async (url: string) => {
  if (!isTauri()) {
    window.open(url, '_blank');
    return;
  }

  try {
    const { open } = await import('@tauri-apps/plugin-shell');
    await open(url);
  } catch (error) {
    console.error('Open external failed:', error);
  }
};
