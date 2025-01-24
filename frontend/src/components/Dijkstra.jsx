import React, { useState } from 'react';
import axios from 'axios';
import GraphVisualization from './GraphVisualization';
import { 
  PlusIcon, 
  PlayIcon, 
  RefreshIcon,
  TrashIcon,
  SwitchHorizontalIcon,
  ChevronRightIcon,
  ChevronLeftIcon
} from '@heroicons/react/solid';

function DijkstraVisualizer() {
  // Start with an empty graph
  const [graph, setGraph] = useState({});
  const [startNode, setStartNode] = useState('');
  const [result, setResult] = useState(null);
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isDirected, setIsDirected] = useState(true);

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
      setGraph(prev => {
        const updatedGraph = {...prev};
        
        // For directed graph, add edge only in one direction
        if (isDirected) {
          if (!updatedGraph[fromNode]) updatedGraph[fromNode] = {};
          updatedGraph[fromNode][toNode] = weight;
        } 
        // For undirected graph, add edge in both directions
        else {
          if (!updatedGraph[fromNode]) updatedGraph[fromNode] = {};
          if (!updatedGraph[toNode]) updatedGraph[toNode] = {};
          updatedGraph[fromNode][toNode] = weight;
          updatedGraph[toNode][fromNode] = weight;
        }

        return updatedGraph;
      });
      
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
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/dijkstra`, {
        graph,
        startNode,
        isDirected
      });
      
      // Log the full response to debug
      console.log(response.data);
      console.log()
      const distances = response.data.distances;
      const algorithmSteps = response.data.steps || [];

      console.log('Distances:', distances);
      console.log('Algorithm Steps:', algorithmSteps);

      // Set both distances and steps
      setResult(distances);
      setSteps(algorithmSteps);
      
      // Always start at the first step if steps exist
      if (algorithmSteps.length > 0) {
        setCurrentStepIndex(0);
      }
    } catch (error) {
      console.error('Error running Dijkstra:', error);
      
      // More detailed error logging
      if (error.response) {
        console.error('Response error:', error.response.data);
        alert(`Error: ${error.response.data.error || 'Failed to run Dijkstra\'s algorithm'}`);
      } else if (error.request) {
        console.error('Request error:', error.request);
        alert('No response received from the server');
      } else {
        console.error('Error:', error.message);
        alert('Error setting up the request');
      }
    }
  };

  const navigateStep = (direction) => {
    if (steps.length === 0) return;

    if (direction === 'next' && currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else if (direction === 'prev' && currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const resetVisualization = () => {
    setResult(null);
    setSteps([]);
    setCurrentStepIndex(-1);
  };

  // Filter out existing nodes from available nodes
  const remainingNodes = availableNodes.filter(node => !graph[node]);

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      {/* Graph Type Toggle */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Dijkstra's Algorithm Visualizer
        </h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium">Graph Type:</span>
          <button 
            onClick={() => {
              // Confirm graph type change if graph is not empty
              if (Object.keys(graph).length > 0) {
                const confirm = window.confirm(
                  "Changing graph type will clear the current graph. Continue?"
                );
                if (confirm) {
                  setGraph({});
                  setStartNode('');
                  setResult(null);
                  setSteps([]);
                  setCurrentStepIndex(-1);
                  setIsDirected(!isDirected);
                }
              } else {
                setIsDirected(!isDirected);
              }
            }}
            className="flex items-center bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
          >
            <SwitchHorizontalIcon className="h-5 w-5 mr-2" />
            {isDirected ? 'Directed' : 'Undirected'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Graph Visualization */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <GraphVisualization 
            graph={graph} 
            distances={result} 
            currentStep={steps[currentStepIndex]} 
            isDirected={isDirected}
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

          {/* Step Navigation */}
          {steps.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-4">
                <button 
                  onClick={() => navigateStep('prev')}
                  disabled={currentStepIndex === 0}
                  className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                <span className="text-lg font-semibold">
                  Step {currentStepIndex + 1} of {steps.length}
                </span>
                <button 
                  onClick={() => navigateStep('next')}
                  disabled={currentStepIndex === steps.length - 1}
                  className="bg-blue-500 text-white p-2 rounded-md disabled:opacity-50"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Step Description */}
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-bold mb-2">Current Step</h3>
                <p>{steps[currentStepIndex]?.description || 'No description'}</p>
              </div>

              {/* Distances */}
              <div className="mt-4">
                <h3 className="font-bold mb-2">Current Distances</h3>
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100">
                      <th>Node</th>
                      <th>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(steps[currentStepIndex]?.distances || {}).map(([node, distance]) => (
                      <tr key={node} className="text-center">
                        <td>{node}</td>
                        <td>{distance === Infinity ? '∞' : distance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Final Results */}
          {result && Object.keys(result).length > 0 && (
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <h3 className="font-semibold mb-2">Final Distances from {startNode}:</h3>
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