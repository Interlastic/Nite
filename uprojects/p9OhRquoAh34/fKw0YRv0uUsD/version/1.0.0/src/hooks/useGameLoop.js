import { useEffect, useRef, useCallback } from 'react';
import { GAME_CONFIG } from '../utils/gameConstants';

/**
 * Custom hook for managing game loop
 * @param {Function} tickCallback - Function to call on each game tick
 * @param {Function} saveCallback - Function to call periodically to save game
 * @param {boolean} isRunning - Whether the game loop should be running
 */
export function useGameLoop(tickCallback, saveCallback, isRunning = true) {
  const tickIntervalRef = useRef(null);
  const saveIntervalRef = useRef(null);
  const lastTickRef = useRef(Date.now());

  const startGameLoop = useCallback(() => {
    // Clear existing intervals
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
    }
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
    }

    // Start tick interval
    tickIntervalRef.current = setInterval(() => {
      if (tickCallback) {
        tickCallback();
      }
      lastTickRef.current = Date.now();
    }, GAME_CONFIG.TICK_RATE);

    // Start save interval
    saveIntervalRef.current = setInterval(() => {
      if (saveCallback) {
        saveCallback();
      }
    }, GAME_CONFIG.SAVE_INTERVAL);
  }, [tickCallback, saveCallback]);

  const stopGameLoop = useCallback(() => {
    if (tickIntervalRef.current) {
      clearInterval(tickIntervalRef.current);
      tickIntervalRef.current = null;
    }
    if (saveIntervalRef.current) {
      clearInterval(saveIntervalRef.current);
      saveIntervalRef.current = null;
    }
  }, []);

  // Start/stop loop based on isRunning
  useEffect(() => {
    if (isRunning) {
      startGameLoop();
    } else {
      stopGameLoop();
    }

    return () => {
      stopGameLoop();
    };
  }, [isRunning, startGameLoop, stopGameLoop]);

  // Force immediate tick
  const forceTick = useCallback(() => {
    if (tickCallback) {
      tickCallback();
      lastTickRef.current = Date.now();
    }
  }, [tickCallback]);

  // Force immediate save
  const forceSave = useCallback(() => {
    if (saveCallback) {
      saveCallback();
    }
  }, [saveCallback]);

  return {
    forceTick,
    forceSave,
    isRunning: !!tickIntervalRef.current,
  };
}