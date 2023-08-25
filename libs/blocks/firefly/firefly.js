import { createTag } from '../../utils/utils.js';
import useProgressManager from './progress-manager.js';
import { memoize } from './utils.js';
import recommend, { backupPrompts } from './prompts-recommend.js';
import useInputAutocomplete from './autocomplete.js';

const MONITOR_INTERVAL = 1000;
const AVG_GENERATION_TIME = 2000;
const TIMEOUT = 5000;
const PROGRESS_ANIMATION_DURATION = 1000;
const PROGRESS_BAR_LINGER_DURATION = 500;
const SUGGESTION_CNT = 5;
const DEFAULT_REC_THRESHOLD = 3;

function checkPeriodicallyUntilTimeout(
  timeout,
  interval,
  getJobStatus,
  progressManager
) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const intervalId = setInterval(async () => {
      const currentTime = Date.now();
      let jobStatus = await getJobStatus();

      if (jobStatus.status == 'DONE') {
        clearInterval(intervalId);
        progressManager.update(100);
        // play to 100% and let it linger a bit
        setTimeout(() => {
          resolve(jobStatus.images[0].src_image);
        }, PROGRESS_ANIMATION_DURATION + PROGRESS_BAR_LINGER_DURATION);
      } else if (currentTime - startTime >= timeout) {
        clearInterval(intervalId);
        reject('Timeout reached, condition not met.');
      } else {
        // no progress, fake some
        progressManager.update(0);
      }
    }, interval);
  });
}

async function fetchImg(query, progressManager) {
  try {
    // 15-30% right away
    progressManager.update(Math.floor(Math.random() * 15 + 15));
    const origin = 'https://backdrop-stg.senseiasml.io';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);
    const respJob = await fetch(`${origin}/backdrop/textToArtJob`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: [query],
        algorithm: 'clio',
        seed: [100],
        text_guidance_scale: 5,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    if (!respJob.ok) {
      throw new Error(`HTTP error! status: ${respJob.status}`);
    }
    const job = await respJob.json();
    const imgName = await checkPeriodicallyUntilTimeout(
      TIMEOUT,
      MONITOR_INTERVAL,
      async () => {
        const resp = await fetch(`${origin}/backdrop/status/${job.jobId}`);
        if (resp.ok) return resp.json();
      },
      progressManager
    );
    return `${origin}/backdrop/image/${imgName}}`;
  } catch {
    progressManager.update(100); // fake success
    return 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-980x653.jpg';
  }
}

function replaceMarqueeImg(src, el) {
  const marqueePicture = el.parentElement.querySelector(
    '.marquee .background picture'
  );
  marqueePicture.prepend(createTag('source', { srcset: src }));
  return marqueePicture;
}

async function searchAndReplaceImg({
  el,
  progressManager,
  searchBar,
  progressBarWrapper,
  suggestionsContainer,
  cta,
}) {
  const query = searchBar.value;
  cta.classList.add('disabled');
  searchBar.disabled = true;
  progressManager.reset();
  progressBarWrapper.classList.add('display');
  suggestionsContainer.classList.remove('show');
  const src = await fetchImg(query, progressManager);
  const marqueePicture = replaceMarqueeImg(src, el);
  marqueePicture.classList.add('transitioning');

  const oneSecPromise = new Promise((resolve) => setTimeout(resolve, 800));
  let loadedResolve;
  const loadedPromise = new Promise((resolve) => {
    loadedResolve = resolve;
    setTimeout(resolve, 4000);
  });
  marqueePicture.querySelector('img').onload = (e) => {
    if (e.eventPhase >= Event.AT_TARGET) {
      loadedResolve();
    }
  };
  await Promise.all([oneSecPromise, loadedPromise]);
  progressBarWrapper.classList.remove('display');
  cta.textContent = 'Generate';
  cta.classList.remove('disabled');
  searchBar.disabled = false;
  marqueePicture.classList.remove('transitioning');
}

function suggestionsListUIUpdateCB(suggestions, refs) {
  const { suggestionsList, searchBar, suggestionsTitle } = refs;
  suggestionsTitle.textContent = 'Suggestions';
  suggestionsList.innerHTML = '';
  const searchBarVal = searchBar.value.toLowerCase();
  if (
    suggestions &&
    !(suggestions.length <= 1 && suggestions[0] === searchBarVal)
  ) {
    const keywords = searchBarVal
      .split(' ')
      .filter((word) => word.length > 2)
      .map((word) => [word, word.toLowerCase()]);
    suggestions.forEach((item) => {
      const generatedWords = item
        .replaceAll(',', '')
        .replaceAll('.', '')
        .split(' ')
        .map((word) => word.toLowerCase());
      const commonWords = [];
      for (const word of keywords) {
        if (
          generatedWords.includes(word[1]) &&
          !commonWords.includes(word[0])
        ) {
          commonWords.push(word[0]);
        }
      }
      const li = createTag('li', { tabindex: 0 });
      let buildup = item;
      commonWords.forEach((commonWord) => {
        buildup = buildup.replaceAll(
          new RegExp(commonWord, 'ig'),
          `<b>${commonWord}</b>`
        );
      });
      li.innerHTML = buildup;
      li.addEventListener('click', () => {
        searchBar.value = item;
        searchAndReplaceImg(refs);
      });

      li.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          searchBar.value = item;
          searchAndReplaceImg(refs);
        }
      });

      suggestionsList.append(li);
    });
  }
}

function buildProgressBar() {
  const progressBarWrapper = createTag('div', {
    class: 'loader-progress-bar',
    role: 'progressbar',
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': 0,
  });
  const progressBar = createTag('div');
  progressBarWrapper.append(progressBar);
  return { progressBar, progressBarWrapper };
}

function updateProgressBar(percentage, { progressBar, cta }) {
  if (!cta || !progressBar) return;
  cta.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute('aria-valuenow', percentage);
}

function fillInitialRecommendations(refs) {
  const { searchBar, suggestionsList } = refs;
  suggestionsList.innerHTML = '';
  for (let i = 0; i < SUGGESTION_CNT; i++) {
    const item = backupPrompts[i];
    const li = createTag('li', { tabindex: 0 });
    const b = createTag('b');
    b.textContent = item;
    li.append(b);
    li.addEventListener('click', () => {
      searchBar.value = item;
      searchAndReplaceImg(refs);
    });

    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.keyCode === 13) {
        searchBar.value = item;
        searchAndReplaceImg(refs);
      }
    });
    suggestionsList.append(li);
  }
}

function suggestionsListClickHandler(e, { suggestionsContainer, form, cta }) {
  const { target } = e;
  if (target !== cta && (target == form || form.contains(target))) {
    suggestionsContainer.classList.add('show');
  } else if (
    !(target == suggestionsContainer || suggestionsContainer.contains(target))
  ) {
    suggestionsContainer.classList.remove('show');
  }
}

function searchBarEnterHandler(e, { cta }) {
  if (e.key === 'Enter' || e.keyCode === 13) {
    cta.click();
  }
}

function searchBarInputHandler({ searchBar, cta }) {
  if (!!searchBar.value) {
    cta.classList.remove('disabled');
  } else {
    cta.classList.add('disabled');
  }
}

export default function init(el) {
  const placeholderDiv = el.querySelector('div > div');
  placeholderDiv.remove();
  const form = createTag('div', { class: 'firefly-search-form' });
  const searchBar = createTag('input', {
    class: 'search-bar',
    type: 'text',
    placeholder: placeholderDiv.textContent.trim(),
    enterKeyHint: 'Search',
  });

  const suggestionsContainer = createTag('div', {
    class: 'suggestions-container',
  });
  const suggestionsTitle = createTag('p');
  suggestionsTitle.textContent = 'Trending Prompts';
  const suggestionsList = createTag('ul', { class: 'suggestions-list' });

  const cta = createTag(
    'a',
    {
      class: 'con-button blue button-xl button-justified-mobile firefly-submit',
      href: '#',
    },
    'Generate'
  );

  const flexWrapper = createTag('div', { class: 'flex-wrapper' });
  const { progressBar, progressBarWrapper } = buildProgressBar();
  form.append(searchBar);
  form.append(cta);

  suggestionsContainer.append(suggestionsTitle);
  suggestionsContainer.append(suggestionsList);
  flexWrapper.append(suggestionsContainer);
  flexWrapper.append(form);
  flexWrapper.append(progressBarWrapper);
  el.append(flexWrapper);

  cta.addEventListener('click', (e) => {
    e.preventDefault();
    searchAndReplaceImg(refs);
  });
  searchBar.addEventListener('keypress', (e) => searchBarEnterHandler(e, refs));
  searchBar.addEventListener('input', () => searchBarInputHandler(refs));
  document.addEventListener(
    'click',
    (e) => suggestionsListClickHandler(e, refs),
    { passive: true }
  );
  const memoizedFetchAPI = memoize(recommend, {
    ttl: 300 * 1000,
  });
  const progressManager = useProgressManager(
    (percentage) => updateProgressBar(percentage, refs),
    PROGRESS_ANIMATION_DURATION,
    {
      avgCallingTimes: AVG_GENERATION_TIME / MONITOR_INTERVAL,
      sample: 2,
    }
  );
  const refs = {
    searchBar,
    progressManager,
    progressBar,
    progressBarWrapper,
    suggestionsTitle,
    el,
    form,
    suggestionsContainer,
    suggestionsList,
    cta,
  };
  fillInitialRecommendations(refs);
  const { inputHandler } = useInputAutocomplete(
    memoizedFetchAPI,
    (suggestions) => suggestionsListUIUpdateCB(suggestions, refs),
    {
      throttleDelay: -1,
      debounceDelay: 1000,
      limit: SUGGESTION_CNT,
      useFake: false,
      throttleThreshold: DEFAULT_REC_THRESHOLD,
    }
  );
  searchBar.addEventListener('input', (e) => {
    inputHandler(e);
  });
  searchBar.addEventListener('input', () => {
    if (searchBar.value.length < DEFAULT_REC_THRESHOLD) {
      fillInitialRecommendations(refs);
      suggestionsTitle.textContent = 'Trending Prompts';
    }
  });
}
