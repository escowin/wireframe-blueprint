import React, { useState, useRef, useEffect, ReactNode } from 'react'
import './ResizablePanel.scss'

interface ResizablePanelProps {
  children: ReactNode
  minWidth?: number
  maxWidth?: number
  defaultWidth?: number
  onWidthChange?: (width: number) => void
  resizable?: boolean
  position?: 'left' | 'right'
  className?: string
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  children,
  minWidth = 200,
  maxWidth = 600,
  defaultWidth = 300,
  onWidthChange,
  resizable = true,
  position = 'left',
  className = ''
}) => {
  const [width, setWidth] = useState(defaultWidth)
  const [isResizing, setIsResizing] = useState(false)
  const [startX, setStartX] = useState(0)
  const [startWidth, setStartWidth] = useState(0)
  const panelRef = useRef<HTMLDivElement>(null)

  // Load saved width from localStorage on mount
  useEffect(() => {
    const savedWidth = localStorage.getItem(`panel-width-${position}`)
    if (savedWidth) {
      const parsedWidth = parseInt(savedWidth, 10)
      if (parsedWidth >= minWidth && parsedWidth <= maxWidth) {
        setWidth(parsedWidth)
      }
    }
  }, [position, minWidth, maxWidth])

  // Save width to localStorage when it changes
  useEffect(() => {
    localStorage.setItem(`panel-width-${position}`, width.toString())
    onWidthChange?.(width)
  }, [width, position, onWidthChange])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return
    
    e.preventDefault()
    setIsResizing(true)
    setStartX(e.clientX)
    setStartWidth(width)
    
    // Add global event listeners
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    
    // Add class to body for global styling
    document.body.classList.add('resizing')
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    
    const deltaX = position === 'left' ? e.clientX - startX : startX - e.clientX
    const newWidth = Math.max(minWidth, Math.min(maxWidth, startWidth + deltaX))
    
    setWidth(newWidth)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    
    // Remove global event listeners
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    
    // Remove class from body
    document.body.classList.remove('resizing')
  }

  const handleMouseEnter = () => {
    if (resizable && !isResizing) {
      document.body.style.cursor = 'col-resize'
    }
  }

  const handleMouseLeave = () => {
    if (!isResizing) {
      document.body.style.cursor = ''
    }
  }

  return (
    <div
      ref={panelRef}
      className={`resizable-panel ${className}`}
      style={{ width: `${width}px` }}
    >
      {children}
      {resizable && (
        <div
          className={`resize-handle resize-handle--${position}`}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />
      )}
    </div>
  )
}

export default ResizablePanel 