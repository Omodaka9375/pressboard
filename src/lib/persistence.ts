import type { Project } from '../types';
import { isTauri, saveFileNative, openFileNative } from './tauri';

const STORAGE_KEY = 'diypcb_project';

/**
 * Save project to localStorage
 */
export const saveProject = (project: Project): void => {
  try {
    const json = JSON.stringify(project);
    localStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    console.error('Failed to save project:', error);
  }
};

/**
 * Load project from localStorage
 */
export const loadProject = (): Project | null => {
  try {
    const json = localStorage.getItem(STORAGE_KEY);
    if (!json) return null;

    return JSON.parse(json) as Project;
  } catch (error) {
    console.error('Failed to load project:', error);
    return null;
  }
};

/**
 * Clear saved project
 */
export const clearProject = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

/**
 * Download/Save project as JSON file (uses native dialog in Tauri)
 */
export const downloadProjectJSON = async (project: Project): Promise<void> => {
  const json = JSON.stringify(project, null, 2);
  const filename = `${project.name.replace(/\s+/g, '_')}.json`;

  // Use native file dialog in Tauri
  if (isTauri()) {
    const saved = await saveFileNative(filename, json, [
      { name: 'PressBoard Project', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ]);
    if (!saved) {
      console.warn('Save cancelled or failed');
    }
    return;
  }

  // Fallback to browser download
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/**
 * Load project from JSON file (uses native dialog in Tauri)
 */
export const loadProjectFromFile = (file: File): Promise<Project> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const json = e.target?.result as string;
        const project = JSON.parse(json) as Project;
        resolve(project);
      } catch {
        reject(new Error('Invalid project file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
};

/**
 * Open project file with native dialog (Tauri only)
 */
export const openProjectWithNativeDialog = async (): Promise<Project | null> => {
  if (!isTauri()) return null;

  try {
    const json = await openFileNative([
      { name: 'PressBoard Project', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] },
    ]);

    if (!json) return null;

    const project = JSON.parse(json) as Project;
    return project;
  } catch (error) {
    console.error('Failed to open project:', error);
    throw new Error('Invalid project file');
  }
};
