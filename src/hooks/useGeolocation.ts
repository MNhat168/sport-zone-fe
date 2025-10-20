import { useState, useEffect, useCallback, useRef } from 'react';
import geolocationService, { type GeolocationPosition, type GeolocationError, type GeolocationOptions } from '@/utils/geolocation/geolocation-service';

export interface UseGeolocationState {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
  supported: boolean;
  permission: PermissionState | 'unknown';
}

export interface UseGeolocationReturn extends UseGeolocationState {
  getCurrentPosition: (options?: GeolocationOptions) => Promise<void>;
  watchPosition: (options?: GeolocationOptions) => void;
  clearWatch: () => void;
  getCoordinates: (options?: GeolocationOptions) => Promise<{ lat?: number; lng?: number } | null>;
  requestPermission: () => Promise<boolean>;
  checkPermission: () => Promise<void>;
}

/**
 * React hook for geolocation functionality
 * @param autoGetPosition - Whether to automatically get position on mount
 * @param options - Default geolocation options
 * @returns Geolocation state and methods
 */
export const useGeolocation = (
  autoGetPosition: boolean = false,
  options: GeolocationOptions = {}
): UseGeolocationReturn => {
  const [state, setState] = useState<UseGeolocationState>({
    position: null,
    error: null,
    loading: false,
    supported: 'geolocation' in navigator,
    permission: 'unknown'
  });

  const watchIdRef = useRef<number | null>(null);

  // Check permission on mount
  useEffect(() => {
    const checkInitialPermission = async () => {
      const permission = await geolocationService.checkPermission();
      setState(prev => ({ ...prev, permission }));
    };

    if (state.supported) {
      checkInitialPermission();
    }
  }, [state.supported]);

  // (callbacks defined below)

  // Cleanup watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        geolocationService.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const getCurrentPosition = useCallback(async (customOptions?: GeolocationOptions) => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser'
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await geolocationService.getCurrentPosition({
        ...options,
        ...customOptions
      });

      if (result.success && result.data) {
        setState(prev => ({
          ...prev,
          position: result.data!,
          error: null,
          loading: false
        }));
      } else {
        setState(prev => ({
          ...prev,
          error: result.error!,
          loading: false
        }));
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Unexpected error occurred while getting position'
        },
        loading: false
      }));
    }
  }, [state.supported, options]);

  const watchPosition = useCallback((customOptions?: GeolocationOptions) => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser'
        }
      }));
      return;
    }

    // Clear existing watch
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch(watchIdRef.current);
    }

    const watchId = geolocationService.watchPosition(
      (position: GeolocationPosition) => {
        setState(prev => ({
          ...prev,
          position,
          error: null,
          loading: false
        }));
      },
      (error: GeolocationError) => {
        setState(prev => ({
          ...prev,
          error,
          loading: false
        }));
      },
      { ...options, ...customOptions }
    );

    if (watchId !== null) {
      watchIdRef.current = watchId;
    }
  }, [state.supported, options]);

  const clearWatch = useCallback(() => {
    if (watchIdRef.current !== null) {
      geolocationService.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  const getCoordinates = useCallback(async (customOptions?: GeolocationOptions) => {
    if (!state.supported) {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser'
        }
      }));
      return null;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await geolocationService.getCoordinates({
        ...options,
        ...customOptions
      });

      if (result.success) {
        setState(prev => ({
          ...prev,
          error: null,
          loading: false
        }));
        return { lat: result.lat, lng: result.lng };
      } else {
        setState(prev => ({
          ...prev,
          error: result.error!,
          loading: false
        }));
        return null;
      }
    } catch {
      setState(prev => ({
        ...prev,
        error: {
          code: 0,
          message: 'Unexpected error occurred while getting coordinates'
        },
        loading: false
      }));
      return null;
    }
  }, [state.supported, options]);

  const checkPermission = useCallback(async () => {
    if (!state.supported) {
      return;
    }

    try {
      const permission = await geolocationService.checkPermission();
      setState(prev => ({ ...prev, permission }));
    } catch {
      // Ignore permission check errors
    }
  }, [state.supported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!state.supported) {
      return false;
    }

    try {
      const granted = await geolocationService.requestPermission();
      if (granted) {
        await checkPermission();
      }
      return granted;
    } catch {
      return false;
    }
  }, [state.supported, checkPermission]);

  // Auto get position on mount if enabled (after callbacks are defined)
  const autoGet = useCallback(() => {
    if (autoGetPosition && state.supported && !state.loading) {
      getCurrentPosition(options);
    }
  }, [autoGetPosition, state.supported, state.loading, getCurrentPosition, options]);

  useEffect(() => {
    autoGet();
  }, [autoGet]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    getCoordinates,
    requestPermission,
    checkPermission
  };
};

export default useGeolocation;
