import hexRgb from 'hex-rgb';
const hexToRgba = (hex: string) => {
  const rgba = hexRgb(hex);
  return `rgba(${rgba.red}, ${rgba.green}, ${rgba.blue}, ${rgba.alpha})`;
};

export default hexToRgba;
