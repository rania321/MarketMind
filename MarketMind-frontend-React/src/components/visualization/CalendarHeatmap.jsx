import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CalendarHeatmap = ({ data, darkMode }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = svgRef.current.clientWidth;
    const height = 200;
    const cellSize = 15;
    const margin = { top: 30, right: 30, bottom: 30, left: 30 };

    // Clear previous heatmap
    d3.select(svgRef.current).selectAll("*").remove();

    // Create SVG
    const svg = d3.select(svgRef.current)
      .attr("width", width)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Parse dates
    const parseDate = d3.timeParse("%Y-%m-%d");
    data.forEach(d => {
      d.date = parseDate(d.day);
      d.value = +d.value;
    });

    // Color scale
    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.value)])
      .range([darkMode ? "#2d00f7" : "#e0e0ff", darkMode ? "#f72585" : "#f72585"]);

    // Create day rectangles
    svg.selectAll(".day")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "day")
      .attr("width", cellSize)
      .attr("height", cellSize)
      .attr("x", (d, i) => (i % 7) * (cellSize + 2))
      .attr("y", (d, i) => Math.floor(i / 7) * (cellSize + 2))
      .attr("fill", d => colorScale(d.value))
      .attr("rx", 2)
      .attr("ry", 2);

    // Add month labels
    const months = d3.timeMonths(d3.min(data, d => d.date), d3.max(data, d => d.date));
    svg.selectAll(".month")
      .data(months)
      .enter()
      .append("text")
      .attr("class", "month")
      .attr("x", (d, i) => i * 30)
      .attr("y", -5)
      .text(d => d3.timeFormat("%b")(d))
      .style("fill", darkMode ? "#e0e0e0" : "#333")
      .style("font-size", "10px");

  }, [data, darkMode]);

  return (
    <div className="calendar-heatmap">
      <svg ref={svgRef} width="100%" height="100%" />
    </div>
  );
};

export default CalendarHeatmap;