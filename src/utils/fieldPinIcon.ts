/**
 * Get the primary color of a pin icon based on sportType
 * Colors extracted from SVG files
 */
export function getPinColor(sportType: string | undefined): string {
  const sportTypeToColor: Record<string, string> = {
    football: '#0cc0df',    // Cyan
    tennis: '#7ed957',      // Green
    badminton: '#38b6ff',   // Light blue
    pickleball: '#00bf63',  // Dark green
    basketball: '#ff914d',  // Orange
    volleyball: '#004aad',  // Dark blue
    swimming: '#1800ad',    // Very dark blue/purple
    gym: '#ffde59',         // Yellow
  };
  
  return sportType ? (sportTypeToColor[sportType.toLowerCase()] || '#065f46') : '#065f46';
}

/**
 * Get the white icon path for a sport type (for use in badges/cards)
 * @param sportType - The sport type (e.g., 'football', 'tennis', etc.)
 * @returns The path to the white icon, or null if not found
 */
export function getSportWhiteIconPath(sportType: string | undefined): string | null {
  if (!sportType) return null;
  
  const sportTypeToIcon: Record<string, string> = {
    football: '/icons/icons/footbal.white.icon.svg',
    tennis: '/icons/icons/tennis.white.icon.svg',
    badminton: '/icons/icons/batminton.white.icon.svg',
    basketball: '/icons/icons/basketball.white.icon.svg',
    volleyball: '/icons/icons/volleyball.white.icon.svg',
    swimming: '/icons/icons/swimming.white.icon.svg',
    gym: '/icons/icons/gym.white.icon.svg',
    // Note: pickleball doesn't have a white icon, will return null
  };
  
  return sportTypeToIcon[sportType.toLowerCase()] || null;
}

/**
 * Utility function to create a marker with field name label on top
 * @param fieldName - The name of the field to display
 * @param sportType - The sport type of the field
 * @param L - Leaflet library instance
 * @param mapZoom - Current zoom level of the map (optional, for hiding label when zoomed out)
 * @returns Leaflet DivIcon with icon and label
 */
export function getFieldPinIconWithLabel(fieldName: string, sportType: string | undefined, L: any, mapZoom?: number): L.DivIcon {
  const icon = getFieldPinIcon(sportType, L);
  const iconUrl = (icon.options as any).iconUrl || 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png';
  const iconSize = (icon.options as any).iconSize || [25, 41];
  const iconAnchor = (icon.options as any).iconAnchor || [12, 41];

  // Hide label when zoomed out (zoom < 11)
  // If mapZoom is undefined, show label by default (for initial render)
  const showLabel = mapZoom === undefined || mapZoom >= 11;

  // Get pin color for text
  const pinColor = getPinColor(sportType);

  // Don't truncate - let it wrap
  const displayName = fieldName;

  return L.divIcon({
    className: 'custom-field-marker',
    html: `
      <div style="
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
      ">
        ${showLabel ? `
        <div style="
          background: transparent;
          padding: 2px 6px;
          font-size: 10px;
          font-weight: 700;
          color: ${pinColor};
          margin-bottom: 3px;
          pointer-events: none;
          line-height: 1.3;
          max-width: 120px;
          word-wrap: break-word;
          text-align: center;
          white-space: normal;
          text-shadow: 
            -1px -1px 0 #fff,
            1px -1px 0 #fff,
            -1px 1px 0 #fff,
            1px 1px 0 #fff,
            -2px 0 0 #fff,
            2px 0 0 #fff,
            0 -2px 0 #fff,
            0 2px 0 #fff;
        ">
          ${displayName}
        </div>
        ` : ''}
        <img 
          src="${iconUrl}" 
          style="
            width: ${iconSize[0]}px;
            height: ${iconSize[1]}px;
            display: block;
          "
          alt="field marker"
        />
      </div>
    `,
    iconSize: showLabel ? [Math.max(iconSize[0], 120), iconSize[1] + 25] : iconSize,
    iconAnchor: showLabel ? [Math.max(iconSize[0], 120) / 2, iconSize[1] + 25] : iconAnchor,
    popupAnchor: showLabel ? [0, -(iconSize[1] + 25)] : [0, -iconSize[1]],
  });
}

/**
 * Utility function to get the appropriate pin icon for a field based on its sportType
 * @param sportType - The sport type of the field (e.g., 'football', 'tennis', etc.)
 * @param L - Leaflet library instance
 * @returns Leaflet Icon object for the sport type, or default icon if sportType is not supported
 */
export function getFieldPinIcon(sportType: string | undefined, L: any): L.Icon {
  // Map sportType to icon path
  const sportTypeToIcon: Record<string, string> = {
    football: '/icons/pin.icons/football.pin.svg',
    tennis: '/icons/pin.icons/tennis.pin.svg',
    badminton: '/icons/pin.icons/badminton.pin.svg',
    pickleball: '/icons/pin.icons/pickleball.pin.svg',
    basketball: '/icons/pin.icons/basketball.pin.svg',
    volleyball: '/icons/pin.icons/volleyball.pin.svg',
    swimming: '/icons/pin.icons/swimming.pin.svg',
    gym: '/icons/pin.icons/gym.pin.svg',
  };

  // Get icon path for the sport type, or null if not found
  const iconPath = sportType ? sportTypeToIcon[sportType.toLowerCase()] : null;

  // If we have a custom icon for this sport type, use it
  if (iconPath) {
    return L.icon({
      iconUrl: iconPath,
      iconSize: [40, 50], // Adjust based on SVG dimensions
      iconAnchor: [20, 50], // Anchor point at the bottom center of the icon
      popupAnchor: [0, -50], // Popup appears above the icon
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      shadowSize: [41, 41],
      shadowAnchor: [12, 41],
    });
  }

  // Default icon for unsupported sport types (unknown, etc.)
  return L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

