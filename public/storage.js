const VALID_ACCESS_TOKEN = '1234567890'

export function isAuthorized() {
    const accessToken = localStorage.getItem('accessToken')
    return accessToken === VALID_ACCESS_TOKEN
}

export function setSearchTitle(value) {
    localStorage.setItem('searchTitle', value)
}

export function setFilterStatus(value) {
    localStorage.setItem('filterStatus', value)
}

export function setTasks(value) {
    localStorage.setItem('tasks', value)
}

export function reset() {
    setSearchTitle('')
    setFilterStatus('')
    setTasks(JSON.stringify([]))
}
