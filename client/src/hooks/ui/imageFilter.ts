// Filter definitions with CSS filter properties
export type FilterType = {
    id: string;
    name: string;
    filter: string;
  };
  
  // Collection of preset filters
  export const filters: FilterType[] = [
    { id: 'none', name: 'Original', filter: 'none' },
    { id: 'grayscale', name: 'Grayscale', filter: 'grayscale(100%)' },
    { id: 'sepia', name: 'Sepia', filter: 'sepia(70%)' },
    { id: 'vintage', name: 'Vintage', filter: 'sepia(30%) contrast(110%) brightness(110%) saturate(85%)' },
    { id: 'cool', name: 'Cool', filter: 'saturate(85%) hue-rotate(20deg) contrast(110%)' },
    { id: 'warm', name: 'Warm', filter: 'saturate(120%) hue-rotate(-10deg) contrast(105%)' },
    { id: 'dramatic', name: 'Dramatic', filter: 'contrast(130%) brightness(90%) saturate(110%)' },
    { id: 'sharp', name: 'Sharp', filter: 'contrast(150%) brightness(100%)' },
    { id: 'clarity', name: 'Clarity', filter: 'contrast(120%) brightness(110%)' },
    { id: 'fade', name: 'Fade', filter: 'brightness(110%) saturate(80%) contrast(90%)' },
    { id: 'boost', name: 'Boost', filter: 'contrast(110%) brightness(110%) saturate(120%)' },
    { id: 'matte', name: 'Matte', filter: 'contrast(105%) brightness(105%) saturate(90%)' },
  ];
  
  // Predefined aspect ratios
  export type AspectRatioType = {
    id: string;
    name: string;
    value: number | null; // null means free-form
  };
  
  export const aspectRatios: AspectRatioType[] = [
    { id: 'free', name: 'Free', value: null },
    { id: 'square', name: '1:1', value: 1 },
    { id: 'portrait', name: '3:4', value: 3/4 },
    { id: 'landscape', name: '4:3', value: 4/3 },
    { id: 'wide', name: '16:9', value: 16/9 },
    { id: 'pinterest', name: '2:3', value: 2/3 },
    { id: 'widescreen', name: '21:9', value: 21/9 },
    { id: 'instagram', name: '4:5', value: 4/5 },
    { id: 'facebook', name: '9:16', value: 9/16 },
  ];
  
  // Helper function to apply a filter to a canvas
  export const applyFilterToCanvas = (
    canvas: HTMLCanvasElement, 
    filterId: string
  ): Promise<Blob> => {
    return new Promise((resolve) => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const filter = filters.find(f => f.id === filterId) || filters[0];
      
      // Create a temporary canvas to apply the filter
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) return;
      
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      
      // Set the filter and draw the original canvas onto the temp canvas
      tempCtx.filter = filter.filter;
      tempCtx.drawImage(canvas, 0, 0);
      
      // Convert to blob
      tempCanvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        }
      }, 'image/jpeg', 0.95);
    });
  };
  
  // Convert a data URL to a Blob
  export const dataURLtoBlob = (dataURL: string): Blob => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new Blob([u8arr], { type: mime });
  };
  