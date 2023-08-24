import { createTag } from '../../utils/utils.js';
import useProgressManager from './progress-manager.js';

const MONITOR_INTERVAL = 1000;
const AVG_GENERATION_TIME = 2000;
const TIMEOUT = 5000;
const PROGRESS_ANIMATION_DURATION = 1000;
const PROGRESS_BAR_LINGER_DURATION = 500;

function getSection(el) {
  return el.parentElement;
}
function getCTA(el) {
  return el.querySelector('.firefly-search-form a');
}

function getProgressBarWrapper(el) {
  return el.querySelector('.loader-progress-bar');
}

function getProgressBar(el) {
  return el.querySelector('.loader-progress-bar div');
}

function checkPeriodicallyUntilTimeout(timeout, interval, getJobStatus, progressManager) {
  // 15-30% right away
  progressManager.update(Math.floor(Math.random() * 15 + 15));
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const intervalId = setInterval(async() => {
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
  console.log(query);
  const origin = 'https://backdrop-stg.senseiasml.io';
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
  });
  if (!respJob.ok) {
    throw new Error(`HTTP error! status: ${respJob.status}`);
  }
  const job = await respJob.json();
  
  try {
    const imgName = await checkPeriodicallyUntilTimeout(TIMEOUT, MONITOR_INTERVAL, async() => {
      const resp = await fetch(`${origin}/backdrop/status/${job.jobId}`);
      if (resp.ok) return resp.json();
    }, progressManager);
    return `${origin}/backdrop/image/${imgName}}`;
  } catch {
    return 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-980x653.jpg';
  }
}

function replaceMarqueeImg(src, el) {
  const marqueePicture = getSection(el).querySelector('.marquee .background picture');
  marqueePicture.prepend(buildSource(src));
  return marqueePicture;
}

function buildSource(src) {
  const source = createTag('source', { srcset: src });
  return source;
}

async function searchAndReplaceImg(query, el, progressManager, searchBar) {
  const cta = getCTA(el);
  const progressBarWrapper = getProgressBarWrapper(el);
  cta.classList.add('disabled');
  searchBar.disabled = true;
  progressManager.reset();
  progressBarWrapper.classList.add('display');
  
  const src = await fetchImg(query, progressManager);
  const marqueePicture = replaceMarqueeImg(src, el);
  marqueePicture.classList.add('transitioning');
  progressBarWrapper.classList.remove('display');
  marqueePicture.querySelector('img').onload = (e) => {
    console.log("img loaded!");
    if (e.eventPhase >= Event.AT_TARGET) {
      cta.textContent = 'Generate';
      cta.classList.remove('disabled');
      searchBar.disabled = false;
      marqueePicture.classList.remove('transitioning');
    }
  };
  
}

function suggestionsListUIUpdateCB(suggestionsList, suggestions, searchBar, progressManager) {
  suggestionsList.innerHTML = '';
  const searchBarVal = searchBar.value.toLowerCase();
  if (
    suggestions &&
    !(suggestions.length <= 1 && suggestions[0]?.query === searchBarVal)
  ) {
    suggestions.forEach((item) => {
      const li = createTag('li', { tabindex: 0 });
      const valRegEx = new RegExp(searchBar.value, 'i');
      li.innerHTML = item.query.replace(valRegEx, `<b>${searchBarVal}</b>`);
      li.addEventListener('click', async () => {
        await searchAndReplaceImg(item, el, progressManager, searchBar);
      });

      li.addEventListener('keydown', async (e) => {
        if (e.key === 'Enter' || e.keyCode === 13) {
          await searchAndReplaceImg(item, el, progressManager, searchBar);
        }
      });

      suggestionsList.append(li);
    });
  }
}

function renderProgressBar() {
  const progressBar = createTag('div', {
    class: 'loader-progress-bar',
    role: 'progressbar', 
    'aria-valuemin': 0,
    'aria-valuemax': 100,
    'aria-valuenow': 0,
  });
  progressBar.append(createTag('div'));
  return progressBar;
}

function updateProgressBar(el, percentage) {
  const cta = getCTA(el);
  const progressBar = getProgressBar(el);
  if (!cta || !progressBar) return;
  cta.textContent = `${percentage}%`;
  progressBar.style.width = `${percentage}%`;
  progressBar.setAttribute('aria-valuenow', percentage);
};

export default function init(el) {
  const placeholderDiv = el.querySelector('div > div');
  placeholderDiv.remove();
  const form = createTag('form', { class: 'firefly-search-form' });
  const searchBar = createTag('input', {
    class: 'search-bar',
    type: 'text',
    placeholder: placeholderDiv.textContent,
    enterKeyHint: 'Search',
  });

  const suggestionsList = createTag('ul', { class: 'suggestions-list' });
  const cta = createTag('a', { class: 'con-button blue button-xl button-justified-mobile firefly-submit', href: '#' }, 'Generate');
  
  const flexWrapper = createTag('div', { class: 'flex-wrapper' });
  const progressBar = renderProgressBar();
  form.append(searchBar);
  form.append(cta);
  flexWrapper.append(form);
  flexWrapper.append(progressBar);
  // flexWrapper.append(suggestionsList);
  el.append(flexWrapper);

  const progressManager = useProgressManager(
    (percentage) => updateProgressBar(el, percentage),
    PROGRESS_ANIMATION_DURATION,
    {
      avgCallingTimes: AVG_GENERATION_TIME / MONITOR_INTERVAL,
      sample: 2,
    },
  );

  cta.addEventListener('click', e => {
    e.preventDefault();
    searchAndReplaceImg(searchBar.value, el, progressManager, searchBar);
  });
  searchBar.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      cta.click();
    }
  });
  searchBar.addEventListener('input', () => {
    if (!!searchBar.value) {
      cta.classList.remove('disabled');
    } else {
      cta.classList.add('disabled');
    }
  });

  // import('./autocomplete.js').then((script) => {
  //   const { inputHandler } = script.default(
  //     (suggestions) =>
  //       suggestionsListUIUpdateCB(
  //         suggestionsList,
  //         suggestions,
  //         searchBar,
  //         progressManager
  //       ),
  //     {
  //       throttleDelay: 300,
  //       debounceDelay: 500,
  //       limit: 7,
  //     }
  //   );
  //   searchBar.addEventListener('input', (e) => {
  //     inputHandler(e);
  //   });
  // });
}
