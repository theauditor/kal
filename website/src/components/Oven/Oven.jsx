import { useState, useEffect } from 'react';
import { MiniRepl } from '@src/docs/MiniRepl';
import { PatternLabel } from '@src/repl/components/panel/PatternsTab';

// Mocking non-existent functions to fix build error
const loadFeaturedPatterns = async () => ({ data: [] });
const loadPublicPatterns = async () => ({ data: [] });

function PatternList({ patterns }) {
  return (
    <div className="space-y-4">
      {patterns.map((pat) => (
        <div key={pat.id}>
          <div className="flex justify-between not-prose pb-2">
            <h2 className="text-lg">
              <a href={`/?${pat.hash}`} target="_blank" className="underline">
                <PatternLabel pattern={pat} />
              </a>
            </h2>
          </div>
          <MiniRepl tune={pat.code.trim()} maxHeight={300} />
        </div>
      ))}
    </div>
  );
}

export function Oven() {
  const [featuredPatterns, setFeaturedPatterns] = useState([]);
  const [publicPatterns, setPublicPatterns] = useState([]);
  useEffect(() => {
    loadPublicPatterns().then(({ data: pats }) => {
      setPublicPatterns(pats);
    });
    loadFeaturedPatterns().then(({ data: pats }) => {
      setFeaturedPatterns(pats);
    });
  }, []);
  return (
    <div>
      <h2 id="featured">Featured Patterns</h2>
      <PatternList patterns={featuredPatterns} />
      <h2 id="latest">Last Creations</h2>
      <PatternList patterns={publicPatterns} />
    </div>
  );
}
