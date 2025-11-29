/**
 * Geolocation Service
 * Provides browser geolocation API integration with error handling and fallbacks
 */

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
  altitudeAccuracy?: number | null;
  heading?: number | null;
  speed?: number | null;
}

export interface GeolocationPosition {
  coords: GeolocationCoordinates;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

export interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export interface GeolocationResult {
  success: boolean;
  data?: GeolocationPosition;
  error?: GeolocationError;
}

class GeolocationService {
  private isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current position using browser geolocation API
   * @param options - Geolocation options
   * @returns Promise with geolocation result
   */
  async getCurrentPosition(options: GeolocationOptions = {}): Promise<GeolocationResult> {
    if (!this.isSupported()) {
      return {
        success: false,
        error: {
          code: 0,
          message: 'Geolocation is not supported by this browser'
        }
      };
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // 5 minutes
      ...options
    };

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position: GeolocationPosition) => {
          resolve({
            success: true,
            data: position
          });
        },
        (error: GeolocationPositionError) => {
          let errorMessage = 'Unknown geolocation error';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'User denied the request for Geolocation';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'The request to get user location timed out';
              break;
          }

          resolve({
            success: false,
            error: {
              code: error.code,
              message: errorMessage
            }
          });
        },
        defaultOptions
      );
    });
  }

  /**
   * Watch position changes
   * @param callback - Function to call when position changes
   * @param errorCallback - Function to call on error
   * @param options - Geolocation options
   * @returns Watch ID for clearing the watch
   */
  watchPosition(
    callback: (position: GeolocationPosition) => void,
    errorCallback?: (error: GeolocationError) => void,
    options: GeolocationOptions = {}
  ): number | null {
    if (!this.isSupported()) {
      errorCallback?.({
        code: 0,
        message: 'Geolocation is not supported by this browser'
      });
      return null;
    }

    const defaultOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
      ...options
    };

    return navigator.geolocation.watchPosition(
      callback,
      (error: GeolocationPositionError) => {
        let errorMessage = 'Unknown geolocation error';
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for Geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }

        errorCallback?.({
          code: error.code,
          message: errorMessage
        });
      },
      defaultOptions
    );
  }

  /**
   * Clear position watch
   * @param watchId - Watch ID returned by watchPosition
   */
  clearWatch(watchId: number): void {
    navigator.geolocation.clearWatch(watchId);
  }

  /**
   * Get coordinates in a simple format for API calls
   * @param options - Geolocation options
   * @returns Promise with lat/lng coordinates
   */
  async getCoordinates(options: GeolocationOptions = {}): Promise<{
    success: boolean;
    lat?: number;
    lng?: number;
    error?: GeolocationError;
  }> {
    const result = await this.getCurrentPosition(options);
    
    if (result.success && result.data) {
      return {
        success: true,
        lat: result.data.coords.latitude,
        lng: result.data.coords.longitude
      };
    }

    return {
      success: false,
      error: result.error
    };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * @param lat1 - First latitude
   * @param lng1 - First longitude
   * @param lat2 - Second latitude
   * @param lng2 - Second longitude
   * @returns Distance in kilometers
   */
  calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Check if geolocation permission is granted
   * @returns Promise with permission status
   */
  async checkPermission(): Promise<PermissionState | 'unknown'> {
    if (!('permissions' in navigator)) {
      return 'unknown' as PermissionState;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
      return permission.state;
    } catch (error) {
      return 'unknown' as PermissionState;
    }
  }

  /**
   * Request geolocation permission
   * @returns Promise with permission result
   */
  async requestPermission(): Promise<boolean> {
    try {
      const result = await this.getCurrentPosition({ timeout: 5000 });
      return result.success;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();
export default geolocationService;
