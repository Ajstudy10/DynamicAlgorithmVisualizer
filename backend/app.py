from flask import Flask, request, jsonify
from flask_cors import CORS
import heapq
import os

app = Flask(__name__)
CORS(app)
def replace_infinity(data):
    """Recursively replaces `inf` with `None` or a JSON-compatible value."""
    if isinstance(data, dict):
        return {k: ("Infinity" if v == float('inf') else replace_infinity(v)) for k, v in data.items()}
    elif isinstance(data, list):
        return [replace_infinity(item) for item in data]
    return data

def dijkstra(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]
    
    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        if current_distance > distances[current_node]:
            continue

        for neighbor, weight in graph[current_node].items():
            distance = current_distance + weight
            if distance < distances[neighbor]:
                distances[neighbor] = distance
                heapq.heappush(priority_queue, (distance, neighbor))
    
    return distances

def generate_dijkstra_steps(graph, start):
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]
    steps = []
    visited = set()

    # Initial step
    steps.append({
        'description': f'Initialize: Set distance to {start} as 0, others as infinity',
        'currentNode': start,
        'distances': distances.copy(),
        'visited': list(visited),
        'unvisited': list(graph.keys())
    })

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        # Skip if we've found a longer path
        if current_distance > distances[current_node]:
            continue

        visited.add(current_node)

        # Step: Current node selection
        steps.append({
            'description': f'Select node {current_node} with minimum distance',
            'currentNode': current_node,
            'distances': distances.copy(),
            'visited': list(visited),
            'unvisited': list(set(graph.keys()) - visited)
        })

        # Examine neighbors
        for neighbor, weight in graph[current_node].items():
            if neighbor in visited:
                continue

            # Calculate potential new distance
            potential_distance = current_distance + weight

            # Step: Examine neighbor
            steps.append({
                'description': f'Examine neighbor {neighbor} from {current_node}',
                'currentNode': current_node,
                'neighbor': neighbor,
                'currentDistance': distances[neighbor],
                'potentialDistance': potential_distance,
                'distances': distances.copy(),
                'visited': list(visited),
                'unvisited': list(set(graph.keys()) - visited)
            })

            # Update distance if shorter path found
            if potential_distance < distances[neighbor]:
                distances[neighbor] = potential_distance
                heapq.heappush(priority_queue, (potential_distance, neighbor))

                # Step: Distance update
                steps.append({
                    'description': f'Update distance to {neighbor}: {potential_distance}',
                    'currentNode': current_node,
                    'neighbor': neighbor,
                    'newDistance': potential_distance,
                    'distances': distances.copy(),
                    'visited': list(visited),
                    'unvisited': list(set(graph.keys()) - visited)
                })

    # Final step
    steps.append({
        'description': 'Algorithm completed',
        'distances': distances.copy(),
        'visited': list(visited),
        'unvisited': []
    })

    return steps

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
    
@app.route('/api/algorithms', methods=['GET'])
def get_algorithms():
    algorithms = [
        {'id': 'dijkstra', 'name': 'Dijkstra\'s Algorithm'},
        # Add more algorithms here
    ]
    return jsonify(algorithms)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)