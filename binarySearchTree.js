const Node = (data, left = null, right = null) => ({ data, left, right });

const Tree = (arr) => {
  // Remove duplicates and sort values of passed array
  const sortedArray = [...new Set(arr)].sort((a, b) => ((a > b) ? 1 : -1));

  /* Copy of the values in sorted array and where new node values will be pushed.
  Useful for checking if a value is already a node in the tree */
  const valuesArray = [...sortedArray];

  const buildTree = (array, start, end) => {
    if (start > end) return null;

    const middle = Math.floor((start + end) / 2);
    const node = Node(array[middle]);

    node.left = buildTree(array, start, middle - 1);
    node.right = buildTree(array, middle + 1, end);

    return node;
  };

  let root = buildTree(sortedArray, 0, sortedArray.length - 1);

  // Recursively finds the node
  const find = (value, node = root) => {
    if (!valuesArray.includes(value)) return null;
    if (node === null || node.data === value) return node;

    if (node.data > value) return find(value, node.left);
    return find(value, node.right);
  };

  /* Recursively finds the parent node of the value passed.
  If the value doesn't exist in the tree,
  it returns the node with the closest value */
  const findParentNode = (value, node = root, prevNode = null) => {
    // Exit condition for the recursion
    if (node === null || node.data === value) return prevNode;

    // Recursion goes brrrrrr
    if (node.data > value) return findParentNode(value, node.left, node);
    return findParentNode(value, node.right, node);
  };

  const insert = (value) => {
    // Exit early if the value is already a node in the tree
    if (valuesArray.includes(value)) return;

    const nearestNode = findParentNode(value);

    // Instantiate a new node and attach it to the nearest node
    if (nearestNode.data > value) nearestNode.left = Node(value);
    if (nearestNode.data < value) nearestNode.right = Node(value);

    valuesArray.push(value);
  };

  const remove = (value, node = root) => {
    // Exit function if value passed is not in the tree, otherwise continue
    if (!valuesArray.includes(value)) return;

    const target = find(value, node);
    const parent = findParentNode(value);

    if (parent.data > value) {
      // Only runs if target has no child
      if (target.left === null && target.right === null) parent.left = null;

      // Only runs if target has only one child
      if (target.left === null && target.right !== null) parent.left = target.right;
      if (target.left !== null && target.right === null) parent.left = target.left;
    } else {
      // Same as above but if parent.data is less than or equal the value
      if (target.left === null && target.right === null) parent.right = null;
      if (target.left === null && target.right !== null) parent.right = target.right;
      if (target.left !== null && target.right === null) parent.right = target.left;
    }

    // Only runs if target has two children
    if (target.left !== null && target.right !== null) {
      /* The findParentNode() function accepts an optional node parameter,
      which we're setting to target.right to make sure it won't find the value
      we're passing. If it can't find the value, it's designed to return
      the node with the closest value it can find instead. */
      const nearestBiggerNode = findParentNode(value, target.right);

      /* Instantiate new node using the data of
      nearest bigger node and target node's left child as parameters */
      const newChild = Node(nearestBiggerNode.data, target.left);

      // Remove nearest bigger node from the tree
      remove(nearestBiggerNode.data, nearestBiggerNode);

      /* Add nearest bigger node's value back to valuesArray because
      it will get removed from the recursion */
      valuesArray.push(nearestBiggerNode.data);

      /* Nearest bigger node will always be at the right subtree,
       which is why the right child is added only after the removal
       of the nearest bigger node. */
      newChild.right = target.right;

      // Set the newChild node as new child of the target node's parent
      if (parent.data > value) parent.left = newChild;
      if (parent.data < value) parent.right = newChild;
    }

    // Remove value passed from valuesArray
    const index = valuesArray.indexOf(value);
    valuesArray.splice(index, 1);
  };

  const levelOrder = (callback = null) => {
    const queue = [root];
    const values = [];

    while (queue.length > 0) {
      const node = queue.shift();

      if (callback !== null) callback(node);

      if (node !== null) {
        if (node.left !== null) queue.push(node.left);
        if (node.right !== null) queue.push(node.right);
        values.push(node.data);
      }
    }

    if (callback === null) return values;
  };

  const preorder = (callback = null) => {
    const stack = [root];
    const values = [];

    while (stack.length > 0) {
      const node = stack.pop();

      if (callback !== null) callback(node);

      if (node !== null) {
        if (node.right !== null) stack.push(node.right);
        if (node.left !== null) stack.push(node.left);
        values.push(node.data);
      }
    }

    if (callback === null) return values;
  };

  const inorder = (callback = null) => {
    const stack = [];
    const values = [];

    // Pushes the left subtrees to the stack
    const pushLeft = (node) => {
      let currentNode = node;

      while (currentNode !== null) {
        stack.push(currentNode);
        currentNode = currentNode.left;
      }
    };

    const processNodes = () => {
      while (stack.length > 0) {
        const node = stack.pop();

        if (callback !== null) callback(node);
        values.push(node.data);

        if (node.right !== null) {
          pushLeft(node.right);
        }
      }
    };

    pushLeft(root);
    processNodes();

    if (callback === null) return values;
  };

  const postorder = (callback = null) => {
    const mainStack = [root];
    const tempStack = [];
    const values = [];

    while (mainStack.length > 0) {
      const node = mainStack.pop();
      tempStack.push(node);
      values.unshift(node.data);

      if (node.left !== null) mainStack.push(node.left);
      if (node.right !== null) mainStack.push(node.right);
    }

    if (callback === null) return values;

    while (tempStack.length > 0) {
      const node = tempStack.pop();
      callback(node);
    }
  };

  const height = (node) => {
    if (node === null) return -1;

    const leftHeight = height(node.left);
    const rightHeight = height(node.right);

    return Math.max(leftHeight, rightHeight) + 1;
  };

  const depth = ({ data }) => {
    let currentDepth = 0;
    let currentNode = root;

    while (data !== currentNode.data) {
      while (data < currentNode.data) {
        currentNode = currentNode.left;
        currentDepth += 1;
      }

      while (data > currentNode.data) {
        currentNode = currentNode.right;
        currentDepth += 1;
      }
    }

    return currentDepth;
  };

  const isBalanced = () => {
    const values = [...valuesArray];
    let result = true;

    while (values.length > 0) {
      const node = find(values.pop());
      const leftSubtree = height(node.left);
      const rightSubtree = height(node.right);

      /* Set result to false and break the loop if difference
       between left and right subtree height is more than 1 */
      if ((leftSubtree - rightSubtree) > 1 || (leftSubtree - rightSubtree) < -1) {
        result = false;
        break;
      }
    }

    return result;
  };

  const rebalance = () => {
    const newArray = inorder();
    root = buildTree(newArray, 0, newArray.length - 1);
  };

  const prettyPrint = (node = root, prefix = '', isLeft = true) => {
    if (node.right !== null) {
      prettyPrint(node.right, `${prefix}${isLeft ? '│   ' : '    '}`, false);
    }
    console.log(`${prefix}${isLeft ? '└── ' : '┌── '}${node.data}`);

    if (node.left !== null) {
      prettyPrint(node.left, `${prefix}${isLeft ? '    ' : '│   '}`, true);
    }
  };

  return {
    buildTree,
    find,
    insert,
    remove,
    levelOrder,
    preorder,
    inorder,
    postorder,
    height,
    depth,
    isBalanced,
    rebalance,
    prettyPrint,
  };
};

// ---------------------------Tests--------------------------- //
const generateArray = (length = 20) => {
  const array = [];
  while (array.length < length) array.push(Math.floor(Math.random() * 1000));
  return array;
};

const array = generateArray();

// Create binary search tree from array with random numbers 0 - 1000
const testTree = Tree(array);
console.log('Balanced Binary Search Tree');
testTree.prettyPrint();

// Confirm it's balanced
console.log(`Is it balanced: ${testTree.isBalanced()}`);

// Print out elements in level, pre, post, and in order
console.log({
  level: testTree.levelOrder(),
  pre: testTree.preorder(),
  post: testTree.postorder(),
  inorder: testTree.inorder(),
});

// Unbalance the tree
testTree.insert(428);
testTree.insert(463);
testTree.insert(420);
testTree.insert(455);

// Confirm the tree is imbalanced
testTree.prettyPrint();
console.log(`Is it balanced: ${testTree.isBalanced()}`);

// Balance the tree
testTree.rebalance();

// Confirm the tree is balanced
console.log(' ');
console.log('Rebalanced Tree');
console.log(`Is it balanced: ${testTree.isBalanced()}`);
testTree.prettyPrint();

// Print out elements in level, pre, post, and in order
console.log({
  level: testTree.levelOrder(),
  pre: testTree.preorder(),
  post: testTree.postorder(),
  inorder: testTree.inorder(),
});
