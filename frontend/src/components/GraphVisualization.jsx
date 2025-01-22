import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function GraphVisualization({ graph, distances, currentStep }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!graph || !svgRef.current) return;

    // Clear previous visualization
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up SVG dimensions
    const width = 600;
    const height = 400;
    svg.attr('width', width).attr('height', height);

    // Create nodes and links data
    const nodes = Object.keys(graph).map(node => ({ id: node }));
    const links = [];

    // Create links from graph
    Object.entries(graph).forEach(([source, neighbors]) => {
      Object.entries(neighbors).forEach(([target, weight]) => {
        links.push({ source, target, weight });
      });
    });

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Create links
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);

    // Create edge weight labels
    const edgeLabels = svg.append('g')
      .selectAll('text')
      .data(links)
      .enter()
      .append('text')
      .text(d => d.weight)
      .attr('font-size', 12)
      .attr('fill', 'red')
      .attr('text-anchor', 'middle');

    // Create nodes
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', 20)
      .attr('fill', d => {
        if (distances && distances[d.id] !== undefined) {
          return distances[d.id] === Infinity ? 'lightcoral' : 'lightgreen';
        }
        return 'lightskyblue';
      })
      .attr('stroke', 'white')
      .attr('stroke-width', 3)
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Add node labels
    const nodeLabels = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text(d => {
        let label = d.id;
        if (distances && distances[d.id] !== undefined) {
          label += ` (${distances[d.id] === Infinity ? '∞' : distances[d.id]})`;
        }
        return label;
      })
      .attr('font-size', 12)
      .attr('text-anchor', 'middle')
      .attr('dy', 4)
      .attr('font-weight', 'bold');

    // Update positions
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      // Position edge weight labels midway between nodes
      edgeLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y);
    });

    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    return () => simulation.stop();
  }, [graph, distances, currentStep]);

  return (
    <div className="w-full h-96 bg-gray-50 rounded-lg overflow-hidden">
      <svg ref={svgRef} className="w-full h-full"></svg>
    </div>
  );
}

export default GraphVisualization;