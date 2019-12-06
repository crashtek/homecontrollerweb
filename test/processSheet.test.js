import Discovery from '../server/discovery';
import Guidance from '../server/guidance';
import sheet from './assets/exampleSheet1.json';

const discovery = new Discovery(sheet);

discovery.dump();

const guidance = new Guidance(discovery);

guidance.dump();
