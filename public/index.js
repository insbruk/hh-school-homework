import * as store from './storage.js'
import * as view from './view.js';

// Объект с вариациями сортировки
const SortingOptions = {
    ASC: 'asc',
    DESC: 'desc'
}

// Site Urls
const BASE_URL = 'http://localhost:5000';
const LOGIN_URL = `${BASE_URL}/login`;
const TASKS_URL = `${BASE_URL}/tasks`;
const ANALYTICS_URL = `${BASE_URL}/analytics`;

const sortBtn = document.getElementById('sortButton');
let currentSortOption = SortingOptions.ASC;

// Обновление текста кнопки
function updateSortButtonText() {
    if (currentSortOption === SortingOptions.ASC) {
        sortBtn.textContent = 'Сортировать по убыванию';
    } else {
        sortBtn.textContent = 'Сортировать по возрастанию';
    }
}

// Смена способа сортировки
function switchSortOption() {
    currentSortOption = currentSortOption === SortingOptions.ASC?
        SortingOptions.DESC : SortingOptions.ASC;
}

// Функция сортировки по названию задачи
/**
 * 
 * @param {Array} tasks - массив задач
 * @param {SortingOptions} [option=SortingOptions.ASC] - метод сортировки
 * @returns {Array} отсортированный массив задач
 */
function sortTasks(tasks, option=SortingOptions.ASC) {
    if(!Array.isArray(tasks)) {
        throw new Error(`Expected array, given ${typeof tasks}`);
    }

    if(!Object.values(SortingOptions).includes(option)) {
        throw new Error(`Unknown sorting option ${option}`);
    }

    if(option === SortingOptions.ASC) {
        return tasks.toSorted((currentTask, nextTask) => 
            currentTask.title.localeCompare(nextTask.title));
    } 
    else {
        return tasks.toSorted((currentTask, nextTask) => 
            nextTask.title.localeCompare(currentTask.title));
    }
}

// Обработчик при нажатии на кнопку сортировки
sortBtn.addEventListener('click', () => {
    const tasksJson = localStorage.getItem('tasks');
    if (!tasksJson) {
        return;
    }
    
    const tasks = JSON.parse(tasksJson);
    const sortedTasks = sortTasks(tasks, currentSortOption);
    localStorage.setItem('tasks', JSON.stringify(sortedTasks));

    view.updateAppContent();
    updateSortButtonText();
    switchSortOption();
});


// Задача #1
async function handleLogin () {
    const username = 'Petr';
    const password = '1234';

    try {
        const response = await fetch(LOGIN_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        if(!response.ok) {
            throw new Error(`Статус ответа: ${response.status}\n${response.statusText}`);
        }

        console.log('login');
        const data = await response.json();
        localStorage.setItem('accessToken', data.accessToken);

    } catch (error) {
        console.error(`Ошибка: ${error}`);
    }
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    localStorage.setItem('searchTitle', value);
    console.log(`searchTitle changed to "${value}"`);
    await handleSearch();
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    localStorage.setItem('filterStatus', value);
    console.log(`filterStatus changed to "${value}"`);
    await handleSearch();
}

// Задача #3 и #4
async function handleSearchTasks() {
    const url = new URL(TASKS_URL);
    const token = localStorage.getItem('accessToken');
    const searchTitle = localStorage.getItem('searchTitle');
    const filterStatus = localStorage.getItem('filterStatus');

    if(searchTitle) {
        url.searchParams.append('title', searchTitle.trim());
    }

    if(filterStatus) {
        url.searchParams.append('status', filterStatus);
    }

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok) {
            throw new Error(`Статус ответа: ${response.status}\n${response.statusText}`);
        }

        console.log('search')
        const data = await response.json();
        localStorage.setItem('tasks', JSON.stringify(data.items));

        // Отправка запроса на сервер без получения данных
        const beaconData = JSON.stringify ({
            action: 'search',
            searchTitle: searchTitle || '',
            filterStatus: filterStatus || ''
        });

        const beaconResponseStatus = navigator.sendBeacon(ANALYTICS_URL, beaconData);
        console.log(beaconResponseStatus);

    } catch (error) {
        console.error(`Ошибка: ${error}`);
    }
}

// Задача #5
async function handleLogout () {
    const token = localStorage.getItem('accessToken');
    try {
        const response = await fetch(`${BASE_URL}/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if(!response.ok) {
            throw new Error(`${response.status}\n${response.statusText}`);
        }
        console.log('logout');
        localStorage.removeItem('accessToken');
    } catch (error) {
        console.error(`Ошибка: ${error}`);
    }
}

// Код ниже редактировать не нужно
async function handleSearch() {
    await handleSearchTasks()
    view.updateAppContent()
}

async function handleAuthorization () {
    try {
        if (store.isAuthorized()) {
            await handleLogout()
            store.reset()
        } else {
            await handleLogin()
            store.setSearchTitle('')
            store.setFilterStatus('')
            view.updateSearchInput('')
            view.updateFilterStatus('')
            await handleSearchTasks()
        }
        view.updateAppContent()
    } catch (e) {
        alert('Не удалось. Попробуйте еще раз!')
    }
}

handleSearchTasks().then(() => {
    view.updateAppContent()
    view.updateSearchInput(localStorage.getItem('searchTitle') || '')
    view.updateFilterStatus(localStorage.getItem('filterStatus') || '')
})

const searchInputElement = document.getElementById('searchInput')
const filterSelectElement = document.getElementById('filterStatus')
const authButtonElement = document.getElementById('authButton')
const searchButtonElement = document.getElementById('searchButton')

searchInputElement.addEventListener('keyup', handleInputChange)
filterSelectElement.addEventListener('change', handleSelectChange)
authButtonElement.addEventListener('click', handleAuthorization)
searchButtonElement.addEventListener('click', handleSearch)
