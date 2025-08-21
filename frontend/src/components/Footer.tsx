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
            className="flex items-center space-x-2 hover:text-blue-600 transition-colors group"
            onMouseEnter={(e) => {
              const svgDiv = e.currentTarget.querySelector('[data-svg-container]') as HTMLDivElement
              if (svgDiv) {
                svgDiv.style.filter = 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(220deg) brightness(104%) contrast(97%)'
              }
            }}
            onMouseLeave={(e) => {
              const svgDiv = e.currentTarget.querySelector('[data-svg-container]') as HTMLDivElement
              if (svgDiv) {
                svgDiv.style.filter = 'none'
              }
            }}
          >
            <div 
              data-svg-container
              className="w-[28px] h-[20px] transition-all"
              style={{
                filter: 'none'
              }}
            >
              <img 
                src="/mobile-planet.svg" 
                alt="Crafted AI" 
                className="w-full h-full"
              />
            </div>
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