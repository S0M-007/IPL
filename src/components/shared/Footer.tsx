import { Globe, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="mt-auto py-6"
      style={{
        borderTop: '1px solid var(--glass-border)',
        color: 'var(--text-muted)',
      }}
    >
      <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <p>IPL Auction Game &mdash; Built for fun. Not affiliated with IPL or BCCI.</p>

        <div className="flex items-center gap-4">
          <a href="#" aria-label="Website" className="hover:text-white transition-colors">
            <Globe size={15} />
          </a>
          <a href="#" aria-label="Links" className="hover:text-white transition-colors">
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    </footer>
  );
}
