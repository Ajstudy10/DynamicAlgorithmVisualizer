import React, { useState } from 'react';
import axios from 'axios';

function DijkstraVisualizer() {
  const [graph, setGraph] = useState({
    'A': {'B': 4, 'C': 2},
    'B': {'D': 3},
    'C': {'B': 1, 'D': 5},
    'D': {}
  });
  const [startNode, setStartNode] = useState('A');
  const [result, setResult] = useState(null);

  const runDijkstra = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/dijkstra', {
        graph,
        startNode
      });
      setResult(response.data.distances);
    } catch (error) {
      console.error('Error running Dijkstra:', error);
    }
  };

  const handleGraphEdit = (node, neighbor, weight) => {
    const newGraph = {...graph};
    if (!newGraph[node]) newGraph[node] = {};
    newGraph[node][neighbor] = weight;
    setGraph(newGraph);
  };

  return (
    <div>
      <h2>Dijkstra's Algorithm</h2>
      
      <div>
        <h3>Graph Configuration</h3>
        {Object.keys(graph).map(node => (
          <div key={node}>
            <strong>{node}: </strong>
            {Object.entries(graph[node]).map(([neighbor, weight]) => (
              <span key={neighbor}>{neighbor}({weight}) </span>
            ))}
          </div>
        ))}
      </div>

      <div>
        <label>Start Node: </label>
        <select 
          value={startNode} 
          onChange={(e) => setStartNode(e.target.value)}
        >
          {Object.keys(graph).map(node => (
            <option key={node} value={node}>{node}</option>
          ))}
        </select>
      </div>

      <div>
        <h3>Add/Edit Edge</h3>
        <select id="fromNode">
          {Object.keys(graph).map(node => (
            <option key={node} value={node}>{node}</option>
          ))}
        </select>
        <input 
          type="text" 
          placeholder="Neighbor Node" 
          id="toNode"
        />
        <input 
          type="number" 
          placeholder="Weight" 
          id="edgeWeight"
        />
        <button onClick={() => {
          const fromNode = document.getElementById('fromNode').value;
          const toNode = document.getElementById('toNode').value;
          const weight = parseInt(document.getElementById('edgeWeight').value);
          
          if (fromNode && toNode && !isNaN(weight)) {
            // Ensure the to node exists in the graph
            if (!graph[toNode]) {
              setGraph(prev => ({...prev, [toNode]: {}}));
            }
            handleGraphEdit(fromNode, toNode, weight);
          }
        }}>
          Add/Update Edge
        </button>
      </div>

      <button onClick={runDijkstra}>Run Dijkstra</button>
      {result && (
        <div>
          <h3>Distances from {startNode}:</h3>
          <table>
            <thead>
              <tr>
                <th>Node</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(result).map(([node, distance]) => (
                <tr key={node}>
                  <td>{node}</td>
                  <td>{distance === Infinity ? '∞' : distance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default DijkstraVisualizer;