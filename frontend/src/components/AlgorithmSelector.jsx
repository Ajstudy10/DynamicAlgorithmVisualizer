import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AlgorithmSelector({ onSelect }) {
  const [algorithms, setAlgorithms] = useState([]);

  useEffect(() => {
    const fetchAlgorithms = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/algorithms`);
        console.log("API Response:", response.data);
        setAlgorithms(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error('Error fetching algorithms:', error);
        setAlgorithms([]);
      }
    };

    fetchAlgorithms();
  }, []);

  return (
    <div>
      <select onChange={(e) => onSelect(e.target.value)}>
        <option value="">Select an Algorithm</option>
        {algorithms.length > 0 ? (
          algorithms.map(algo => (
            <option key={algo.id} value={algo.id}>
              {algo.name}
            </option>
          ))
        ) : (
          <option disabled>Loading algorithms...</option>
        )}
      </select>
    </div>
  );
}

export default AlgorithmSelector;
