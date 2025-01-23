import heapq


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