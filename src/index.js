import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import { makeRequest } from './Pixabay_API';

const refs = {
    form: document.querySelector('.search-form'),
    btnSubmit: document.querySelector(".submit"),
    gallery: document.querySelector('.gallery'),
    btnLoad: document.querySelector('.load-more'),
    guard: document.querySelector('.js-guard')
}

const largeImg = new SimpleLightbox('.gallery a', {
  captionPosition: 'bottom', captionsData: `alt`, navText: ['←', '→']
});

let page = 1;
let isShown = 0;

refs.btnLoad.classList.add('is-hidden');

refs.form.addEventListener('submit', handlerRequest);
refs.btnLoad.addEventListener('click', onLoadMore);

async function handlerRequest(e) {
  e.preventDefault();
  searchQuery = e.target.elements.searchQuery.value.trim();
  refs.btnLoad.classList.add('is-hidden');
  refs.gallery.innerHTML = '';
  resetPage();
  try {
    const data = await makeRequest(searchQuery, page);
    // console.log(data)
    createMarkup(data.hits);
    isShown += data.hits.length;
    if (data.hits.length === 0) {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again');
      refs.btnLoad.classList.add('is-hidden');
    } else {
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`)
    }
    if (isShown <= data.totalHits) {
      refs.btnLoad.classList.remove('is-hidden');
      observer.observe(refs.guard);
    }
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
    isShown += data.hits.length;
    if (isShown >= data.totalHits) {
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
    if (entry.isIntersecting) {
      page += 1;
    }
      try {
        const data = await makeRequest(searchQuery, page);
        createMarkup(data.hits)
        if (data.hits.length >= data.totalHits) {
          observer.unobserve(entry.target);
          Notiflix.Notify.info('We are sorry, but you have reached the end of search results.');
        }
      }
      catch (err) {
        console.log(err)
      }
    });
}

