(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.GrammarGrillModel = api;
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const CATALOG = [
    { id:'hamburger', category:'burgers', name:'Hamburger', description:'Beef patty, pickles and onions.', prices:{default:35}, requiresSize:false },
    { id:'cheeseburger', category:'burgers', name:'Cheeseburger', description:'Beef patty with melted cheese.', prices:{default:40}, requiresSize:false },
    { id:'big-mac', category:'burgers', name:'Big Mac', description:'Two patties and special sauce.', prices:{default:75}, requiresSize:false, featured:true },
    { id:'quarter-pounder', category:'burgers', name:'Quarter Pounder', description:'Quarter-pound beef patty and cheese.', prices:{default:85}, requiresSize:false },
    { id:'mcchicken', category:'burgers', name:'McChicken', description:'Crispy chicken, lettuce and mayo.', prices:{default:65}, requiresSize:false },
    { id:'fries', category:'sides', name:'Fries', description:'Golden and crispy.', prices:{small:30,medium:40,large:50}, requiresSize:true },
    { id:'apple-slices', category:'sides', name:'Apple Slices', description:'Fresh sliced apple.', prices:{default:25}, requiresSize:false },
    { id:'soda', category:'drinks', name:'Soda', description:'Cold fountain drink.', prices:{small:25,medium:30,large:35}, requiresSize:true },
    { id:'coffee', category:'drinks', name:'Coffee', description:'Freshly brewed coffee.', prices:{default:30}, requiresSize:false },
    { id:'bottled-water', category:'drinks', name:'Bottled Water', description:'Chilled bottled water.', prices:{default:25}, requiresSize:false },
    { id:'big-mac-combo', category:'combos', name:'Big Mac Combo', description:'Big Mac, fries and soda.', prices:{small:100,medium:110,large:120}, requiresSize:true, comboContents:['big-mac','fries','soda'] },
    { id:'quarter-pounder-combo', category:'combos', name:'Quarter Pounder Combo', description:'Quarter Pounder, fries and soda.', prices:{small:110,medium:120,large:130}, requiresSize:true, comboContents:['quarter-pounder','fries','soda'] },
    { id:'mcchicken-combo', category:'combos', name:'McChicken Combo', description:'McChicken, fries and soda.', prices:{small:85,medium:95,large:105}, requiresSize:true, comboContents:['mcchicken','fries','soda'] }
  ];

  function lineKey(line) {
    return line.productId + '::' + (line.size || '');
  }

  function normalizeOrder(order) {
    const grouped = new Map();
    (order.items || []).forEach((line) => {
      const clean = {
        productId: String(line.productId),
        size: line.size || null,
        quantity: Math.max(1, Number(line.quantity) || 1)
      };
      const key = lineKey(clean);
      grouped.set(key, {
        ...clean,
        quantity: (grouped.get(key)?.quantity || 0) + clean.quantity
      });
    });
    return {
      items: [...grouped.values()].sort((a, b) => lineKey(a).localeCompare(lineKey(b)))
    };
  }

  function itemById(id, catalog = CATALOG) {
    return catalog.find((item) => item.id === id);
  }

  function unitPrice(line, catalog = CATALOG) {
    const item = itemById(line.productId, catalog);
    if (!item) throw new Error('Unknown product: ' + line.productId);
    const key = item.requiresSize ? line.size : 'default';
    if (!key || item.prices[key] == null) throw new Error('Invalid size for ' + item.name);
    return item.prices[key];
  }

  function calculateTotal(order, catalog = CATALOG) {
    return normalizeOrder(order).items.reduce(
      (sum, line) => sum + unitPrice(line, catalog) * line.quantity,
      0
    );
  }

  function pluralName(item, quantity) {
    return quantity === 1 ? item.name : item.name + (item.name.endsWith('s') ? '' : 's');
  }

  function titleCase(value) {
    return value[0].toUpperCase() + value.slice(1);
  }

  function labelLine(line, catalog = CATALOG) {
    const item = itemById(line.productId, catalog);
    const size = line.size ? titleCase(line.size) + ' ' : '';
    return line.quantity + ' ' + size + pluralName(item, line.quantity);
  }

  function compareOrders(target, attempt, catalog = CATALOG) {
    const wanted = normalizeOrder(target).items;
    const actual = normalizeOrder(attempt).items;
    const feedback = [];
    const unmatchedActual = new Map(actual.map((line) => [lineKey(line), line]));

    wanted.forEach((line) => {
      const exact = unmatchedActual.get(lineKey(line));
      const item = itemById(line.productId, catalog);
      if (exact) {
        unmatchedActual.delete(lineKey(line));
        if (line.quantity !== exact.quantity) {
          feedback.push('You need ' + line.quantity + ' ' + pluralName(item, line.quantity));
        }
        return;
      }

      const wrongSize = [...unmatchedActual.values()].find(
        (candidate) => candidate.productId === line.productId
      );
      if (wrongSize) {
        unmatchedActual.delete(lineKey(wrongSize));
        feedback.push('Change ' + item.name + ' to ' + titleCase(line.size));
        return;
      }

      feedback.push('Missing: ' + labelLine(line, catalog));
    });

    unmatchedActual.forEach((line) => {
      feedback.push('Remove: ' + labelLine(line, catalog));
    });

    return { matches: feedback.length === 0, feedback };
  }

  function pick(list, random) {
    return list[Math.floor(random() * list.length)];
  }

  function createRandomOrder(catalog = CATALOG, random = Math.random) {
    const mains = catalog.filter(
      (item) => item.category === 'burgers' || item.category === 'combos'
    );
    const first = pick(mains, random);
    const desiredCount = 1 + Math.floor(random() * 4);
    const pool = catalog.filter((item) => item.id !== first.id);
    const selected = [first];

    while (selected.length < desiredCount && pool.length) {
      selected.push(pool.splice(Math.floor(random() * pool.length), 1)[0]);
    }

    return {
      items: selected.map((item) => ({
        productId: item.id,
        size: item.requiresSize ? pick(['small', 'medium', 'large'], random) : null,
        quantity: random() > .72 ? 2 : 1
      }))
    };
  }

  return {
    CATALOG,
    normalizeOrder,
    calculateTotal,
    compareOrders,
    createRandomOrder,
    labelLine
  };
}));
