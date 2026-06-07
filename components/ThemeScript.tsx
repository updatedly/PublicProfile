'use client';

export function ThemeScript() {
  const script = `
    (function() {
      try {
        var theme = localStorage.getItem('pp-theme') || 'dark';
        if (theme === 'light') {
          document.documentElement.classList.add('light');
        } else {
          document.documentElement.classList.remove('light');
        }
      } catch(e) {}
    })();
  `;
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
