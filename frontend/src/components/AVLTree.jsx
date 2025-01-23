import React, { useState, useRef, useEffect } from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import { 
  PlusIcon, 
  PlayIcon, 
  RefreshIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  InformationCircleIcon
} from '@heroicons/react/solid';

function AVLTreeVisualizer() {
  const [keys, setKeys] = useState([]);
  const [newKey, setNewKey] = useState('');
  const [steps, setSteps] = useState([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [finalTree, setFinalTree] = useState(null);
  const [showRotationModal, setShowRotationModal] = useState(false);
  const svgRef = useRef(null);

  const addKey = () => {
    if (newKey && !isNaN(newKey)) {
      const keyValue = parseInt(newKey);
      // Prevent duplicate keys
      if (!keys.includes(keyValue)) {
        setKeys(prev => [...prev, keyValue]);
        setNewKey('');
      }
    }
  };

  const runAVLTreeInsertion = async () => {
    if (keys.length === 0) return;
    try {
      const response = await axios.post('http://localhost:5000/api/avl-tree', {
        keys
      });

      setSteps(response.data.steps);
      setFinalTree(response.data.finalTree);
      setCurrentStepIndex(0);
    } catch (error) {
      console.error('Error running AVL Tree insertion:', error);
      alert('Failed to run AVL Tree insertion');
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
    setKeys([]);
    setSteps([]);
    setCurrentStepIndex(-1);
    setFinalTree(null);

    if (svgRef.current) {
        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();
      }
  };

  const removeKey = (keyToRemove) => {
    setKeys(prev => prev.filter(key => key !== keyToRemove));
  };

  useEffect(() => {
    if (currentStepIndex !== -1 && steps[currentStepIndex]?.tree) {
      renderTreeVisualization(steps[currentStepIndex].tree);
    }
  }, [currentStepIndex, steps]);

  const renderTreeVisualization = (treeStructure) => {
  if (!treeStructure || !svgRef.current) return;

  // Clear previous visualization
  const svg = d3.select(svgRef.current);
  svg.selectAll("*").remove();

  // Set up SVG dimensions
  const width = 800;
  const height = 400;
  svg.attr('width', width).attr('height', height);

  // Tree layout with more vertical spacing
  const treeLayout = d3.tree().size([width, height]);

  // Convert tree structure to d3 hierarchy
  const root = d3.hierarchy(treeStructure, d => {
    return [d.left, d.right].filter(child => child !== null);
  });

  // Generate tree layout
  const treeData = treeLayout(root);

  // Create links with animation
  const link = svg.selectAll(".link")
    .data(treeData.links())
    .enter()
    .append("path")
    .attr("class", "link")
    .attr("fill", "none")
    .attr("stroke", d => {
      // Highlight links involved in rotation
      const currentStep = steps[currentStepIndex];
      if (currentStep?.involvedNodes && 
          currentStep.involvedNodes.includes(d.source.data.key) && 
          currentStep.involvedNodes.includes(d.target.data.key)) {
        return "red";
      }
      return "#555";
    })
    .attr("stroke-opacity", 0.6)
    .attr("stroke-width", 2)
    .attr("d", d3.linkVertical()
      .x(d => d.x)
      .y(d => d.y)
    )
    // Rotation animation
    .transition()
    .duration(500)
    .attr("stroke-width", d => {
      const currentStep = steps[currentStepIndex];
      return currentStep?.rotationType ? 4 : 2;
    });

  // Create nodes with enhanced visualization
  const node = svg.selectAll(".node")
    .data(treeData.descendants())
    .enter()
    .append("g")
    .attr("class", "node")
    .attr("transform", d => `translate(${d.x},${d.y})`);

  // Node circles with rotation highlighting and animation
  node.append("circle")
    .attr("r", 30)
    .attr("fill", d => {
      const currentStep = steps[currentStepIndex];
      
      // Highlight current key
      if (currentStep?.currentKey === d.data.key) {
        return "orange";
      }
      
      // Highlight nodes involved in rotation
      if (currentStep?.involvedNodes?.includes(d.data.key)) {
        return "lightblue";
      }
      
      return "steelblue";
    })
    .attr("stroke", d => {
      const currentStep = steps[currentStepIndex];
      if (currentStep?.involvedNodes?.includes(d.data.key)) {
        return "red";
      }
      return "white";
    })
    .attr("stroke-width", 3)
    // Rotation animation
    .transition()
    .duration(500)
    .attr("r", d => {
      const currentStep = steps[currentStepIndex];
      return currentStep?.rotationType ? 35 : 30;
    });

  // Node labels with rotation details
  node.append("text")
    .attr("dy", ".35em")
    .attr("text-anchor", "middle")
    .text(d => {
      const currentStep = steps[currentStepIndex];
      const rotationInfo = d.data.rotation_details;
      
      // Display additional info during rotation
      if (currentStep?.rotationType && 
          currentStep.involvedNodes.includes(d.data.key)) {
        return `${d.data.key}\nH:${d.data.height}\nROT`;
      }
      
      return `${d.data.key}\nH:${d.data.height}`;
    })
    .attr("fill", d => {
      const currentStep = steps[currentStepIndex];
      return currentStep?.involvedNodes?.includes(d.data.key) ? "red" : "white";
    })
    .attr("font-weight", "bold")
    .attr("font-size", "12px")
    .attr("white-space", "pre");

  // Rotation annotation with detailed explanation
  if (steps[currentStepIndex]?.rotationType) {
    const rotationText = svg.append("g")
      .attr("transform", `translate(${width/2}, 50)`);

    rotationText.append("rect")
      .attr("width", 300)
      .attr("height", 80)
      .attr("x", -150)
      .attr("y", 0)
      .attr("fill", "rgba(255,0,0,0.1)")
      .attr("rx", 10);

    rotationText.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "red")
      .attr("font-weight", "bold")
      .attr("font-size", "16px")
      .text(`🔄 ${steps[currentStepIndex].rotationType}`);

    rotationText.append("text")
      .attr("text-anchor", "middle")
      .attr("fill", "darkred")
      .attr("font-size", "12px")
      .attr("y", 30)
      .text(steps[currentStepIndex].rotationDescription);
  }
};

  return (
    <div className="container mx-auto p-4 bg-white shadow-lg rounded-lg">
      {/* Rotation Modal */}
      {showRotationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h2 className="text-xl font-bold mb-4">AVL Tree Rotations</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Left Rotation (RR)</strong>: 
                <p className="text-sm text-gray-600">
                  Occurs when the right subtree is too heavy. Rotates the tree to the left.
                </p>
              </li>
              <li>
                <strong>Right Rotation (LL)</strong>: 
                <p className="text-sm text-gray-600">
                  Occurs when the left subtree is too heavy. Rotates the tree to the right.
                </p>
              </li>
              <li>
                <strong>Left-Right Rotation (LR)</strong>: 
                <p className="text-sm text-gray-600">
                  A two-step rotation when left child is right-heavy. First left rotate child, then right rotate parent.
                </p>
              </li>
              <li>
                <strong>Right-Left Rotation (RL)</strong>: 
                <p className="text-sm text-gray-600">
                  A two-step rotation when right child is left-heavy. First right rotate child, then left rotate parent.
                </p>
              </li>
            </ul>
            <button 
              onClick={() => setShowRotationModal(false)}
              className="mt-4 w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          AVL Tree Visualizer
        </h2>
        <button 
          onClick={() => setShowRotationModal(true)}
          className="flex items-center text-blue-500 hover:text-blue-700"
        >
          <InformationCircleIcon className="h-6 w-6 mr-2" />
          Rotation Guide
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tree Visualization */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <svg ref={svgRef} className="w-full h-full" viewBox="-100 -100 1000 500"></svg>
        </div>

        {/* Controls and Configuration */}
        <div className="space-y-4">
          {/* Add Key */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Add Key</h3>
            <div className="flex space-x-2">
              <input
                type="number"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                className="flex-1 block w-full rounded-md border-gray-300"
                placeholder="Enter key"
              />
              <button 
                onClick={addKey}
                className="bg-green-500 text-white p-2 rounded-md"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Current Keys */}
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Keys to Insert</h3>
            <div className="flex flex-wrap gap-2">
              {keys.map((key, index) => (
                <div 
                  key={index} 
                  className="bg-blue-500 text-white px-2 py-1 rounded flex items-center"
                >
                  <span className="mr-2">{key}</span>
                  <button 
                    onClick={() => removeKey(key)}
                    className="text-white hover:text-red-200"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Algorithm Controls */}
          <div className="flex space-x-2">
            <button 
              onClick={runAVLTreeInsertion}
              disabled={keys.length === 0}
              className="flex-1 bg-green-500 text-white p-2 rounded-md flex items-center justify-center disabled:opacity-50"
            >
              <PlayIcon className="h-5 w-5 mr-2" /> Run AVL Insertion
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

              {/* Step Description with Rotation Emphasis */}
              <div className="bg-white p-4 rounded-md shadow-sm">
                <h3 className="font-bold mb-2">Current Step</h3>
                <p>{steps[currentStepIndex]?.description}</p>
                
                {/* Rotation Highlight */}
                {steps[currentStepIndex]?.rotationType && (
                  <div className="mt-2 p-2 bg-red-100 rounded">
                    <strong className="text-red-700">
                      🔄 Rotation Occurred: {steps[currentStepIndex].rotationType}
                    </strong>
                    <p className="text-sm text-red-600">
                      This rotation helps maintain the AVL tree's balance.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AVLTreeVisualizer;