import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AlgorithmSelector({ onSelect }) {
  const [algorithms, setAlgorithms] = useState([]);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/algorithms');
        setAlgorithms(response.data);
      } catch (error) {
        console.error('Error fetching algorithms:', error);
      }
    };

    fetchAlgorithms();
  }, []);

  return (
    <div>
      <select onChange={(e) => onSelect(e.target.value)}>
        <option value="">Select an Algorithm</option>
        {algorithms.map(algo => (
          <option key={algo.id} value={algo.id}>
            {algo.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default AlgorithmSelector;