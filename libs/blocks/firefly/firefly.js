import { createTag } from '../../utils/utils.js';

async function fetchImg(query) {
  return "https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-980x653.jpg";
}

function replaceMarqueeImg(src, el) {
  const section = el.parentElement;
  const marqueePicture = section.querySelector('.marquee .background picture');
  marqueePicture.prepend(buildSource(src));
}

function buildSource(src) {
  const source = createTag('source', { srcset: src });
  return source;
}

async function searchAndReplaceImg(query, el) {
  const src = await fetchImg(query);
  replaceMarqueeImg(src, el);
}

export default function init(el) {
  const placeholderDiv = el.querySelector('div > div');
  placeholderDiv.remove();
  const form = createTag('form');
  const searchBar = createTag('input', { type: 'text', placeholder: placeholderDiv.textContent });
  const searchHandler = async (e) => {
    e.preventDefault();
    searchAndReplaceImg(searchBar.value, el);
  }
  import('./autocomplete.js').then(({ default: useInputAutocomplete }) => {
    console.log("loaded!");
    const { inputHandler } = useInputAutocomplete(
      suggestionsListUIUpdateCB, { throttleDelay: 300, debounceDelay: 500, limit: 7 },
    );
    searchBar.addEventListener('input', inputHandler);
  });
  const suggestionsList = createTag('ul', { class: 'suggestions-list' });

  const suggestionsListUIUpdateCB = (suggestions) => {
    suggestionsList.innerHTML = '';
    const searchBarVal = searchBar.value.toLowerCase();
    if (suggestions && !(suggestions.length <= 1 && suggestions[0]?.query === searchBarVal)) {
      suggestions.forEach((item) => {
        const li = createTag('li', { tabindex: 0 });
        const valRegEx = new RegExp(searchBar.value, 'i');
        li.innerHTML = item.query.replace(valRegEx, `<b>${searchBarVal}</b>`);
        li.addEventListener('click', async () => {
          await searchAndReplaceImg(item, el);
        });
  
        li.addEventListener('keydown', async (e) => {
          if (e.key === 'Enter' || e.keyCode === 13) {
            await searchAndReplaceImg(item);
          }
        });
  
        suggestionsList.append(li);
      });
    }
  };

  form.appendChild(searchBar);
  const searchButton = createTag('button', { type: 'submit' }, 'Search');
  form.appendChild(searchButton);
  searchButton.addEventListener('click', searchHandler);
  form.append(suggestionsList);

  const flexWrapper = createTag('div', { class: 'flex-wrapper' });
  flexWrapper.appendChild(form);
  el.appendChild(flexWrapper);
}
