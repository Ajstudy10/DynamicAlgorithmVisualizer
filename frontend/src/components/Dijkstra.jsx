import React, { useState } from 'react';
import axios from 'axios';
import GraphVisualization from './GraphVisualization';
import { 
  PlusIcon, 
  PlayIcon, 
  RefreshIcon,
  TrashIcon
} from '@heroicons/react/solid';

function DijkstraVisualizer() {
  // Start with an empty graph
  const [graph, setGraph] = useState({});
  const [startNode, setStartNode] = useState('');
  const [result, setResult] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);

  // Predefined set of nodes
  const availableNodes = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  const [newEdge, setNewEdge] = useState({
    fromNode: '',
    toNode: '',
    weight: 1
  });

  const [newNode, setNewNode] = useState('');

  const addNode = () => {
    if (newNode && !graph[newNode]) {
      setGraph(prev => ({
        ...prev,
        [newNode]: {} // Initialize with empty neighbors
      }));
      setNewNode('');
      
      // Set first added node as start node if not set
      if (!startNode) {
        setStartNode(newNode);
      }
    }
  };

  const addEdge = () => {
    const { fromNode, toNode, weight } = newEdge;
    if (fromNode && toNode && !isNaN(weight)) {
      setGraph(prev => ({
        ...prev,
        [fromNode]: {
          ...(prev[fromNode] || {}),
          [toNode]: weight
        },
        // Ensure destination node exists
        [toNode]: prev[toNode] || {}
      }));
      
      // Reset edge form
      setNewEdge({
        fromNode: Object.keys(graph)[0] || '',
        toNode: '',
        weight: 1
      });
    }
  };

  const removeNode = (nodeToRemove) => {
    const newGraph = {...graph};
    
    // Remove the node
    delete newGraph[nodeToRemove];
    
    // Remove references to this node in other nodes' edges
    Object.keys(newGraph).forEach(node => {
      delete newGraph[node][nodeToRemove];
    });

    setGraph(newGraph);

    // Update start node if necessary
    if (nodeToRemove === startNode) {
      const remainingNodes = Object.keys(newGraph);
      setStartNode(remainingNodes[0] || '');
    }
  };

  const runDijkstra = async () => {
    if (!startNode) return;

    try {
      const response = await axios.post('http://localhost:5000/api/dijkstra', {
        graph,
        startNode
      });
      setResult(response.data.distances);
      setCurrentStep(1);
    } catch (error) {
      console.error('Error running Dijkstra:', error);
    }
  };

  const resetVisualization = () => {
    setResult(null);
    setCurrentStep(0);
  };

  // Filter out existing nodes from available nodes
  const remainingNodes = availableNodes.filter(node => !graph[node]);

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">
        Dijkstra's Algorithm Visualizer
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Graph Visualization */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <GraphVisualization 
            graph={graph} 
            distances={result} 
            currentStep={currentStep} 
          />
        </div>

        {/* Controls and Configuration */}
        <div className="space-y-4">
          {/* Add Node */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Add Node</h3>
            <div className="flex space-x-2">
              <select
                value={newNode}
                onChange={(e) => setNewNode(e.target.value)}
                className="flex-1 block w-full rounded-md border-gray-300"
              >
                <option value="">Select Node</option>
                {remainingNodes.map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
              <button 
                onClick={addNode}
                disabled={!newNode}
                className="bg-green-500 text-white p-2 rounded-md disabled:opacity-50"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Node List */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Nodes</h3>
            <div className="flex flex-wrap gap-2">
              {Object.keys(graph).map(node => (
                <div 
                  key={node} 
                  className={`
                    flex items-center space-x-2 
                    bg-white px-2 py-1 rounded-md
                    ${node === startNode ? 'border-2 border-green-500' : ''}
                  `}
                >
                  <span>{node}</span>
                  {node !== startNode && (
                    <button 
                      onClick={() => removeNode(node)}
                      className="text-red-500 hover:bg-red-100 rounded-full p-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                  {node !== startNode && (
                    <button 
                      onClick={() => setStartNode(node)}
                      className="text-blue-500 hover:bg-blue-100 rounded-full p-1"
                    >
                      🏁
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Start Node Selection */}
          <div className="bg-green-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700">
              Start Node
            </label>
            <select 
              value={startNode}
              onChange={(e) => setStartNode(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              disabled={Object.keys(graph).length === 0}
            >
              {Object.keys(graph).map(node => (
                <option key={node} value={node}>{node}</option>
              ))}
            </select>
          </div>

          {/* Add Edge */}
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Add Edge</h3>
            <div className="flex space-x-2">
              <select
                value={newEdge.fromNode}
                onChange={(e) => setNewEdge(prev => ({
                  ...prev, 
                  fromNode: e.target.value
                }))}
                className="flex-1 block w-full rounded-md border-gray-300"
                disabled={Object.keys(graph).length < 2}
              >
                <option value="">From Node</option>
                {Object.keys(graph).map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
              <select
                value={newEdge.toNode}
                onChange={(e) => setNewEdge(prev => ({
                  ...prev, 
                  toNode: e.target.value
                }))}
                className="flex-1 block w-full rounded-md border-gray-300"
                disabled={!newEdge.fromNode}
              >
                <option value="">To Node</option>
                {Object.keys(graph)
                  .filter(node => node !== newEdge.fromNode)
                  .map(node => (
                    <option key={node} value={node}>{node}</option>
                  ))
                }
              </select>
              <input
                type="number"
                placeholder="Weight"
                value={newEdge.weight}
                onChange={(e) => setNewEdge(prev => ({
                  ...prev, 
                  weight: parseInt(e.target.value)
                }))}
                className="flex-1 block w-full rounded-md border-gray-300"
                disabled={!newEdge.toNode}
              />
              <button 
                onClick={addEdge}
                disabled={!newEdge.fromNode || !newEdge.toNode || isNaN(newEdge.weight)}
                className="bg-purple-500 text-white p-2 rounded-md disabled:opacity-50"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Algorithm Controls */}
          <div className="flex space-x-2">
            <button 
              onClick={runDijkstra}
              disabled={Object.keys(graph).length < 2}
              className="flex-1 bg-green-500 text-white p-2 rounded-md flex items-center justify-center disabled:opacity-50"
            >
              <PlayIcon className="h-5 w-5 mr-2" /> Run Dijkstra
            </button>
            <button 
              onClick={resetVisualization}
              className="flex-1 bg-red-500 text-white p-2 rounded-md flex items-center justify-center"
            >
              <RefreshIcon className="h-5 w-5 mr-2" /> Reset
            </button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Distances from {startNode}:</h3>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-200">
                    <th>Node</th>
                    <th>Distance</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(result).map(([node, distance]) => (
                    <tr key={node} className="border-b">
                      <td className="text-center">{node}</td>
                      <td className="text-center">
                        {distance === Infinity ? '∞' : distance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DijkstraVisualizer;  