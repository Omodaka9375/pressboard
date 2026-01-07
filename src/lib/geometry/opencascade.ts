/**
 * Geometry engine module
 * Uses Three.js CSG (three-bvh-csg) for MVP
 * OpenCascade integration available as future upgrade
 */

let initialized = false;

/**
 * Initialize geometry engine
 */
export const initOC = async (): Promise<void> => {
  // three-bvh-csg doesn't need async initialization
  initialized = true;
  return Promise.resolve();
};

/**
 * Check if geometry engine is initialized
 */
export const isOCInitialized = (): boolean => {
  return initialized;
};
