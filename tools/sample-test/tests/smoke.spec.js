// One smoke test per runnable sample (every manifest entry except `class`): open it in DWC, observe it,
// classify it, write results/samples/<app>.json. A red sample is a finding, not a harness failure.
import { sampleApps } from '../lib/apps.js';
import { smokeTest } from '../lib/behaviour.js';

for (const app of sampleApps()) smokeTest(app);
