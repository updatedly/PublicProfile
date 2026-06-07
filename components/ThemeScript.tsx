// Server component - no 'use client' - inlines raw <script> tag to prevent theme flash
export function ThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(){try{var t=localStorage.getItem('pp-theme');if(t==='light'){document.documentElement.classList.add('light')}else{document.documentElement.classList.remove('light')}}catch(e){}})();`,
      }}
    />
  );
}
