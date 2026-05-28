// // exports.default = require('./dist/WaveGraph.node');
// const WaveGraph = require('./dist/WaveGraph.node');
// export default WaveGraph

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const WaveGraph = require('./dist/WaveGraph.node');
export default WaveGraph;