import * as store from './storage.js'
import * as view from './view.js';

const BASE_URL = "http://localhost:5000";

// Задача #1
async function handleLogin() {
    const response = await fetch(`${BASE_URL}/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            username: "vasyanepupkin",
            password: "vasyaisthebest#1",
        }),
    });

    if (!response.ok) {
        throw new Error("Login failed");
    }

    const data = await response.json();

    if (!data.accessToken) {
        throw new Error("Токен не получен");
    }

    localStorage.setItem("accessToken", data.accessToken);
}

// Задача #2
async function handleInputChange({ target: { value } }) {
    store.setSearchTitle(value);
    debouncedSearch();
}

// Задача #2
async function handleSelectChange({ target: { value } }) {
    store.setFilterStatus(value);
    debouncedSearch();
}

// Задача #3 и #4
async function handleSearchTasks() {
    const accessToken = localStorage.getItem("accessToken");
    const searchTitle = localStorage.getItem("searchTitle") || "";
    const filterStatus = localStorage.getItem("filterStatus") || "";

    if (!store.isAuthorized()) {
        store.setTasks(JSON.stringify([]));
        return;
    }

    const params = new URLSearchParams();

    if (searchTitle) {
        params.append("title", searchTitle);
    }

    if (filterStatus) {
        params.append("status", filterStatus);
    }

    const query = params.toString();
    const url = query ? `${BASE_URL}/tasks?${query}` : `${BASE_URL}/tasks`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Не удалось получить список задач");
    }

    const data = await response.json();
    store.setTasks(JSON.stringify(data.items));

    const analyticsBody = new Blob(
        [
            JSON.stringify({
                action: "search",
                searchTitle,
                filterStatus,
            }),
        ],
        { type: "application/json" },
    );

    navigator.sendBeacon(`${BASE_URL}/analytics`, analyticsBody);
}

// Задача #5
async function handleLogout() {
    const accessToken = localStorage.getItem("accessToken");

    if (!store.isAuthorized()) {
        throw new Error("Вы не авторизованы");
    }

    const response = await fetch(`${BASE_URL}/logout`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error("Logout failed");
    }

    localStorage.removeItem("accessToken");
}

const clearButtonElement = document.getElementById('clearButton'); 
clearButtonElement.addEventListener('click', handleClearFilters);

async function handleClearFilters() {
    store.setSearchTitle('');
    store.setFilterStatus('');
    store.setTasks(JSON.stringify([]));

    view.updateSearchInput('');
    view.updateFilterStatus('');

    await handleSearchTasks();
    view.updateAppContent();
    showEmptyState();
}

function debounce(fn, delay = 500) {
    let timeoutId;

    return (...args) => {
        clearTimeout(timeoutId);

        timeoutId = setTimeout(() => {
            fn(...args);
        }, delay);
    };
}

async function refreshSearchView() {
    try {
        await handleSearchTasks();
        view.updateAppContent();
        showEmptyState();
    } catch (e) {
        console.error(e);
        alert("Ошибка поиска");
    }
}

const debouncedSearch = debounce(refreshSearchView, 500);

function showEmptyState() {
    const tasksContainer = document.getElementById('tasks');
    if (!tasksContainer) return;

    const tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
    if (!Array.isArray(tasks)) return;

    if (tasks.length === 0 && store.isAuthorized()) {
        tasksContainer.innerHTML = '';

        const message = document.createElement('div');
        message.textContent = 'Ничего не найдено';
        message.style.padding = '16px';
        message.style.textAlign = 'center';
        message.style.color = '#666';

        tasksContainer.appendChild(message);
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
    showEmptyState()
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
