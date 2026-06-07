'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

export function Header() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('pp-theme') as 'dark' | 'light' | null;
    if (saved) setTheme(saved);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('pp-theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
    } else {
      document.documentElement.classList.remove('light');
    }
  }, [theme]);

  const nav = [
    { href: '/', label: 'Policies' },
    { href: '/officials', label: 'Officials' },
    { href: '/about', label: 'About' },
  ];

  return (
    <header style={{
      background: 'var(--bg-2)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: '60px',
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <span style={{
            background: 'var(--accent)',
            color: '#0a0a0b',
            fontFamily: 'var(--font-mono)',
            fontWeight: 700,
            fontSize: '0.72rem',
            padding: '0.25em 0.5em',
            borderRadius: '4px',
            letterSpacing: '0.05em',
          }}>PP</span>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }} className="hide-mobile">
            Public Profile
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: pathname === href ? 'var(--accent)' : 'var(--text-2)',
                background: pathname === href ? 'var(--accent-dim)' : 'transparent',
                transition: 'all var(--transition)',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
        </nav>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-ghost btn-sm"
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            style={{ padding: '0.35rem 0.6rem', minHeight: '36px' }}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          {/* Admin Link */}
          <Link href="/admin" className="btn btn-secondary btn-sm hide-mobile">
            Admin
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            className="btn btn-ghost btn-sm hide-desktop"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
            style={{ padding: '0.35rem 0.6rem', minHeight: '36px', fontSize: '1.1rem' }}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '60px',
          left: 0,
          right: 0,
          background: 'var(--bg-2)',
          borderBottom: '1px solid var(--border)',
          padding: '0.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          zIndex: 99,
        }}>
          {nav.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              style={{
                padding: '0.6rem 0.875rem',
                borderRadius: 'var(--radius)',
                fontSize: '0.9rem',
                fontWeight: 500,
                color: pathname === href ? 'var(--accent)' : 'var(--text)',
                background: pathname === href ? 'var(--accent-dim)' : 'transparent',
                textDecoration: 'none',
              }}
            >
              {label}
            </Link>
          ))}
          <Link
            href="/admin"
            onClick={() => setMenuOpen(false)}
            style={{
              padding: '0.6rem 0.875rem',
              borderRadius: 'var(--radius)',
              fontSize: '0.9rem',
              fontWeight: 500,
              color: 'var(--text-2)',
              textDecoration: 'none',
              marginTop: '0.25rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '0.875rem',
            }}
          >
            ⚙️ Admin
          </Link>
        </div>
      )}
    </header>
  );
}
