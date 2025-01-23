# Dynamic Algorithm Visualizer

## Overview

Dynamic Algorithm Visualizer is an interactive web application designed to help users understand and explore various algorithmic processes through dynamic, user-friendly visualizations. The project aims to provide an educational tool for understanding complex algorithms step by step.

## Current Algorithms

### 1. Dijkstra's Shortest Path Algorithm
- Visualize shortest path calculations
- Support for directed and undirected graphs
- Step-by-step algorithm breakdown
- Interactive graph creation and manipulation

## Planned Algorithms (Roadmap)
- Breadth-First Search (BFS)
- Depth-First Search (DFS)
- A* Pathfinding
- Kruskal's Minimum Spanning Tree
- Bellman-Ford Algorithm
- And more...

## Features

### General Features
- Dynamic algorithm selection
- Interactive graph creation
- Step-by-step visualization
- Directed and undirected graph support
- Responsive design

### Dijkstra's Algorithm Specific Features
- Custom edge weights
- Start node selection
- Real-time distance tracking
- Detailed step explanation

## Technologies Used

### Frontend
- React.js
- Tailwind CSS
- D3.js (Visualization)
- Heroicons

### Backend
- Python
- Flask
- CORS support

## Prerequisites

- Node.js (v14+ recommended)
- Python (v3.7+)
- pip (Python package manager)

## Installation

### Frontend Setup

1. Clone the repository
```bash
git clone https://github.com/Ajstudy10/DynamicAlgorithmVisualizer
cd DynamicAlgorithmVisualizer/frontend
npm install
npm run dev
```
### Backend Setup
```bash
cd ../backend
pip install -r requirements.txt
python app.py
```