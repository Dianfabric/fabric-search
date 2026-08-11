function value(row, typedKey, rawKey) {
  const typed = row[typedKey];
  if (typed !== null && typed !== undefined && typed !== '') return typed;
  return row.raw && row.raw[rawKey] !== undefined && row.raw[rawKey] !== null ? row.raw[rawKey] : '';
}

function text(value) {
  return value === null || value === undefined ? '' : String(value);
}

function toPriceSearchRow(row) {
  return [
    text(row.product_name),
    text(value(row, 'sell_price', '원단단가/Y')),
    text(value(row, 'material', '소재')),
    text(value(row, 'width_mm', '폭')),
    text(value(row, 'weight_gsm', '무게(gsm)')),
    text(value(row, 'search_alias', '이름 보조 검색')),
    text(value(row, 'brand_code', '브랜드 약자')),
    text(value(row, 'dealer_price', '대리점 단가')),
    text(value(row, 'moq_or_roll', 'MOQ or ROLL')),
  ];
}

module.exports = { toPriceSearchRow };
