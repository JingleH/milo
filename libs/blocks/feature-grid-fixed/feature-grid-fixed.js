import { createTag } from '../../utils/utils.js';

export default function decorate($block) {
  const children = $block.querySelectorAll(':scope > div > div');

  const gridItems = Array.from(children).map((child) => {
    const picture = child.querySelector('picture');
    const title = child.querySelector('strong');
    const ctas = children[1].querySelectorAll('a');
    return { picture, title, ctas };
  });
  const $gridContainer = createTag('div', { class: 'grid-container' });
  const $grids = gridItems.map(({ picture, title, ctas }) => {
    const tag = createTag('div', { class: 'grid-item' });
    tag.append(picture);
    return tag;
  });
  $grids.forEach(($grid) => $gridContainer.append($grid));
  $block.innerHTML = '';
  $block.append($gridContainer);
}
