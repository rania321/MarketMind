import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import * as d3Cloud from 'd3-cloud';

const WordCloud3D = ({ words, darkMode }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    // Clear previous word cloud
    d3.select(svgRef.current).selectAll("*").remove();

    // Set up the cloud layout
    const layout = d3Cloud()
      .size([width, height])
      .words(words.map(d => ({ text: d.text, size: d.value * 10 })))
      .padding(5)
      .rotate(() => (Math.random() > 0.5 ? 0 : 90))
      .font("Impact")
      .fontSize(d => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      const svg = d3.select(svgRef.current)
        .append("g")
        .attr("transform", `translate(${width / 2},${height / 2})`);

      svg.selectAll("text")
        .data(words)
        .enter().append("text")
        .style("font-size", d => `${d.size}px`)
        .style("font-family", "Impact")
        .style("fill", darkMode ? "#9d4edd" : "#4361ee")
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${[d.x, d.y]})rotate(${d.rotate})`)
        .text(d => d.text);
    }
  }, [words, darkMode]);

  return (
    <div className="wordcloud-wrapper">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default WordCloud3D;