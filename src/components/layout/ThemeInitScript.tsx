export function ThemeInitScript() {
  const script = `
    (function() {
      var theme = localStorage.getItem('openclaw-theme') || 'dark';
      document.documentElement.setAttribute('data-theme', theme);
    })();
  `
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}
