//Получаем ссылки на элементы DOM и инициализируем переменные.
//Cоздаем переменную debounceTimer для задержки запросов поиска.
const searchInput = document.querySelector(".searchInput");
const autocompleteResults = document.querySelector(".autocompleteResults");
const repositoryList = document.querySelector(".repositoryList");

let debounceTimer;

//Добавляем обработчик события ввода в поле поиска
searchInput.addEventListener("input", function (event) {
    const inputValue = event.target.value.trim();

    if (!inputValue) {
        hideAutocomplete();
        return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        fetchRepositories(inputValue);
    }, 400);
});

//Добавляем обработчик нажатия клавиши в поле поиска
searchInput.addEventListener("keydown", function (event) {
    if (event.key === " ") {
        event.preventDefault();
        return;
    }
});

//Добавляем обработчик клика по элементам автозаполнения
autocompleteResults.addEventListener("click", function (event) {
    if (event.target.tagName === "LI") {
        const repositoryName = event.target.textContent;
        addRepositoryToList(repositoryName);
        searchInput.value = "";
        hideAutocomplete();
    }
});

//Добавляем обработчик удаления репозитория из списка
repositoryList.addEventListener("click", function (event) {
    if (event.target.tagName === "BUTTON") {
        const repositoryItem = event.target.parentElement;
        repositoryItem.remove();
    }
});

//Функция загрузки репозиториев
async function fetchRepositories(query) {
  try {
      const response = await fetch(`https://api.github.com/search/repositories?q=${query}&per_page=5`);
      if (!response.ok) {
          throw new Error(`Failed to fetch data. Status: ${response.status}`);
      }
      const data = await response.json();
      showAutocomplete(data.items);
  } catch (error) {
      console.error("Error fetching data:", error.message);
  }
}
// Функция отображения результатов автозаполнения
function showAutocomplete(repositories) {
    while (autocompleteResults.firstChild) {
        autocompleteResults.removeChild(autocompleteResults.firstChild);
      }
    
      repositories.forEach((repository) => {
        const listItem = document.createElement("li");
        listItem.textContent = repository.name;
        listItem.addEventListener("click", () => {
          addRepositoryToList(repository.name, repository.owner.login, repository.stargazers_count);
          hideAutocomplete();
          searchInput.value = "";
        });
        autocompleteResults.appendChild(listItem);
      });
      autocompleteResults.classList.add("visible");
    }

//Функция скрытия результатов автозаполнения
function hideAutocomplete() {
    while (autocompleteResults.firstChild) {
        autocompleteResults.removeChild(autocompleteResults.firstChild);
      }
      autocompleteResults.classList.remove("visible");
    }

//Функция добавления репозитория в список
function addRepositoryToList(repositoryName, owner, stars) {
  if (owner === undefined || stars === undefined) {
    return; 
  }
  const listItem = document.createElement("li");
  listItem.classList.add("repo-item");

  const nameSpan = document.createElement("span");
  nameSpan.textContent = `Name: ${repositoryName}`;
  listItem.appendChild(nameSpan);

  const ownerSpan = document.createElement("span");
  ownerSpan.textContent = `Owner: ${owner}`;
  listItem.appendChild(ownerSpan);

  const starsSpan = document.createElement("span");
  starsSpan.textContent = `Stars: ${stars}`;
  listItem.appendChild(starsSpan);

  const closeButton = document.createElement("button");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", removeRepository);
  listItem.appendChild(closeButton);

  repositoryList.appendChild(listItem);
}

//Функция для удаления слушателя события клика после удаления элемента
function removeRepository(event) {
    const repositoryItem = event.currentTarget.parentElement; 
    repositoryItem.remove();
    repositoryItem.removeEventListener("click", removeRepository);
  }