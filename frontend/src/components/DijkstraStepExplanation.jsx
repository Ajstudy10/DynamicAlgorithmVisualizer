import React from 'react';

function DijkstraStepExplanation({ step, startNode }) {
  if (!step) return null;

  const renderStepDescription = () => {
    switch (step.description) {
      case 'Initialize: Set distance to start node as 0, others as infinity':
        return (
          <div>
            <p>🚀 Algorithm Starts!</p>
            <p>Initialize all distances to infinity, except {startNode} which is set to 0.</p>
            <p>This prepares us to find the shortest paths from {startNode}.</p>
          </div>
        );
      
      case `Select node ${step.currentNode} with minimum distance`:
        return (
          <div>
            <p>🔍 Select Minimum Distance Node</p>
            <p>Choose {step.currentNode} as the current node with the smallest known distance.</p>
          </div>
        );
      
      case `Examine neighbor ${step.neighbor} from ${step.currentNode}`:
        return (
          <div>
            <p>🌐 Examine Neighbor</p>
            <p>Check if we can improve the path to {step.neighbor} through {step.currentNode}.</p>
            <p>Current distance: {step.currentDistance}</p>
            <p>Potential new distance: {step.potentialDistance}</p>
          </div>
        );
      
      case `Update distance to ${step.neighbor}: ${step.newDistance}`:
        return (
          <div>
            <p>✨ Update Shortest Path</p>
            <p>Found a shorter path to {step.neighbor}!</p>
            <p>New distance: {step.newDistance}</p>
          </div>
        );
      
      case `Mark ${step.currentNode} as visited`:
        return (
          <div>
            <p>✅ Mark Node as Visited</p>
            <p>{step.currentNode} is now processed and won't be reconsidered.</p>
          </div>
        );
      
      default:
        return <p>{step.description}</p>;
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-2">Step Explanation</h3>
      {renderStepDescription()}
      
      <div className="mt-4">
        <h4 className="font-semibold">Current State:</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <strong>Distances:</strong>
            <pre className="text-xs">{JSON.stringify(step.distances, null, 2)}</pre>
          </div>
          <div>
            <strong>Visited Nodes:</strong>
            <pre className="text-xs">{JSON.stringify(step.visited || [], null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DijkstraStepExplanation;