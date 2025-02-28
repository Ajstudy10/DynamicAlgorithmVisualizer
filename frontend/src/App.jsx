import React, { useState } from 'react';
import DijkstraVisualizer from './components/Dijkstra';
import AVLTreeVisualizer from './components/AVLTree'
import AlgorithmSelector from './components/AlgorithmSelector';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  return (
    <div className="w-full max-w-screen-xl mx-auto px-4" >
      <h1>Dynamic Algorithm Visualizer</h1>
      <AlgorithmSelector onSelect={setSelectedAlgorithm} />
      {selectedAlgorithm === 'dijkstra' && <DijkstraVisualizer />}
      {selectedAlgorithm === 'avl' && <AVLTreeVisualizer />}
    </div>
  );
}

export default App;