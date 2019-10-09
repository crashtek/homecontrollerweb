import Discovery from '../src/utils/discovery';
import generateGuidance from '../src/utils/generateGuidance';
import sheet from './assets/exampleSheet1.json';

const discovery = new Discovery(sheet);

generateGuidance(discovery);


