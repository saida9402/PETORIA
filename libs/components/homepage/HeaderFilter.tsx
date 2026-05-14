'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const TYPES      = ['DOG', 'CAT', 'BIRD', 'FISH'];
const CATEGORIES = ['FOOD', 'MEDICINE', 'ACCESSORY', 'TOY'];
const TYPE_ICON:  Record<string,string> = { DOG:'🐶', CAT:'🐱', BIRD:'🐦', FISH:'🐠' };
const CAT_ICON:   Record<string,string> = { FOOD:'🦴', MEDICINE:'💊', ACCESSORY:'🎀', TOY:'🎾' };

export default function HeaderFilter() {
  const router   = useRouter();
  const [keyword,  setKeyword]  = useState('');
  const [type,     setType]     = useState('');
  const [category, setCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (keyword)  params.set('text',     keyword);
    if (type)     params.set('type',     type);
    if (category) params.set('cat',      category);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    router.push(`/shop?${params.toString()}`);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  const clear = () => {
    setKeyword(''); setType(''); setCategory(''); setMinPrice(''); setMaxPrice('');
  };

  return (
    <div className="header-filter">
      {/* Search bar */}
      <div className="header-filter__search">
        <span className="header-filter__search-icon">🔍</span>
        <input
          className="header-filter__search-inp"
          placeholder="Search products, brands…"
          value={keyword}
          onChange={e => setKeyword(e.target.value)}
          onKeyDown={handleKey}
        />
        {keyword && (
          <button className="header-filter__clear-btn" onClick={() => setKeyword('')}>✕</button>
        )}
      </div>

      {/* Filters row */}
      <div className="header-filter__row">
        {/* Pet type */}
        <div className="header-filter__group">
          <label className="header-filter__label">Pet type</label>
          <div className="header-filter__chips">
            {TYPES.map(t => (
              <button
                key={t}
                onClick={() => setType(prev => prev === t ? '' : t)}
                className={`header-filter__chip${type === t ? ' header-filter__chip--on' : ''}`}
              >
                {TYPE_ICON[t]} {t[0]+t.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div className="header-filter__group">
          <label className="header-filter__label">Category</label>
          <div className="header-filter__chips">
            {CATEGORIES.map(c => (
              <button
                key={c}
                onClick={() => setCategory(prev => prev === c ? '' : c)}
                className={`header-filter__chip${category === c ? ' header-filter__chip--on' : ''}`}
              >
                {CAT_ICON[c]} {c[0]+c.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Price */}
        <div className="header-filter__group">
          <label className="header-filter__label">Price (USD)</label>
          <div className="header-filter__price">
            <input
              className="header-filter__price-inp"
              type="number" placeholder="Min" min={0}
              value={minPrice} onChange={e => setMinPrice(e.target.value)}
            />
            <span className="header-filter__price-sep">—</span>
            <input
              className="header-filter__price-inp"
              type="number" placeholder="Max" min={0}
              value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="header-filter__actions">
          <button className="btn btn--primary" onClick={handleSearch}>
            Search →
          </button>
          {(keyword || type || category || minPrice || maxPrice) && (
            <button className="btn btn--ghost btn--sm" onClick={clear}>
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
