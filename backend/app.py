from flask import Flask, request, jsonify
from flask_cors import CORS
import heapq
import os
from algorithms.dijkstra import dijkstra,generate_dijkstra_steps
from algorithms.avl_tree import *
app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": ["http://localhost:4173", "https://joyful-enthusiasm-production.up.railway.app/"]}})

def replace_infinity(data):
    """Recursively replaces `inf` with `None` or a JSON-compatible value."""
    if isinstance(data, dict):
        return {k: ("Infinity" if v == float('inf') else replace_infinity(v)) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_infinity(item) for item in data]
    return data

@app.route('/api/dijkstra', methods=['POST'])
def run_dijkstra():
    data = request.json
    graph = data.get('graph')
    start_node = data.get('startNode')
    is_directed = data.get('isDirected', True)
    
    try:
        # If undirected, convert to directed graph
        if not is_directed:
            undirected_graph = graph.copy()
            for node, neighbors in graph.items():
                for neighbor, weight in neighbors.items():
                    if neighbor not in undirected_graph:
                        undirected_graph[neighbor] = {}
                    undirected_graph[neighbor][node] = weight
            graph = undirected_graph

        # Calculate distances
        distances = dijkstra(graph, start_node)
        
        # Generate steps
        steps = generate_dijkstra_steps(graph, start_node)
        return jsonify({
            'distances': replace_infinity(distances),
            'steps': replace_infinity(steps)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400
    
@app.route('/api/avl-tree', methods=['POST'])
def run_avl_tree():
    data = request.json
    keys = data.get('keys', [])
    try:
        avl_tree = AVLTree()
        steps = avl_tree.get_insertion_steps(keys)
        return jsonify({
            'steps': steps,
            'finalTree': avl_tree.get_tree_structure()
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 400 
      
@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    algorithms = [
        {'id': 'dijkstra', 'name': 'Dijkstra\'s Algorithm'},
        {'id': 'avl', 'name': 'AVLTree Algorithm'}
        # Add more algorithms here
    ]
    return jsonify(algorithms)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)