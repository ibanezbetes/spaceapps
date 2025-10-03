import { Category } from '../lib/types';
import './CategoryBar.css';

interface CategoryBarProps {
  selectedCategories: Category[];
  onToggleCategory: (category: Category) => void;
}

const CATEGORIES: { value: Category; label: string; key: string }[] = [
  { value: 'stars', label: 'Stars', key: '1' },
  { value: 'star-systems', label: 'Star Systems', key: '2' },
  { value: 'galaxies', label: 'Galaxies', key: '3' },
  { value: 'nebulae', label: 'Nebulae', key: '4' },
  { value: 'clusters', label: 'Clusters', key: '5' },
  { value: 'constellations', label: 'Constellations', key: '6' },
  { value: 'planets', label: 'Planets', key: '7' },
  { value: 'moons', label: 'Moons', key: '8' },
  { value: 'comets', label: 'Comets', key: '9' },
];

export function CategoryBar({ selectedCategories, onToggleCategory }: CategoryBarProps) {
  return (
    <div className="category-bar" role="toolbar" aria-label="Object categories">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategories.includes(cat.value);
        return (
          <button
            key={cat.value}
            className={`category-btn ${isSelected ? 'selected' : ''}`}
            onClick={() => onToggleCategory(cat.value)}
            aria-pressed={isSelected}
            title={`Toggle ${cat.label} (${cat.key})`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}
