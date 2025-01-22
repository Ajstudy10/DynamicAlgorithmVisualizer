from flask import Flask, request, jsonify
from flask_cors import CORS
from algorithms.dijkstra import dijkstra

app = Flask(__name__)
CORS(app)

@app.route('/api/dijkstra', methods=['POST'])
def run_dijkstra():
    data = request.json
    graph = data.get('graph')
    start_node = data.get('startNode')
    
    try:
        result = dijkstra(graph, start_node)
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