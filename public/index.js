import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin () {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({username:'albert', password:'A.nosach'})
    })

    if (!response.ok) throw new Error('Login failed.');

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);

    console.log('login')
}

// Задача #2
async function handleInputChange({ target: { value }}) {
    store.setSearchTitle(value);
    console.log(`searchTitle changed to "${value}"`);
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    store.setFilterStatus(value);
    console.log(`filterStatus changed to "${value}"`);
}

// Задача #3 и #4
async function handleSearchTasks() {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const searchTitle = localStorage.getItem('searchTitle') || '';
    const filterStatus = localStorage.getItem('filterStatus') || '';

    const params = new URLSearchParams();
    if (searchTitle) params.set('title', searchTitle);
    if (filterStatus) params.set('status', filterStatus);

    const url = `/tasks${params.toString() ? '?' + params.toString() : ''}`;

    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })

    if (response.status === 401) {
        localStorage.removeItem('accessToken');
        return;
    }

    if (!response.ok) throw new Error('Problem fetching tasks');

    const data = await response.json();

    store.setTasks(JSON.stringify(data.items));

    navigator.sendBeacon(
      '/analytics',
      new Blob(
        [JSON.stringify({ action: 'search', searchTitle, filterStatus }),],
        { type: 'application/json' }
      )
    )

    console.log('search')
}

// Задача #5
async function handleLogout () {
    const token = localStorage.getItem('accessToken');

    const response = await fetch('/logout', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) throw new Error('Logout failed');

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
