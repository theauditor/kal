import { useSettings } from '@src/settings.mjs';

const { BASE_URL } = import.meta.env;
const baseNoTrailing = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;

export function WelcomeTab({ context }) {
  const { fontFamily } = useSettings();
  return (
    <div className="prose dark:prose-invert min-w-full py-4 font-sans px-4 text-sm" style={{ fontFamily }}>
      <h3>welcome to Kāl</h3>
      <p>
        You have entered the <strong>Kāl Performance Station</strong>, a professional live coding environment for digital performances.
        Kāl brings a deeply immersive aesthetic, reactive audio visualizations, stage history tracking, and a distraction-free Zen mode to your creative process.
        <br />
        <br />
        <span className="underline">1. hit play</span> - <span className="underline">2. write some code</span> -{' '}
        <span className="underline">3. hit update</span>
      </p>
      <p>
        Be sure to click the top-left Kāl logo to enter <strong>Performance Mode</strong>, designed specifically for live shows and VJ projections.
      </p>
      <h3>acknowledgements</h3>
      <p>
        Kāl is proudly built upon the foundation of the amazing{' '}
        <a href="https://strudel.cc/" target="_blank">
          strudel
        </a>{' '}
        project, a JavaScript version of the legendary{' '}
        <a href="https://tidalcycles.org/" target="_blank">
          tidalcycles
        </a>{' '}
        live coding language. We owe a massive thank you to the maintainers and contributors of both projects for their incredible work and dedication to the open-source live coding community!
      </p>
      <p>
        Like Strudel, Kāl is free/open source software distributed under the terms of the{' '}
        <a href="https://codeberg.org/uzu/strudel/src/branch/main/LICENSE" target="_blank">
          GNU Affero General Public License
        </a>
        .
      </p>
    </div>
  );
}
