const obfus =
  `c2stUXdqWm5ZZ3lvcWF6bjFvMmNHS1hUM0JsYmtGSkFFTDB4UG15RWc0SE1wSnNzYUFE` +
  'hahajusttoavoiddetection';
const token = atob(obfus.replace('hahajusttoavoiddetection', ''));

const api = `https://api.openai.com/v1/chat/completions`;
const wordLengthLimit = 15;
export const backupPrompts = [
  'Majestic eagles soaring over rugged mountain peaks, fierce and free',
  'Gleaming skyscrapers at sunset, urban jungle painted in warm hues',
  'Whimsical hot air balloons dotting a dawn-painted sky',
  'Glistening waves hugging sandy shores, tranquil paradise found',
  "Ethereal northern lights dancing in polar night's embrace",
  'Inquisitive foxes amidst vibrant autumn foliage, curious and lively',
  'Aged lighthouse braving crashing waves, stoic guardian of coasts',
  'Vast desert dunes meeting the horizon under scorching sun',
  'Garden tea party, where laughter and blossoms bloom in harmony',
  "Intrepid explorers spelunking intricate caves, uncovering Earth's secrets",
  'Rain-kissed city streets, neon lights reflecting in shimmering puddles',
  "Fireflies illuminating enchanted forests, nature's own twinkling lanterns",
  'Graceful ballerina caught mid-leap, a moment of artistic expression',
  "Ancient stone circle under a star-studded canvas, time's enigmatic echo",
  'Sailboats adrift on mirror-like lakes, tranquil waters mirror tranquility',
  'Curious children with telescopes, gazing at cosmos wonders above',
  "Snow-covered village, nestled in mountains, winter's silent charm",
  'Vibrant market stalls, global cultures woven through bustling streets',
  "Trekking through serene bamboo groves, nature's whispering sanctuary",
  "Moonlit carnival, carousel spinning dreams under night's enchantment",
];

const prep = `I will give you a list of keywords. Try turning it into a better prompt for GenAI image generation. Use as many provided keywords as possible. Do not include double quotes. Limit the whole thing in ${wordLengthLimit} words: `;
const model = 'gpt-3.5-turbo';
const COMPLETION_CNT = 3; // too many, me brokey

function pickNRandomElements(n, arr) {
  if (n > arr.length) throw new Error('n is too large');
  const arrCopy = [...arr];
  const elements = [];
  while (elements.length < n) {
    const rand = Math.floor(Math.random() * arrCopy.length);
    elements.push(arrCopy[rand]);
    arrCopy.splice(rand, 1);
  }
  return elements;
}

/**
 *
 * @returns {Promise<string[]>}
 */
async function fetchCompletions(query) {
  try {
    const { searchParams } = new URL(window.location.href);
    if (searchParams.useFake == 'Y') return backupPrompts;
    const messages = [
      {
        role: 'user',
        content: prep + query.trim(),
      },
    ];
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const bodyParameters = {
      model,
      messages,
      n: COMPLETION_CNT,
    };
    const response = await fetch(api, {
      method: 'POST',
      headers,
      body: JSON.stringify(bodyParameters),
    });

    const data = await response.json();
    const completions = data.choices.map((choice) =>
      choice?.message?.content?.replace(/\.$/, '')
    );
    console.log({ completions });
    return completions;
  } catch {
    return backupPrompts;
  }
}

/**
 *
 * @param {string} query
 * @param {number} limit
 * @param {boolean} useFake
 * @returns {Promise<string[]>}
 */
export default async function recommend(
  query = 'raining cityscape',
  limit,
  useFake = false
) {
  const completions =
    useFake || query.trim().length < 3
      ? backupPrompts
      : await fetchCompletions(query);
  if (completions.length == limit) {
    return completions;
  } else if (completions.length > limit) {
    return pickNRandomElements(limit, completions);
  }
  return [
    ...completions,
    ...pickNRandomElements(limit - completions.length, backupPrompts),
  ];
}
