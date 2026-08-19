const assert = require('node:assert/strict');
const model = require('../ingles/recursos/grammar-grill-model.js');

const {
  CATALOG,
  calculateTotal,
  normalizeOrder,
  compareOrders,
  createRandomOrder
} = model;

assert.equal(CATALOG.length, 13);
assert.equal(CATALOG.filter((item) => item.requiresSize).length, 5);
assert.equal(CATALOG.find((item) => item.id === 'big-mac').prices.default, 75);
assert.deepEqual(
  CATALOG.find((item) => item.id === 'big-mac-combo').prices,
  { small: 100, medium: 110, large: 120 }
);

const orderA = {
  items: [
    { productId: 'soda', size: 'large', quantity: 1 },
    { productId: 'big-mac', size: null, quantity: 2 }
  ]
};
const orderB = {
  items: [
    { productId: 'big-mac', quantity: 1 },
    { productId: 'big-mac', size: null, quantity: 1 },
    { productId: 'soda', size: 'large', quantity: 1 }
  ]
};
assert.deepEqual(normalizeOrder(orderA), normalizeOrder(orderB));
assert.equal(compareOrders(orderA, orderB).matches, true);
assert.equal(calculateTotal(orderA, CATALOG), 185);

assert.deepEqual(
  compareOrders(
    { items: [{ productId: 'fries', size: 'large', quantity: 1 }] },
    { items: [{ productId: 'fries', size: 'small', quantity: 1 }] }
  ).feedback,
  ['Change Fries to Large']
);

assert.deepEqual(
  compareOrders(
    { items: [{ productId: 'cheeseburger', size: null, quantity: 2 }] },
    { items: [{ productId: 'cheeseburger', size: null, quantity: 1 }] }
  ).feedback,
  ['You need 2 Cheeseburgers']
);

assert.deepEqual(
  compareOrders(
    { items: [{ productId: 'fries', size: 'large', quantity: 1 }] },
    {
      items: [
        { productId: 'fries', size: 'large', quantity: 1 },
        { productId: 'fries', size: 'small', quantity: 1 }
      ]
    }
  ).feedback,
  ['Remove: 1 Small Fries']
);

for (let i = 0; i < 100; i += 1) {
  let n = (i + 1) / 101;
  const random = () => {
    n = (n * 9301 + 49297) % 233280;
    return n / 233280;
  };
  const order = createRandomOrder(CATALOG, random);
  assert.ok(order.items.length >= 1 && order.items.length <= 4);
  assert.ok(order.items.some((line) => {
    const item = CATALOG.find((entry) => entry.id === line.productId);
    return item.category === 'burgers' || item.category === 'combos';
  }));
  order.items.forEach((line) => {
    const item = CATALOG.find((entry) => entry.id === line.productId);
    assert.ok(item);
    assert.ok(line.quantity === 1 || line.quantity === 2);
    assert.equal(item.requiresSize, line.size !== null);
  });
}

console.log('grammar-grill model: PASS');
