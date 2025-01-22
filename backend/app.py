from flask import Flask, request, jsonify
from flask_cors import CORS
from algorithms.dijkstra import dijkstra
import heapq

app = Flask(__name__)
CORS(app)

def generate_dijkstra_steps(graph, start):
    steps = []
    distances = {node: float('inf') for node in graph}
    distances[start] = 0
    priority_queue = [(0, start)]
    unvisited = set(graph.keys())
    visited = set()

    # Initial step
    steps.append({
        'description': 'Initialize: Set distance to start node as 0, others as infinity',
        'distances': distances.copy(),
        'visited': list(visited),
        'unvisited': list(unvisited)
    })

    while priority_queue:
        current_distance, current_node = heapq.heappop(priority_queue)

        # Skip if we've found a longer path
        if current_distance > distances[current_node]:
            continue

        # Step: Select current node
        steps.append({
            'description': f'Select node {current_node} with minimum distance',
            'currentNode': current_node,
            'distances': distances.copy(),
            'visited': list(visited),
            'unvisited': list(unvisited)
        })

        # Mark as visited
        visited.add(current_node)
        unvisited.discard(current_node)

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
                'unvisited': list(unvisited)
            })

            # Update distance if shorter path found
            if potential_distance < distances[neighbor]:
                distances[neighbor] = potential_distance
                heapq.heappush(priority_queue, (potential_distance, neighbor))

                # Step: Update distance
                steps.append({
                    'description': f'Update distance to {neighbor}: {potential_distance}',
                    'currentNode': current_node,
                    'neighbor': neighbor,
                    'newDistance': potential_distance,
                    'distances': distances.copy(),
                    'visited': list(visited),
                    'unvisited': list(unvisited)
                })

    return steps

@app.route('/api/dijkstra', methods=['POST'])
def run_dijkstra():
    data = request.json
    graph = data.get('graph')
    start_node = data.get('startNode')
    
    # Validate input
    if not graph:
        return jsonify({'error': 'Graph is empty'}), 400
    
    if not start_node:
        return jsonify({'error': 'Start node not specified'}), 400
    
    if start_node not in graph:
        return jsonify({'error': f'Start node {start_node} not in graph'}), 400
    
    try:
        
        # Run Dijkstra's algorithm
        result = dijkstra(graph, start_node)
        
        # Generate steps
        steps = generate_dijkstra_steps(graph, start_node)
        
        return jsonify({
            'distances': result
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
    app.run(debug=True)