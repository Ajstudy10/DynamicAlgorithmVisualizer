class AVLNode:
    def __init__(self, key):
        self.key = key
        self.left = None
        self.right = None
        self.height = 1
        self.rotation_info = None

class AVLTree:
    def __init__(self):
        self.root = None

    def height(self, node):
        if not node:
            return 0
        return node.height

    def balance_factor(self, node):
        if not node:
            return 0
        return self.height(node.left) - self.height(node.right)

    def update_height(self, node):
        if not node:
            return 0
        node.height = 1 + max(
            self.height(node.left), 
            self.height(node.right)
        )
        return node.height

    def rotate_right(self, y):
        x = y.left
        T2 = x.right

        # Perform rotation
        x.right = y
        y.left = T2

        # Update heights
        self.update_height(y)
        self.update_height(x)

        # Add rotation info
        x.rotation_info = {
            'type': 'Right Rotation (LL)',
            'description': 'Left subtree is too heavy. Rotating to the right.',
            'nodes': [y.key, x.key]
        }

        return x

    def rotate_left(self, x):
        y = x.right
        T2 = y.left

        # Perform rotation
        y.left = x
        x.right = T2

        # Update heights
        self.update_height(x)
        self.update_height(y)

        # Add rotation info
        y.rotation_info = {
            'type': 'Left Rotation (RR)',
            'description': 'Right subtree is too heavy. Rotating to the left.',
            'nodes': [x.key, y.key]
        }

        return y

    def insert(self, root, key):
        # Standard BST insertion
        if not root:
            return AVLNode(key)

        # Prevent duplicate keys
        if key == root.key:
            return root

        if key < root.key:
            root.left = self.insert(root.left, key)
        else:
            root.right = self.insert(root.right, key)

        # Update height of current node
        self.update_height(root)

        # Get the balance factor
        balance = self.balance_factor(root)

        # Rotation tracking
        rotation_info = {
            'type': None,
            'description': None,
            'nodes': [root.key]
        }

        # Left Left Case
        if balance > 1 and key < root.left.key:
            rotation_info.update({
                'type': 'LL Rotation',
                'description': 'Left subtree is too heavy. Performing right rotation.',
                'nodes': [root.key, root.left.key]
            })
            rotated_root = self.rotate_right(root)
            rotated_root.rotation_info = rotation_info
            return rotated_root

        # Right Right Case
        if balance < -1 and key > root.right.key:
            rotation_info.update({
                'type': 'RR Rotation',
                'description': 'Right subtree is too heavy. Performing left rotation.',
                'nodes': [root.key, root.right.key]
            })
            rotated_root = self.rotate_left(root)
            rotated_root.rotation_info = rotation_info
            return rotated_root

        # Left Right Case
        if balance > 1 and key > root.left.key:
            rotation_info.update({
                'type': 'LR Rotation',
                'description': 'Left-Right imbalance. Performing double rotation.',
                'nodes': [root.key, root.left.key, key]
            })
            root.left = self.rotate_left(root.left)
            rotated_root = self.rotate_right(root)
            rotated_root.rotation_info = rotation_info
            return rotated_root

        # Right Left Case
        if balance < -1 and key < root.right.key:
            rotation_info.update({
                'type': 'RL Rotation',
                'description': 'Right-Left imbalance. Performing double rotation.',
                'nodes': [root.key, root.right.key, key]
            })
            root.right = self.rotate_right(root.right)
            rotated_root = self.rotate_left(root)
            rotated_root.rotation_info = rotation_info
            return rotated_root

        return root

    def insert_key(self, key):
        self.root = self.insert(self.root, key)

    def get_tree_structure(self):
        def serialize_node(node):
            if not node:
                return None
            return {
                'key': node.key,
                'height': node.height,
                'rotation_info': node.rotation_info,
                'left': serialize_node(node.left),
                'right': serialize_node(node.right)
            }
        
        return serialize_node(self.root)

    def get_insertion_steps(self, keys):
        # Validate input
        if not keys:
            raise ValueError("Keys list cannot be empty")
        
        # Remove duplicates while preserving order
        unique_keys = []
        seen = set()
        for key in keys:
            # Validate key is an integer
            try:
                key = int(key)
            except (ValueError, TypeError):
                raise ValueError(f"Invalid key: {key}. All keys must be integers.")
            
            if key not in seen:
                unique_keys.append(key)
                seen.add(key)

        # Perform insertion steps
        steps = []
        tree = AVLTree()

        # Initial state
        steps.append({
            'description': 'Initialize empty AVL Tree',
            'tree': None,
            'keys': unique_keys
        })

        for key in unique_keys:
            # Before insertion step
            steps.append({
                'description': f'Preparing to insert {key}',
                'tree': tree.get_tree_structure(),
                'currentKey': key
            })

            # Perform insertion
            tree.insert_key(key)

            # After insertion step
            current_step = {
                'description': f'Inserted {key}',
                'tree': tree.get_tree_structure(),
                'currentKey': key
            }

            # Add rotation information if exists
            if tree.root and tree.root.rotation_info:
                current_step.update({
                    'rotationType': tree.root.rotation_info['type'],
                    'rotationDescription': tree.root.rotation_info['description'],
                    'involvedNodes': tree.root.rotation_info['nodes']
                })

            steps.append(current_step)

        return steps