import type { SectionId } from '../types';
import { brand, navItems } from '../content';

type FloatingNavProps = {
  activeId: SectionId;
  scrolled: boolean;
  menuOpen: boolean;
  onMenuChange: (open: boolean) => void;
  onNavigate: (id: SectionId) => void;
};

export function FloatingNav({ activeId, scrolled, menuOpen, onMenuChange, onNavigate }: FloatingNavProps) {
  return (
    <header className={`nav ${scrolled ? 'is-scrolled' : ''}`}>
      <button className="nav__brand" type="button" onClick={() => onNavigate('intro')}>
        {brand.name}
      </button>
      <nav className="nav__links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <button
            className={`nav__link ${activeId === item.id ? 'is-active' : ''}`}
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <button
        className="nav__toggle"
        type="button"
        aria-expanded={menuOpen}
        aria-controls="mobile-menu"
        onClick={() => onMenuChange(!menuOpen)}
      >
        {menuOpen ? 'Close' : 'Menu'}
      </button>
    </header>
  );
}
