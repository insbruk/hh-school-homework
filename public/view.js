import {isAuthorized} from "./storage.js";

export function updateAppContent() {
    const appContent = document.getElementById('appContent')
    appContent.style.display = isAuthorized() ? 'block' : 'none'
    updateAuthButton()
    updateTaskList()
}

export function updateSearchInput(value) {
    const searchElement = document.getElementById('searchInput')
    searchElement.value = value
}

export function updateFilterStatus(value) {
    const filterElement = document.getElementById('filterStatus')
    filterElement.value = value
}

export function updateAuthButton () {
    const authButton = document.getElementById('authButton')
    if (isAuthorized()) {
        authButton.innerText = 'Выйти'
    } else {
        authButton.innerText = 'Войти'
    }
}

function clearTaskList() {
    const tasksContainer = document.getElementById('tasks')
    tasksContainer.innerHTML = ''
}

export function updateTaskList() {
    if (isAuthorized()) {
        let tasks = []
        try {
            tasks = JSON.parse(localStorage.getItem('tasks'))
            if (!Array.isArray(tasks)) {
                throw new Error('tasks is not array. resetting to []')
            }
        } catch (e) {
            tasks = []
            localStorage.setItem('tasks', JSON.stringify(tasks))
        }

        clearTaskList()

        const tasksContainer = document.getElementById('tasks')
        tasks.forEach(task => {
            const taskElement = document.createElement('div')
            taskElement.innerText = `#${task.id} ${task.completed ? "completed": "uncompleted"} – ${task.title}`
            tasksContainer.appendChild(taskElement)
        })
    } else {
        clearTaskList()
    }
}
