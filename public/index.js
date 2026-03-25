import * as store from './storage.js'
import * as view from './view.js';


// Задача #1
async function handleLogin() {
    const response = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: '', password: '' }),
    })

    if (response.ok) {
        const data = await response.json()
        if (localStorage){
            localStorage.setItem("accessToken", data.accessToken)
            view.updateAppContent()
        }
        else
            alert('Не удалось войти. Попробуйте еще раз!')
    } else {
        alert('Не удалось войти. Попробуйте еще раз!')
    }

}

// Задача #2
async function handleInputChange({ target: { value }}) {
    store.setSearchTitle(value)
}

// Задача #2
async function handleSelectChange({ target: { value }}) {
    store.setFilterStatus(value)
}

// Задача #3 и #4
async function handleSearchTasks() {
    const image = new Image()
    if (!store.isAuthorized()) {
        return
    }
    var getTasks = new XMLHttpRequest()
    let token;
    let searchTitle;
    let filterStatus;
    if (localStorage) {
        searchTitle = localStorage.getItem("searchTitle")
        filterStatus = localStorage.getItem("filterStatus")
        token = localStorage.getItem("accessToken")
    }
    if (searchTitle || filterStatus) {
        getTasks.open("GET", `/tasks?title=${searchTitle}&status=${filterStatus}`)
    } else {
        getTasks.open("GET", '/tasks')
    }
    image.src = `/analytics?searchTitle=${searchTitle}filterStatus=${filterStatus}`
    getTasks.setRequestHeader("Content-Type", "application/json")
    getTasks.setRequestHeader("Authorization", `BEARER ${token}`)
    getTasks.send()
    getTasks.onload = function() {
        if (getTasks.status === 200) {
            const data = JSON.parse(getTasks.response).items
            store.setTasks(JSON.stringify(data))
            view.updateTaskList()
        } else {
            alert('Ошибка при загрузке задач')
        }
    }

}

// Задача #5
async function handleLogout() {
    const token = localStorage.getItem("accessToken")
    await fetch('/logout', {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `BEARER ${token}`
        },
    }).then(response => {
        if (response.status === 200) {
            localStorage.removeItem("accessToken")
            localStorage.removeItem("filterStatus")
            localStorage.removeItem("searchTitle")
            localStorage.removeItem("tasks")
            alert("Logout successful")
        } else {
            alert('Ошибка при выходе')
        }
    }).catch(error => {
        alert('Ошибка при выходе')
    })
    console.log("logout")
}

// Код ниже редактировать не нужно
async function handleSearch() {
    await handleSearchTasks()
    view.updateAppContent()
}

async function handleAuthorization() {
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
        console.log(e)
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
