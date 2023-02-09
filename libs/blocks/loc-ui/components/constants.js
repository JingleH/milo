export const locales = [
  // 'English',
  'English (AltLang)',
  'German',
  'French',
  'French (AltLang)',
  'Japanese',
  'Arabic',
  'Bulgarian',
  'Czech',
  'Danish',
  'Spanish',
  'Spanish (AltLang)',
  'Estonian',
  'Finnish',
  'Hebrew',
  'Croatian',
  'Hungarian',
  'Italian',
  'Korean',
  'Lithuanian',
  'Latvian',
  'Dutch',
  'Norwegian',
  'Polish',
  'Portugese',
  'Romanian',
  'Russian',
  'Slovakian',
  'Slovenian',
  'Serbian',
  'Swedish',
  'Turkish',
  'Ukrainian',
  'Chinese Simplified',
  'Chinese Traditional',
  'Thai',
  'Filipino',
  'Indonesian',
  'Malay',
  'Vietnamese',
  'Hindi',
];

export const contentItems = Array.from(
  { length: 10 },
  (_value, index) => `/drafts/jinglhua/item${index + 1}`,
);

export const projectName = 'Geo Expansion 2H 2022';
// turn it into a state machine that specify transitions
// ood vs. fl?
const always = ['edit', 'preview'];
export const stateLifecycle = {
  initial: [...always, 'copy'],
  copied: [...always, 'send to glaas'],
  glaasIP: [...always, 'complete'],
  glassComplete: [...always, 'save'],
  saved: [...always, 'rollout'],
  rolledout: [...always, 'rollout'],
};
export const transitions = {
  copy: 'copied',
  'send to glaas': 'glaasIP',
  complete: 'glassComplete',
  save: 'saved',
  rollout: 'rolledout',
};
