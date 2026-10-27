export function rasterizeSvg(source: string, size: { pixelWidth: number; pixelHeight: number }): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(new Blob([source], { type: 'image/svg+xml;charset=utf-8' }));
    let finished = false;
    const finish = (blob: Blob | null, error?: unknown) => {
      if (finished) return;
      finished = true;
      image.onload = null;
      image.onerror = null;
      URL.revokeObjectURL(url);
      if (blob) resolve(blob);
      else reject(error instanceof Error ? error : new Error('Could not create the PNG image.'));
    };
    image.onerror = () => finish(null, new Error('Could not render the circuit image.'));
    image.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.ceil(size.pixelWidth);
        canvas.height = Math.ceil(size.pixelHeight);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('The browser could not create an image canvas.');
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => finish(blob), 'image/png');
      } catch (error) { finish(null, error); }
    };
    try { image.src = url; }
    catch (error) { finish(null, error); }
  });
}
