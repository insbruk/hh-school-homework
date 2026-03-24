import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin(username='vanya', password='123') {
    if (!username || !password)
        throw new Error("Отсутствуют данные")

    const response = await fetch('login', {
        method: 'post',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({username: username, password: password}),
    });
    if (!response.ok) {
        throw new Error(`Ошибка авторизации: ${response.status}`);
    }

    const body = await response.json();
    localStorage.setItem('accessToken', body.accessToken);
    console.log('login success');
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    store.setSearchTitle(value);
    console.log(`searchTitle changed to "${value}"`)
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    store.setFilterStatus(value);
    console.log(`filterStatus changed to "${value}"`)
}

// Задача #3 и #4
async function handleSearchTasks() {
    const accessToken = localStorage.getItem('accessToken') || '';
    const filterStatus = localStorage.getItem('filterStatus') || '';
    const searchTitle = localStorage.getItem('searchTitle') || '';

    if (!accessToken) {
        store.setTasks(JSON.stringify([]));
        return;
    }
    const params = new URLSearchParams();
    if (searchTitle) {
        params.append('title', searchTitle)
    }

    if (filterStatus) {
        params.append('status', filterStatus)
    }

    const query = params.toString()
    const queryString = query ? `?${query}` : ''

    const response = await fetch(`/tasks${queryString}`, {
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        throw new Error(`Ошибка получения данных из json: ${response.status}`);
    }

    const body = await response.json();
    store.setTasks(JSON.stringify(body.items));

    const analyticsBody = {
        action: 'search',
        searchTitle: searchTitle,
        filterStatus: filterStatus
    }
    const analytics = navigator.sendBeacon('/analytics', JSON.stringify(analyticsBody));
    if (!analytics) {
        throw new Error("Не удалось отправить аналитику")
    }
    console.log('search')
}

// Задача #5
async function handleLogout () {
    const accessToken = localStorage.getItem('accessToken') || '';
    if (!accessToken) {
        throw new Error("Пользователь не авторизован")
    }
    const response = await fetch('/logout', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
        }
    });
    if (!response.ok) {
        throw new Error(`Ошибка выхода из профиля: ${response.status}`);
    }
    localStorage.removeItem('accessToken');
    console.log('logout')
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
