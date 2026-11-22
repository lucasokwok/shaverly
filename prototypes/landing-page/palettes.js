/* Adicione novas opções ao registro; o seletor é gerado automaticamente. */
(() => {
  'use strict';
  const palettes = [
    { id: '1', label: '1 · Original', colors: {
      primary: '#202734', secondary: '#36415A', accent: '#B7D894', light: '#E0F8C7',
      'secondary-ink': '#E0F8C7', 'surface-ink': '#36415A', 'accent-text': '#B7D894', selection: '#B7D894',
      'selection-ink': '#202734', 'appointment-dark-ink': '#E0F8C7',
    } },
    { id: '2', label: '2 · Petróleo e laranja', colors: {
      primary: '#303841', secondary: '#76ABAE', accent: '#FF5722', light: '#EFE8DD',
      'secondary-ink': '#303841', 'surface-ink': '#303841', 'accent-text': '#76ABAE', selection: '#76ABAE',
      'selection-ink': '#303841', 'appointment-dark-ink': '#303841',
    } },
    { id: '3', label: '3 · Verde oliva', colors: {
      primary: '#455230', secondary: '#637545', accent: '#9BA685', light: '#EBEBD8',
      'secondary-ink': '#EBEBD8', 'surface-ink': '#455230', 'accent-text': '#EBEBD8', selection: '#EBEBD8',
      'selection-ink': '#455230', 'appointment-dark-ink': '#EBEBD8',
    } },
    { id: '4', label: '4 · Oliva e dourado', colors: {
      primary: '#28301C', secondary: '#323D25', accent: '#9A7E3B', light: '#D2CF9A',
      'secondary-ink': '#D2CF9A', 'surface-ink': '#323D25', 'accent-text': '#D2CF9A', selection: '#D2CF9A',
      'selection-ink': '#28301C', 'appointment-dark-ink': '#D2CF9A',
    } },
    { id: '5', label: '5 · Azul e areia', colors: {
      primary: '#579BB1', secondary: '#E1D7C6', accent: '#ECE8DD', light: '#F8F4EA',
      'secondary-ink': '#579BB1', 'surface-ink': '#579BB1', 'accent-text': '#F8F4EA', selection: '#ECE8DD',
      'selection-ink': '#579BB1', 'appointment-dark-ink': '#579BB1',
    } },
    { id: '6', label: '6 · Grafite e sálvia', colors: {
      primary: '#393E46', secondary: '#6D9886', accent: '#F2E7D5', light: '#F7F7F7',
      'secondary-ink': '#393E46', 'surface-ink': '#393E46', 'accent-text': '#F2E7D5', selection: '#F2E7D5',
      'selection-ink': '#393E46', 'appointment-dark-ink': '#393E46',
    } },
  ];
  const storageKey = 'shaverly-prototype-palette';
  const root = document.documentElement;
  function apply(palette) {
    for (const [token, color] of Object.entries(palette.colors)) {
      root.style.setProperty(`--${token}`, color);
    }
    root.dataset.palette = palette.id;
    document.querySelector('meta[name="theme-color"]').content = palette.colors.primary;
    window.dispatchEvent(new Event('shaverly:palettechange'));
  }
  let saved;
  try { saved = localStorage.getItem(storageKey); } catch { /* Funciona sem armazenamento. */ }
  apply(palettes.find(palette => palette.id === saved) || palettes[0]);
  document.addEventListener('DOMContentLoaded', () => {
    const select = document.querySelector('#palette-select');
    for (const palette of palettes) select.add(new Option(palette.label, palette.id));
    select.value = root.dataset.palette;
    select.addEventListener('change', () => {
      apply(palettes.find(palette => palette.id === select.value));
      try { localStorage.setItem(storageKey, select.value); } catch { /* Troca continua disponível. */ }
    });
    document.querySelector('[data-palette-switcher]').hidden = false;
  }, { once: true });
})();
