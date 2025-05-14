"use client"
import { useEffect, useRef, useState } from "react"

const WordCloud = ({ words, width = "100%", height = 300, currentFilter = "all" }) => {
  const containerRef = useRef(null)
  const [hoveredWord, setHoveredWord] = useState(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const wordsRef = useRef([])
  const eventListenersRef = useRef([])
  const mountedRef = useRef(false)

  const sentimentColors = {
    positive: "linear-gradient(135deg, #4cc9f0, #4895ef)",
    neutral: "linear-gradient(135deg, #6c757d, #adb5bd)",
    negative: "linear-gradient(135deg, #f72585, #fe3f40)"
  }

  const cleanupWords = () => {
    if (!mountedRef.current || !containerRef.current) return
    
    // Supprimer les écouteurs d'événements
    eventListenersRef.current.forEach(({ element, handlers }) => {
      if (element && element.removeEventListener) {
        element.removeEventListener("mouseenter", handlers.handleMouseEnter)
        element.removeEventListener("mouseleave", handlers.handleMouseLeave)
      }
    })
    eventListenersRef.current = []

    // Supprimer les éléments du DOM s'ils existent encore
    wordsRef.current.forEach(wordEl => {
      try {
        if (wordEl && wordEl.parentNode === containerRef.current) {
          containerRef.current.removeChild(wordEl)
        }
      } catch (error) {
        console.warn("Error removing word element:", error)
      }
    })
    wordsRef.current = []
  }

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      cleanupWords()
    }
  }, [])

  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 1000)
    return () => clearTimeout(timer)
  }, [currentFilter])

  useEffect(() => {
    if (!mountedRef.current || !containerRef.current || !words || words.length === 0) {
      cleanupWords()
      return
    }

    const container = containerRef.current
    cleanupWords()

    const containerWidth = container.offsetWidth
    const containerHeight = height

    const filteredWords = words
      .filter((word) => currentFilter === "all" || word.sentiment === currentFilter)
      .sort((a, b) => b.size - a.size)

    const maxSize = Math.max(...filteredWords.map(w => w.size))
    const minSize = Math.min(...filteredWords.map(w => w.size))
    const scaleFactor = (val) => 0.7 + (val - minSize) / (maxSize - minSize) * 1.3

    const centerX = containerWidth / 2
    const centerY = containerHeight / 2
    const angleStep = 0.2
    const radiusStep = 2
    let angle = 0
    let radius = 0

    filteredWords.forEach((wordObj) => {
      if (!mountedRef.current) return

      const wordElement = document.createElement("div")
      wordElement.className = `word ${wordObj.sentiment} ${isAnimating ? "animate-in" : ""}`
      wordElement.textContent = wordObj.text
      
      const scaledSize = Math.max(12, Math.min(40, wordObj.size * scaleFactor(wordObj.size)))
      wordElement.style.fontSize = `${scaledSize}px`
      wordElement.style.background = sentimentColors[wordObj.sentiment]
      wordElement.style.backgroundClip = "text"
      wordElement.style.webkitBackgroundClip = "text"
      wordElement.style.color = "transparent"
      wordElement.style.fontWeight = "600"
      wordElement.style.opacity = "0.9"
      wordElement.style.transition = "all 0.3s ease"
      wordElement.style.cursor = "pointer"

      // Positionnement initial temporaire pour mesurer
      wordElement.style.position = "absolute"
      wordElement.style.visibility = "hidden"
      container.appendChild(wordElement)
      
      const wordWidth = wordElement.offsetWidth
      const wordHeight = wordElement.offsetHeight
      container.removeChild(wordElement)

      // Trouver une position sans chevauchement
      let placed = false
      let attempts = 0
      let x, y

      while (!placed && attempts < 50) {
        x = centerX + radius * Math.cos(angle) - wordWidth / 2
        y = centerY + radius * Math.sin(angle) - wordHeight / 2

        if (x < 0 || x + wordWidth > containerWidth ||
            y < 0 || y + wordHeight > containerHeight) {
          angle += angleStep
          radius += radiusStep
          attempts++
          continue
        }

        placed = true
        wordElement.style.left = `${x}px`
        wordElement.style.top = `${y}px`
        wordElement.style.visibility = "visible"
        wordElement.style.transform = isAnimating ? "scale(0.5)" : "scale(1)"
        wordElement.style.transformOrigin = "center"

        const handleMouseEnter = () => {
          if (!mountedRef.current) return
          wordElement.style.transform = "scale(1.2)"
          wordElement.style.opacity = "1"
          wordElement.style.zIndex = "10"
          setHoveredWord({
            text: wordObj.text,
            sentiment: wordObj.sentiment,
            size: Math.round(wordObj.size * 10) / 10
          })
        }

        const handleMouseLeave = () => {
          if (!mountedRef.current) return
          wordElement.style.transform = "scale(1)"
          wordElement.style.opacity = "0.9"
          wordElement.style.zIndex = "1"
          setHoveredWord(null)
        }

        wordElement.addEventListener("mouseenter", handleMouseEnter)
        wordElement.addEventListener("mouseleave", handleMouseLeave)

        eventListenersRef.current.push({
          element: wordElement,
          handlers: { handleMouseEnter, handleMouseLeave }
        })

        container.appendChild(wordElement)
        wordsRef.current.push(wordElement)

        angle += angleStep
        radius += radiusStep * (0.5 + Math.random() * 0.5)
      }
    })

    return cleanupWords
  }, [words, height, currentFilter, isAnimating])

  return (
    <div className="wordcloud-wrapper">
      <div
        ref={containerRef}
        className="wordcloud-container"
        style={{
          width: width,
          height: `${height}px`,
        }}
      ></div>
      
      {hoveredWord && (
        <div className="wordcloud-tooltip">
          <div className="tooltip-content">
            <span className="word">{hoveredWord.text}</span>
            <div className="details">
              <span className={`sentiment ${hoveredWord.sentiment}`}>
                {hoveredWord.sentiment}
              </span>
              <span className="size">Size: {hoveredWord.size}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default WordCloud