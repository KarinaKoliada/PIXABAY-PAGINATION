import { fetchImg } from './fetch.js';
import Notiflix from 'notiflix';
import debounce from 'lodash.debounce';

const searchBox = document.querySelector('.search-box');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');

let page = 1;
let query = ''; 

const PER_PAGE = 40;



const renderImg = (images) => {
  const galleryMarkup = images
    .map(({ webformatURL, largeImageURL, tags, likes, views, comments, downloads }) => {
          return `
        <li class="photo-card">
          <a href="${largeImageURL}">
            <img src="${webformatURL}" alt="${tags}" loading="lazy" />
          </a>
          <div class="info">
            <p class="info-item"><b>Likes:</b> ${likes}</p>
            <p class="info-item"><b>Views:</b> ${views}</p>
            <p class="info-item"><b>Comments:</b> ${comments}</p>
            <p class="info-item"><b>Downloads:</b> ${downloads}</p>
          </div>
        </li>
      `;
    })
    .join('');

  gallery.insertAdjacentHTML('beforeend', galleryMarkup);

  const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});
};

const searchImages = async (e) => {
  e.preventDefault();

  query = searchBox.value.trim();
  
    if (!query) {
      gallery.innerHTML = '';
      Notiflix.Notify.info('Please enter a search query.');
      loadMoreBtn.style.display = 'none';
      return;
  }

  page = 1;
  gallery.innerHTML = '';
  loadMoreBtn.style.display = 'none';

  try {
    const data = await fetchImg(query, page)
    
    if (!data.hits.length) {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    renderImg(data.hits);
    Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

    if (data.totalHits > PER_PAGE) {
      loadMoreBtn.style.display = 'block';
    }
  } catch (error) {
    console.log(error);
    
    Notiflix.Notify.failure('Something went wrong. Please try again later.');
  }
};

const loadMoreImages = async () => {
  page += 1;

  try {
    const data = await fetchImg(query, page);

    renderImg(data.hits);

    if (data.totalHits <= page * PER_PAGE) {
      loadMoreBtn.style.display = 'none';
      Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    }

   scrollDown()
  } catch (error) {
    Notiflix.Notify.failure('Failed to load more images. Please try again.');
  }
};

const debouncedSearchImages = debounce(searchImages, 800);

searchBox.addEventListener('input', debouncedSearchImages);
loadMoreBtn.addEventListener('click', loadMoreImages);

function scrollDown() {
   const { height: cardHeight } = document
      .querySelector('.gallery')
        .firstElementChild.getBoundingClientRect();
      
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
}


