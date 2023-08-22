import { createTag } from '../../utils/utils.js';

async function fetchImg(query) {
  return "https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-980x653.jpg";
}

function buildSource(src) {
  const source = createTag('source', { srcset: src });
  return source;
}

export default function init(el) {
  const placeholderDiv = el.querySelector('div > div');
  placeholderDiv.remove();
  const form = createTag('form');
  const input = createTag('input', { type: 'text', placeholder: placeholderDiv.textContent });
  const searchHandler = async (e) => {
    e.preventDefault();
    const query = e.target.value;
    const src = await fetchImg(query);
    const section = el.parentElement;
    const marqueePicture = section.querySelector('.marquee .background picture');
    marqueePicture.prepend(buildSource(src));
  }
  const inputHandler = (e) => {}; // we can do autocomplete
  input.addEventListener('input', inputHandler);
  form.appendChild(input);
  const searchButton = createTag('button', { type: 'submit' }, 'Search');
  form.appendChild(searchButton);
  searchButton.addEventListener('click', searchHandler);

  const flexWrapper = createTag('div', { class: 'flex-wrapper' });
  flexWrapper.appendChild(form);
  el.appendChild(flexWrapper);
}
