import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
var _ = require('lodash');
import Notiflix from 'notiflix';
const axios = require('axios/dist/browser/axios.cjs');
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
const searchWord = document.querySelector('input[type="text"]');
const subButton = document.querySelector("#search-form");
const showGallery = document.querySelector(".gallery");
const moreImages = document.querySelector(".load-more");
const getImageCnt = document.querySelector("#number_display");
const ShowCntText = document.querySelector(".counterText");
const countertxt = document.querySelector(".displaycounter");
const radioButton1 = document.querySelector("#radio1");
const radioButton2 = document.querySelector("#radio2");
const pageDiv = document.querySelector("#pageStats");
const pageWords = document.querySelector("#pageStatsWords");
subButton.addEventListener("submit", getimages);
moreImages.addEventListener("click", showMoreImages);
getImageCnt.addEventListener("change", function() {
    chaneImagecnt();
});
const modeBtn = document.getElementById("mode");
modeBtn.addEventListener("change", chaneMode);
const modeLable = document.getElementById("mode-lable");
let savemode = window.localStorage.getItem("mode");
if (savemode === "dark") modeBtn.checked = false;
else modeBtn.checked = true;
chaneMode();
function chaneMode() {
    if (modeBtn.checked === true) {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("light");
        window.localStorage.setItem("mode", "light");
    } else {
        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        window.localStorage.setItem("mode", "dark");
    }
    savemode = window.localStorage.getItem("mode");
}
let page;
let perPage = 40;
let pictureGallary;
let totalPages;
let imagesReceived;
let imageDispalyed;
resetvarabiles();
window.addEventListener("scroll", _.debounce(InfiniteScroll, 1000));
function InfiniteScroll() {
    if (radioButton1.checked === true) {
        if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight && imageDispalyed < imagesReceived && radioButton1.checked === true) {
            page++;
            pageDiv.style.display = "none";
            fetchImages();
        }
        } else {
            pageDiv.style.display = "flex";
            pageWords.innerHTML = `Current page # ${page} of ${totalPages} `;
        }
    }

function chaneImagecnt() {
    if (searchWord.value !== "") {
        resetvarabiles();
        fetchImages();
    }
}
function resetvarabiles() {
    page = 1;
    pictureGallary = "";
    pageDiv.style.display = "none";
    perPage = +getImageCnt.value;
    totalPages = 0;
    imagesReceived = 0;
    imageDispalyed = 0;
    showGallery.innerHTML = "";
    countertxt.style.display = "none";
}
function getimages(event) {
    event.preventDefault();
    resetvarabiles();
    fetchImages();
}
async function fetchImages() {
    const key = "34087361-125ddcede951dbce2abf9ae11";
    const parameters = `&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${perPage}`;
    const findImage = searchWord.value;
    await axios.get(`https://pixabay.com/api/?key=${key}&q=${findImage}${parameters}`).then(function(response) {
        if (response.data.hits.length === 0) {
            Notiflix.Notify.info("Sorry, there are no images matching your search query. Please try again.");
            return;
        }
        if (page === 1) {
            imagesReceived = response.data.totalHits;
            Notiflix.Notify.info(`Hooray! We found ${imagesReceived} images.`);
            totalPages = Math.ceil(imagesReceived / perPage);
        }
        imageDispalyed += response.data.hits.length;
        countertxt.style.display = "flex";
        ShowCntText.innerHTML = `Displaying Images 1 - ${imageDispalyed}`;
        createGallery(response.data.hits);
        const lightbox = new SimpleLightbox(".gallery a", {}).refresh();
        if (page < totalPages) {
            if (radioButton1.checked === false) {
                pageDiv.style.display = "flex";
                pageWords.innerHTML = `Current page # ${page} of ${totalPages} `;
            }
        } else { 
            if (page > 1){
            Notiflix.Notify.info(`We're sorry, but you've reached the end of search results.`);
            }
        pageDiv.style.display = "none";
    }
    const { height: cardHeight } = document
  .querySelector(".gallery")
  .firstElementChild.getBoundingClientRect();

window.scrollBy({
  top: cardHeight * 2,
  behavior: "smooth",
});
    }).catch(function(error) {
        // handle error
        console.log(error);
    }).finally(function() {
    // always executed
    });
}
function showMoreImages() {
    page++;
    pageDiv.style.display = "none";
    fetchImages();
}
function createGallery(showImage) {
    const markup = showImage.map((hit)=>{
        return `<div class="photo-card">
      <a class="gallery__item" href="${hit.largeImageURL}"> <img class="gallery__image" src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy" /></a>
      <div class="info">
        <p class="info-item">
          <b>Likes</b> <br>${hit.likes}</br>
        </p>
        <p class="info-item">
          <b>Views</b> <br>${hit.views}</br>
        </p>
        <p class="info-item">
          <b>Comments</b> <br>${hit.comments}</br>
        </p>
        <p class="info-item">
          <b>Downloads</b> <br>${hit.downloads}</br>
        </p>
      </div>
    </div>`;
    }).join("");
    showGallery.innerHTML += markup;
}