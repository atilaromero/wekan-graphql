
const assert = require('assert')
const euc = encodeURIComponent

const authorize = async ({host, user, password}) => {
    const response = await fetch(`${host}/users/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `username=${euc(user)}&password=${euc(password)}`,
    })
    const {id, token} = await response.json()
    return {userId: id, token}
}

const boards = async ({host, context:{userId, token}}) => {
    const url = `${host}/api/users/${euc(userId)}/boards`
    const json = await fetchWithToken({url, token})
    return json
}

const lists = async ({host, context:{token}, boardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists`
    const json = await fetchWithToken({url, token})
    return json
}

const swimlanes = async ({host, context:{token}, boardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/swimlanes`
    const json = await fetchWithToken({url, token})
    return json
}

const checklists = async ({host, context:{token}, boardId, cardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists`
    const json = await fetchWithToken({url, token})
    return json
}

const checklist = async ({host, context:{token}, boardId, cardId, checkListId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists/${euc(checkListId)}`
    const json = await fetchWithToken({url, token})
    return json
}

const cards = async ({host, context:{token}, boardId, listId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists/${euc(listId)}/cards`
    const json = await fetchWithToken({url, token})
    return json
}

const cards_swimlane = async ({host, context:{token}, boardId, swimlaneId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/swimlane/${euc(swimlaneId)}/cards`
    const json = await fetchWithToken({url, token})
    return json.map(({_id, title, description,listId})=>{_id, title, description,listId})
}

const card = async ({host, context:{token}, boardId, listId, cardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists/${euc(listId)}/cards/${euc(cardId)}`
    const json = await fetchWithToken({url, token})
    return json
}

const post_card = async ({host, context:{userId, token}, boardId, listId, swimlaneId, parentId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists/${euc(listId)}/cards`
    const headers = {'Content-Type': 'application/json'}
    const options = {
        method: 'post',
        body: JSON.stringify({
            title,
            authorId: userId,
            swimlaneId,
            parentId,
        }),
    }
    const json = await fetchWithToken({url, token, headers, options})
    return json._id
}


const put_card = async ({host, context:{userId, token}, boardId, listId, cardId, fields}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists/${euc(listId)}/cards/${euc(cardId)}`
    const headers = {'Content-Type': 'application/json'}
    const options = {
        method: 'put',
        body: JSON.stringify(fields),
    }
    const json = await fetchWithToken({url, token, headers, options})
    return json._id
}

const post_checklist = async ({host, context:{token}, boardId, cardId, checkListTitle, items}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists`
    const headers = {'Content-Type': 'application/json'}
    const options = {
        method: 'post',
        body: JSON.stringify({
            title: checkListTitle,
            items,
        }),
    }
    const json = await fetchWithToken({url, token, headers, options})
    return json
}

const delete_checklist = async ({host, context:{token}, boardId, cardId, checkListId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists/${euc(checkListId)}`
    const headers = {'Content-Type': 'application/json'}
    const options = {
        method: 'delete',
    }
    const json = await fetchWithToken({url, token, headers, options})
    return json
}

const put_checklist_item = async ({host, context:{token}, boardId, cardId, checkListId, itemId, title, isFinished}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists/${euc(checkListId)}/items/${itemId}`
    const headers = {'Content-Type': 'application/json'}
    const options = {
        method: 'put',
        body: JSON.stringify({title, isFinished}),
    }
    const json = await fetchWithToken({url, token, headers, options})
    return json._id
}

const fetchWithToken = async ({url, token, headers, options}) => {
    let text = ""
    try {
        const response = await fetch(url, {
            headers: {
                Authorization: 'Bearer ' + euc(token),
                ...headers
            },
            ...options
        })
        text = await response.text()
        const json = JSON.parse(text)
        if (json.error || ! response.ok){
            console.log(json.error)
            throw new Error(json.message)
        }
        return json
    } catch (err) {
        console.log({err, url, token, headers, options, text})
        throw err
    }
}

module.exports = {
    authorize,
    boards,
    lists,
    swimlanes,
    cards,
    cards_swimlane,
    card,
    post_card,
    put_card,
    checklists,
    checklist,
    put_checklist_item,
    post_checklist,
    delete_checklist,
}