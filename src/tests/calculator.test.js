const { execFileSync, spawnSync } = require('child_process');
const path = require('path');
const { calculate } = require('../calculator');

const CLI = path.join(__dirname, '..', 'calculator.js');

describe('addition', () => {
  test('2 + 3 = 5', () => expect(calculate('add', 2, 3)).toBe(5));
  test('negative numbers', () => expect(calculate('add', -2, -3)).toBe(-5));
  test('adding zero', () => expect(calculate('add', 7, 0)).toBe(7));
  test('decimals', () => expect(calculate('add', 0.5, 0.25)).toBeCloseTo(0.75));
  test('+ alias', () => expect(calculate('+', 2, 3)).toBe(5));
});

describe('subtraction', () => {
  test('10 - 4 = 6', () => expect(calculate('subtract', 10, 4)).toBe(6));
  test('result is negative', () => expect(calculate('subtract', 4, 10)).toBe(-6));
  test('subtracting zero', () => expect(calculate('subtract', 5, 0)).toBe(5));
  test('decimals', () => expect(calculate('subtract', 1.5, 0.5)).toBe(1));
  test('- alias', () => expect(calculate('-', 10, 4)).toBe(6));
});

describe('multiplication', () => {
  test('45 * 2 = 90', () => expect(calculate('multiply', 45, 2)).toBe(90));
  test('by zero', () => expect(calculate('multiply', 9, 0)).toBe(0));
  test('negative times positive', () => expect(calculate('multiply', -3, 4)).toBe(-12));
  test('negative times negative', () => expect(calculate('multiply', -3, -4)).toBe(12));
  test('decimals', () => expect(calculate('multiply', 0.5, 4)).toBe(2));
  test('* and x aliases', () => {
    expect(calculate('*', 45, 2)).toBe(90);
    expect(calculate('x', 45, 2)).toBe(90);
  });
});

describe('division', () => {
  test('20 / 5 = 4', () => expect(calculate('divide', 20, 5)).toBe(4));
  test('non-integer result', () => expect(calculate('divide', 6, 4)).toBe(1.5));
  test('negative divisor', () => expect(calculate('divide', 10, -2)).toBe(-5));
  test('zero dividend', () => expect(calculate('divide', 0, 5)).toBe(0));
  test('/ alias', () => expect(calculate('/', 20, 5)).toBe(4));
  test('division by zero throws', () => {
    expect(() => calculate('divide', 1, 0)).toThrow('Division by zero');
  });
  test('0 / 0 throws', () => {
    expect(() => calculate('divide', 0, 0)).toThrow('Division by zero');
  });
});

describe('modulo', () => {
  test('remainder of positive numbers', () => expect(calculate('modulo', 10, 3)).toBe(1));
  test('negative dividend', () => expect(calculate('modulo', -10, 3)).toBe(-1));
  test('% alias', () => expect(calculate('%', 10, 3)).toBe(1));
  test('modulo by zero throws', () => {
    expect(() => calculate('modulo', 10, 0)).toThrow('Modulo by zero');
  });
});

describe('power', () => {
  test('positive exponent', () => expect(calculate('power', 2, 3)).toBe(8));
  test('zero exponent', () => expect(calculate('power', 5, 0)).toBe(1));
  test('negative exponent', () => expect(calculate('power', 2, -2)).toBe(0.25));
  test('^ alias', () => expect(calculate('^', 2, 3)).toBe(8));
});

describe('square root', () => {
  test('square root of a positive number', () => expect(calculate('squareRoot', 9)).toBe(3));
  test('square root of zero', () => expect(calculate('sqrt', 0)).toBe(0));
  test('negative number throws', () => {
    expect(() => calculate('squareRoot', -1)).toThrow('negative number');
  });
});

describe('invalid input', () => {
  test('unknown operation', () => {
    expect(() => calculate('unknown', 1, 2)).toThrow('Unknown operation');
  });
  test('NaN operand', () => {
    expect(() => calculate('add', NaN, 2)).toThrow('valid numbers');
  });
  test('Infinity operand', () => {
    expect(() => calculate('add', Infinity, 2)).toThrow('valid numbers');
  });
});

describe('command line', () => {
  const run = (...args) => spawnSync('node', [CLI, ...args], { encoding: 'utf8' });

  test.each([
    [['add', '2', '3'], '5'],
    [['subtract', '10', '4'], '6'],
    [['multiply', '45', '2'], '90'],
    [['divide', '20', '5'], '4'],
    [['modulo', '10', '3'], '1'],
    [['power', '2', '3'], '8'],
    [['sqrt', '9'], '3'],
  ])('%j prints %s', (args, expected) => {
    expect(execFileSync('node', [CLI, ...args], { encoding: 'utf8' }).trim()).toBe(expected);
  });

  test('division by zero exits with error', () => {
    const r = run('divide', '1', '0');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Division by zero');
  });

  test('modulo by zero exits with error', () => {
    const r = run('modulo', '10', '0');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Modulo by zero');
  });

  test('square root of a negative number exits with error', () => {
    const r = run('sqrt', '-1');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('negative number');
  });

  test('non-numeric operand exits with error', () => {
    const r = run('add', 'abc', '2');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('valid numbers');
  });

  test('wrong argument count prints usage', () => {
    const r = run('add', '1');
    expect(r.status).toBe(1);
    expect(r.stderr).toContain('Usage');
  });
});
