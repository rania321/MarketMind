"use client"

import { useEffect, useRef } from "react"

const WordCloud = ({ words, width = "100%", height = 300, currentFilter = "all" }) => {
  const containerRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !words || words.length === 0) return

    const container = containerRef.current
    container.innerHTML = ""
    const containerWidth = container.offsetWidth
    const containerHeight = height

    // Filtrer les mots selon le filtre actuel
    const filteredWords = words.filter((word) => currentFilter === "all" || word.sentiment === currentFilter)

    // Placer les mots dans le conteneur
    const placedWords = []
    filteredWords.forEach((wordObj) => {
      const wordElement = document.createElement("div")
      wordElement.className = `word ${wordObj.sentiment}`
      wordElement.textContent = wordObj.text
      wordElement.style.fontSize = `${wordObj.size}px`

      // Mesurer la taille du mot
      wordElement.style.visibility = "hidden"
      container.appendChild(wordElement)
      const wordWidth = wordElement.offsetWidth
      const wordHeight = wordElement.offsetHeight
      wordElement.remove()

      // Essayer de placer le mot sans chevauchement
      let attempts = 0
      let placed = false

      while (!placed && attempts < 100) {
        attempts++

        const left = Math.random() * (containerWidth - wordWidth)
        const top = Math.random() * (containerHeight - wordHeight)

        let collision = false
        for (const placedWord of placedWords) {
          if (
            left < placedWord.left + placedWord.width &&
            left + wordWidth > placedWord.left &&
            top < placedWord.top + placedWord.height &&
            top + wordHeight > placedWord.top
          ) {
            collision = true
            break
          }
        }

        if (!collision) {
          wordElement.style.left = `${left}px`
          wordElement.style.top = `${top}px`
          wordElement.style.visibility = "visible"
          container.appendChild(wordElement)

          placedWords.push({
            left: left,
            top: top,
            width: wordWidth,
            height: wordHeight,
          })

          placed = true
        }
      }

      // Si impossible de placer sans chevauchement, placer quand même
      if (!placed) {
        wordElement.style.left = `${Math.random() * (containerWidth - wordWidth)}px`
        wordElement.style.top = `${Math.random() * (containerHeight - wordHeight)}px`
        wordElement.style.visibility = "visible"
        container.appendChild(wordElement)
      }

      wordElement.title = `${wordObj.text} (${wordObj.sentiment})`
    })
  }, [words, height, currentFilter])

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: width,
        height: `${height}px`,
        margin: "0 auto",
      }}
    ></div>
  )
}

export default WordCloud
