export default function Footer() {
  return (
    <footer className="pb-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-center space-x-2 text-gray-500">
          <span className="text-sm">built by</span>
          <a 
            href="https://crafted.app/ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
          >
            <img 
              src="/mobile-planet.svg" 
              alt="Crafted AI" 
              className="w-[28px] h-[20px]"
            />
            <span 
              className="text-sm font-medium"
              style={{ fontFamily: "'Atkinson Hyperlegible Mono', monospace" }}
            >
              crafted.app/ai
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}