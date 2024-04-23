//Получаем ссылки на элементы DOM и инициализируем переменные.
//Cоздаем переменную debounceTimer для задержки запросов поиска.
const searchInput = document.getElementById("searchInput");
const autocompleteResults = document.getElementById("autocompleteResults");
const repositoryList = document.getElementById("repositoryList");

let debounceTimer;

//Добавляем обработчик события ввода в поле поиска
searchInput.addEventListener("input", function () {
    const inputValue = searchInput.value.trim();

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
        searchInput.value = searchInput.value.trim();
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
        const repositoryItem = event.target.closest(".repo-item");
        repositoryItem.remove();
        repositoryItem.removeEventListener("click", removeRepository);
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
  autocompleteResults.innerHTML = "";
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
  autocompleteResults.style.display = "block";
}

//Функция скрытия результатов автозаполнения
function hideAutocomplete() {
    autocompleteResults.innerHTML = "";
    autocompleteResults.style.display = "none";
}

//Функция добавления репозитория в список
function addRepositoryToList(repositoryName, owner, stars) {
  if (owner === undefined || stars === undefined) {
      return; 
  }
  const listItem = document.createElement("li");
  listItem.classList.add("repo-item");
  listItem.innerHTML = `
      <span>Name: ${repositoryName}</span>
      <span>Owner: ${owner}</span>
      <span>Stars: ${stars}</span>
      <button>&times;</button>
  `;
  repositoryList.appendChild(listItem);
  listItem.addEventListener("click", removeRepository);
}
//Функция для удаления слушателя события клика после удаления элемента
function removeRepository(event) {
  const repositoryItem = event.currentTarget;
  repositoryItem.remove();
  repositoryItem.removeEventListener("click", removeRepository);
}