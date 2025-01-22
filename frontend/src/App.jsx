import React, { useState } from 'react';
import DijkstraVisualizer from './components/Dijkstra';
import AlgorithmSelector from './components/AlgorithmSelector';

function App() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState(null);

  return (
    <div className="App">
      <h1>Dynamic Algorithm Visualizer</h1>
      <AlgorithmSelector onSelect={setSelectedAlgorithm} />
      {selectedAlgorithm === 'dijkstra' && <DijkstraVisualizer />}
    </div>
  );
}

export default App;