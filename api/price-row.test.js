const test = require('node:test');
const assert = require('node:assert/strict');
const { toPriceSearchRow } = require('./price-row');

test('uses typed Supabase dealer price instead of a blank raw TMS mirror field', () => {
  const row = toPriceSearchRow({
    product_name: 'SOLEA',
    sell_price: 24500,
    dealer_price: 20000,
    material: '100% PL',
    width_mm: 1400,
    weight_gsm: 320,
    search_alias: null,
    brand_code: 'E',
    moq_or_roll: null,
    raw: { '대리점 단가': '' },
  });

  assert.deepEqual(row, ['SOLEA', '24500', '100% PL', '1400', '320', '', 'E', '20000', '']);
});
