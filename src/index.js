import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";


const refs = {
    form: document.querySelector('.search-form'),
    btnSubmit: document.querySelector(".submit"),
    gallery: document.querySelector('.gallery'),
    btnLoad: document.querySelector('.load-more')
}

console.log(refs.form);
console.log(refs.btnSubmit);

async function makeRequest(pixInform) {
  const API_KEY = "38353563-faefe35241da6d2bdd21486de";
  const BASE_URL = 'https://pixabay.com/api/'; 
  axios.defaults.headers.common["x-api-key"] = API_KEY;
  axios.defaults.baseURL = BASE_URL; 

  // const response = await axios.get('https://pixabay.com/api/?key=38353563-faefe35241da6d2bdd21486de&q=cat&image_type=photo&orientation=horizontal&safesearch=true')
    const response = await axios.get(`?key=${API_KEY}&q=${pixInform}&image_type=photo&orientation=horizontal&safesearch=true`)

    // const response = await fetch(`https://pixabay.com/api/?key=38353563-faefe35241da6d2bdd21486de&q=${pixInform}&image_type=photo&orientation=horizontal&safesearch=true`);
    // return response.json();
    return response.data;

}

refs.form.addEventListener('submit', handlerRequest);

function handlerRequest(e) {
  e.preventDefault();
  const pixInform = e.target.elements.searchQuery.value;
  console.log(pixInform);

  makeRequest(pixInform)
  .then(data => {
      refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
      const largeImg = new SimpleLightbox('.gallery a', {
        captionPosition: 'bottom', captionsData: `alt`, navText: ['←', '→']
      });
      largeImg.refresh();

      if (data.hits.length === 0) {
        Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again');
      }
    }
   ) .catch (err => console.error(err))
    .finally(e.target.reset());
  }

function createMarkup(arr) {
    return arr.map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => `
   <a class="gallery__link" href=${largeImageURL}>
    <div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width="400" height="270"/>
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
</div>`).join('')
}

