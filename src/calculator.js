#!/usr/bin/env node
/**
 * Node.js CLI calculator.
 *
 * Supported operations:
 *   add (+)       - Addition
 *   subtract (-)  - Subtraction
 *   multiply (*)  - Multiplication
 *   divide (/)    - Division (division by zero is an error)
 *   modulo (%)    - Remainder (modulo by zero is an error)
 *   power (^)     - Exponentiation
 *   squareRoot    - Square root (negative numbers are an error)
 *
 * Usage: node src/calculator.js <operation> <num1> [num2]
 * Example: node src/calculator.js add 2 3
 */

const operations = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  multiply: (a, b) => a * b,
  divide: (a, b) => {
    if (b === 0) throw new Error('Division by zero is not allowed.');
    return a / b;
  },
  modulo: (a, b) => {
    if (b === 0) throw new Error('Modulo by zero is not allowed.');
    return a % b;
  },
  power: (base, exponent) => base ** exponent,
  squareRoot: (n) => {
    if (n < 0) throw new Error('Square root of a negative number is not allowed.');
    return Math.sqrt(n);
  },
};

// Accept symbol aliases for each operation.
const aliases = {
  '+': 'add',
  '-': 'subtract',
  '*': 'multiply',
  x: 'multiply',
  '/': 'divide',
  '%': 'modulo',
  '^': 'power',
  sqrt: 'squareRoot',
};

function calculate(operation, a, b) {
  const name = aliases[operation] || operation;
  const fn = operations[name];
  if (!fn) {
    throw new Error(
      `Unknown operation "${operation}". Use: add, subtract, multiply, divide, modulo, power, squareRoot.`
    );
  }
  const unary = name === 'squareRoot';
  if (!Number.isFinite(a) || (!unary && !Number.isFinite(b))) {
    throw new Error(unary ? 'Operand must be a valid number.' : 'Both operands must be valid numbers.');
  }
  return unary ? fn(a) : fn(a, b);
}

function main(argv) {
  const [operation, x, y] = argv;
  const name = aliases[operation] || operation;
  const unary = name === 'squareRoot';
  if (argv.length !== (unary ? 2 : 3)) {
    console.error('Usage: node src/calculator.js <operation> <num1> [num2]');
    process.exit(1);
  }
  try {
    const toNum = (s) => (s.trim() === '' ? NaN : Number(s));
    console.log(calculate(operation, toNum(x), unary ? undefined : toNum(y)));
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

if (require.main === module) main(process.argv.slice(2));

module.exports = { calculate };
