import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { makeRequest } from './js/Pixabay_API';
import { refs } from './js/refs';


const largeImg = new SimpleLightbox('.gallery a', {
  captionPosition: 'bottom', captionsData: `alt`, navText: ['←', '→']
});

let page = 1;
let searchQuery = '';

refs.btnLoad.classList.add('is-hidden');

refs.form.addEventListener('submit', handlerRequest);
refs.btnLoad.addEventListener('click', onLoadMore);

async function handlerRequest(e) {
  e.preventDefault();
  observer.unobserve(refs.guard);
  searchQuery = e.currentTarget.elements.searchQuery.value.trim();
  refs.gallery.innerHTML = '';
  if (!searchQuery) {
    return
  }
  resetPage();
  try {
    const data = await makeRequest(searchQuery, page);
    // console.log(data)
    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again');
      refs.btnLoad.classList.add('is-hidden');
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)
      refs.btnLoad.classList.remove('is-hidden');
    }
    createMarkup(data.hits);

    if (page === Math.ceil(data.totalHits / 40)) {
      refs.btnLoad.classList.add('is-hidden');
      Notiflix.Notify.info('We are sorry, but you have reached the end of search results.');
      return
    } 
  observer.observe(refs.guard);
    }
  catch (err) {
    console.error(err);
  }
  finally {
    e.target.reset()
  }
}  

function createMarkup(arr) {
  const markupList = arr.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
    return `<a class="gallery__link" href=${largeImageURL}>
    <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="400" height="200"/>
  <div class="info">
    <p class="info-item">
      <b>Likes ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads ${downloads}</b>
    </p>
  </div>
</div>`}).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markupList);
  largeImg.refresh();
}

function resetPage() {
  page = 1;
}

async function onLoadMore() {
  try {
    page += 1;
    const data = await makeRequest(searchQuery, page);
    createMarkup(data.hits)
    if (page === Math.ceil(data.totalHits / 40))
      {
    refs.btnLoad.classList.add('is-hidden');
    Notiflix.Notify.info('We are sorry, but you have reached the end of search results.');
    }
    scroll();
  }
  catch (err) {
    console.error(err);
    } 
}

function scroll() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}

const options = {
    root: null,
    rootMargin: "500px",
    threshold: 0,
};

const observer = new IntersectionObserver(handelerPagination, options);
async function handelerPagination(entries, observer) {
  entries.forEach(async entry => {
          if (page === 1) {
         observer.preventDefault();
        } else {
          observer.observe(refs.guard);
        }
    try {
      if (entry.isIntersecting) {
          page += 1;
          const data = await makeRequest(searchQuery, page);
        createMarkup(data.hits)
          if (page === Math.ceil(data.totalHits / 40)) {
            observer.unobserve(entry.target);
            Notiflix.Notify.info('We are sorry, but you have reached the end of search results.');
            refs.btnLoad.classList.add('is-hidden');
            return;
          }
        }
    }
      catch (err) {
        console.error(err)
      }
    });
}

