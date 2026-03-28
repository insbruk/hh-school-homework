import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin() {
    const response = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: 'ivan',
            password: '123'
        })
    });
    
    const data = await response.json();
    if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
    }
}
}

// Задача #2
async function handleInputChange({ target: { value } }) {
    localStorage.setItem('searchTitle', value);
    console.log(`searchTitle changed to ${value}`);
}

// Задача #2
async function handleSelectChange({ target: { value } }) {
    localStorage.setItem('filterStatus', value);
    console.log(`filterStatus changed to ${value}`);
}
}

// Задача #3 и #4
async function handleSearchTasks() {
    const analyticsData = {
        action: 'search',
        searchTitle: localStorage.getItem('searchTitle') || '',
        filterStatus: localStorage.getItem('filterStatus') || ''
    };
    navigator.sendBeacon(
        'http://localhost:5000/analytics',
        JSON.stringify(analyticsData)
    );
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.log('Нет токена, нужно войти');
        return;
    }
    const searchTitle = localStorage.getItem('searchTitle') || '';
    const filterStatus = localStorage.getItem('filterStatus') || '';

    let url = 'http://localhost:5000/tasks?';
    const params = [];
    
    if (searchTitle) {
        params.push(`title=${encodeURIComponent(searchTitle)}`);
    }
    
    if (filterStatus) {
        params.push(`status=${filterStatus}`);
    }
    
    url += params.join('&');
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
    
        localStorage.setItem('tasks', JSON.stringify(data.items || []));
        
        console.log('Задачи загружены:', data.items);
        
    } catch (error) {
        console.error('Ошибка загрузки задач:', error);
    }
}

// Задача #5
async function handleLogout() {
    const token = localStorage.getItem('accessToken');
    
    if (!token) {
        return;
    }
    
    try {
        await fetch('http://localhost:5000/logout', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        localStorage.removeItem('accessToken');
        localStorage.removeItem('tasks');
        localStorage.removeItem('searchTitle');
        localStorage.removeItem('filterStatus');
        
        console.log('Выход выполнен');
        
    } catch (error) {
        console.error('Ошибка при выходе:', error);
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
