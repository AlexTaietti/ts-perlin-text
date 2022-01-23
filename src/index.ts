import './scss/style.scss';
import { PerlinText } from './PerlinText';

const body = document.getElementById('text-container');
const perlinText = new PerlinText(body, 'Hello!', 250, "Sans-Serif");

perlinText.animate();