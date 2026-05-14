# Kāl Performance Station

Kāl Performance Station is a professional, performance-oriented environment built on top of the incredible [Strudel](https://strudel.cc) project, which itself is a JavaScript port of the popular [TidalCycles](https://tidalcycles.org) live coding environment. 

Kāl aims to provide a robust, focused, and aesthetically immersive live performance tool. It takes the deeply expressive pattern-generation engine from Strudel and wraps it in a modern, dark-themed, highly-responsive digital audio workstation (DAW) and VJing interface.

## Key Features

- **Performance (Zen) Mode:** A completely distraction-free full-screen mode with transparent text editors designed specifically for live performances and projections.
- **Visualizer Suite:** A suite of high-performance WebAudio visualizers (Waveform, Ridge/Waterfall, Circle, Heatmap) that react directly to the master audio output in real time.
- **Stage Management:** Stages (projects) can be created, saved, and managed locally using an offline-first architecture powered by IndexedDB.
- **Portable `.kals` Format:** An integrated import/export system for creating portable project packages. Stages can be zipped into `.kals` files complete with their code, history, and metadata.
- **History Tracking:** Automatic snapshotting of your code whenever you play or evaluate, allowing you to instantly rollback your changes and browse your coding history.
- **Custom Kāl Aesthetic:** A beautiful gold-and-black dark theme, featuring smooth micro-animations and typography designed for extended live coding sessions.

## Acknowledgements

Kāl Performance Station stands on the shoulders of giants. We would like to extend our deepest gratitude to:
- The **[Strudel Project](https://strudel.cc/)** and its maintainers for creating an incredible JavaScript live coding engine.
- The **[TidalCycles](https://tidalcycles.org)** community for pioneering expressive algorithmic composition.

## Running Locally

After cloning the project, you can run the REPL locally:

1. Install [Node.js](https://nodejs.org/) 18 or newer
2. Install [pnpm](https://pnpm.io/installation)
3. Install dependencies by running the following command:
   ```bash
   pnpm i
   ```
4. Run the development server:
   ```bash
   pnpm dev
   ```

## Using Strudel / Kāl Engine

This project contains many packages, which are available on npm.
Read more about how to use these in your own project [here](https://strudel.cc/technical-manual/project-start).

## License

This project is distributed under the [GNU Affero General Public License v3](LICENSE). As such, code can only be shared within free/open source projects under the same license -- see the license for details.

Licensing info for the default sound banks can be found over on the [dough-samples](https://github.com/felixroos/dough-samples/blob/main/README.md) repository.
