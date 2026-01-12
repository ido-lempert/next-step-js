#!/bin/bash
# Create simple SVG-based PNG icons for the extension

# Function to create an icon using ImageMagick (if available) or a placeholder
create_icon() {
    local size=$1
    local output=$2
    
    # Create a simple SVG icon
    cat > /tmp/icon.svg << 'SVGEOF'
<svg width="128" height="128" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="128" height="128" rx="24" fill="url(#grad)"/>
  <path d="M 40 64 L 56 80 L 88 48" stroke="white" stroke-width="8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
SVGEOF
    
    # Try to convert with ImageMagick if available
    if command -v convert &> /dev/null; then
        convert -background none /tmp/icon.svg -resize ${size}x${size} "$output"
    elif command -v magick &> /dev/null; then
        magick -background none /tmp/icon.svg -resize ${size}x${size} "$output"
    else
        # Fallback: just copy the SVG as a placeholder
        cp /tmp/icon.svg "${output%.png}.svg"
        # Create an empty PNG as placeholder
        echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > "$output"
    fi
}

# Create icons in different sizes
create_icon 16 icon-16.png
create_icon 48 icon-48.png
create_icon 128 icon-128.png

echo "Icons created (or placeholders generated)"
ls -la *.png 2>/dev/null || echo "Note: Install ImageMagick for proper icon generation"
