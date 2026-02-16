export function AboutBar() {
  return (
    <div className="border-t border-white/20" style={{ backgroundColor: '#006a71' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 text-center">
        <a
          href="https://www.cgdev.org/cdi"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/80 hover:text-white text-sm hover:underline"
        >
          About CDI and key findings
        </a>
      </div>
    </div>
  );
}
