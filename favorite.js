const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'
const MOVIES_PER_PAGE = 12
let currentPage = 1

const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('#paginator')
const changeMode = document.querySelector("#change-mode");

function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    const id = item.id
    const favoriteMovies = JSON.parse(localStorage.getItem("favoriteMovies")) || []
    // 抓存在暫存的資料
    // 如果暫存資料有重複和id元素，顯示 btn-remove-favorite
    // 如果沒有，則顯示 btn-add-favorite
    if (favoriteMovies.some(Movie => Movie.id === id)) {
      rawHTML += `<div class="col-sm-3 mb-3">
        <div class="mb-2">
          <div class="card visible">
            <img src="${POSTER_URL + item.image}" data-bs-toggle="modal"
              data-bs-target="#Movie-modal" data-id="${item.id}"
              class="card-img-top btn-show-movie" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">more</button>
              <button type="button" class="btn btn-danger btn-size btn-remove-favorite fa fa-heart" data-id="${item.id}"></button>
            </div>
          </div>
        </div>
      </div>`
    } else {
      rawHTML += `<div class="col-sm-3 mb-3">
        <div class="mb-2">
          <div class="card">
            <img src="${POSTER_URL + item.image}" data-bs-toggle="modal"
              data-bs-target="#Movie-modal" data-id="${item.id}"
              class="card-img-top btn-show-movie" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${item.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">more</button>
              <button type="button" class="btn btn-info btn-size btn-add-favorite" data-id="${item.id}">+</button>
            </div>
          </div>
        </div>
      </div>`
    }

  })
  dataPanel.innerHTML = rawHTML
}

function renderPaginator(amount) {
  const NumberOfPage = Math.ceil(amount / MOVIES_PER_PAGE)
  let rawHTML = ''

  for (let page = 1; page <= NumberOfPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies
  //如果filteredMovies沒有資料，就給全部的電影清單

  const startIndex = (page - 1) * MOVIES_PER_PAGE
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE)
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results
    modalTitle.innerText = data.title
    modalDate.innerText = 'Release date: ' + data.release_date
    modalDescription.innerText = data.description
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image}" alt="movie poster" class="image-fuid">`
  })
}

function removeFromFavorite(id) {
  id = Number(id)
  const movieIndex = movies.findIndex((movie) => movie.id === id)
  movies.splice(movieIndex, 1)
  
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))

  // 新功能：移除該電影後，不會重回第一頁；第一個資料的index為 0 會無法顯示資料，故加一
  const nowOfPage = Math.ceil((movieIndex + 1) / MOVIES_PER_PAGE);
  renderPaginator(movies.length)
  renderMovieList(getMoviesByPage(nowOfPage))
}

// 依 data-mode 切換不同的顯示方式
function changeDisplayMode(displayMode) {
  if (dataPanel.dataset.mode === displayMode) return;
  dataPanel.dataset.mode = displayMode;
}

changeMode.addEventListener("click", function onChangeModeClicked(event) {
  if (event.target.matches(".fa-th")) {
    //點到 卡片 按鈕
    changeDisplayMode("card-mode");
    renderMovieList(getMoviesByPage(currentPage));
  } else if (event.target.matches(".fa-bars")) {
    //點到 清單 按鈕
    changeDisplayMode("list-mode");
    renderMovieList(getMoviesByPage(currentPage));
  }
});

dataPanel.addEventListener('click', function onPanelclicked(event) {
  if (event.target.matches('.btn-show-movie')) {         //點到 more 按鈕
    showMovieModal(event.target.dataset.id)
  } else if (event.target.matches(".btn-remove-favorite")) {
    removeFromFavorite(event.target.dataset.id)
  } renderMovieList(getMoviesByPage(currentPage))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return

  const page = Number(event.target.dataset.page)
  currentPage = page
  renderMovieList(getMoviesByPage(currentPage))
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  let keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效文字！')
  // }

  filteredMovies = movies.filter(movie => movie.title.toLowerCase().includes(keyword))

  if (filteredMovies.length === 0) {
    return alert(`找不到${keyword}的相關內容`)
  }

  renderPaginator(filteredMovies.length)
  renderMovieList(getMoviesByPage(currentPage))
})

// renderMovieList(movies)
renderPaginator(movies.length)
renderMovieList(getMoviesByPage(1))