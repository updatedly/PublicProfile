'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark'|'light'>('dark');

  useEffect(() => {
    const saved = localStorage.getItem('pp-theme') as 'dark'|'light'|null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pp-theme', next);
    document.documentElement.classList.toggle('light', next === 'light');
  }, [theme]);

  return (
    <>
      <header className="site-header">
        <Link href="/" className="logo">Public <span>Profile</span></Link>
        <nav className="header-nav">
          <Link href="/" className={`nav-btn${pathname === '/' ? ' active' : ''}`}>Tracker</Link>
          <Link href="/officials" className={`nav-btn${pathname.startsWith('/officials') ? ' active' : ''}`}>Officials &amp; Institutions</Link>
          <Link href="/about" className={`nav-btn${pathname === '/about' ? ' active' : ''}`}>About</Link>
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle light/dark">
            {theme === 'dark' ? '🌙' : '☀️'}
          </button>
          <Link href="/admin" className="btn-ghost btn-sm">Admin</Link>
        </nav>
      </header>
      <div className="ticker">
        <div className="ticker-track">
          <span>Public Profile — Ghana Accountability Tracker · 2020 to Present</span>
          <span>Policies · Bills · Government Decisions · Public Figures</span>
          <span>An Updatedely Initiative · Watch breakdowns on YouTube</span>
          <span>Public Profile — Ghana Accountability Tracker · 2020 to Present</span>
          <span>Policies · Bills · Government Decisions · Public Figures</span>
          <span>An Updatedely Initiative · Watch breakdowns on YouTube</span>
        </div>
      </div>
    </>
  );
}
