const fetch = require('node-fetch')
const euc = encodeURIComponent

/**
 * @typedef {Object} f_authorize
 * @property {String} userId
 * @property {String} token
 * 
 * @return  {Promise<f_authorize>}
 */
const authorize = async ({host, user, password}) => {
    const response = await fetch(`${host}/users/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `username=${euc(user)}&password=${euc(password)}`,
    })
    const {id, token} = await response.json()
    return {userId: id, token}
}

/**
 * @typedef {Object} f_boards
 * @property {String} _id
 * @property {String} title
 * 
 * @return  {Promise<f_boards[]>}
 */
const boards = async ({host, context:{userId, token}}) => {
    const url = `${host}/api/users/${euc(userId)}/boards`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_lists
 * @property {String} _id
 * @property {String} title
 *
 * @return  {Promise<f_lists[]>}
 */
const lists = async ({host, context:{token}, boardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_swimlanes
 * @property {String} _id
 * @property {String} title
 *
 * @return  {Promise<f_swimlanes[]>}
 */
const swimlanes = async ({host, context:{token}, boardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/swimlanes`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_cards
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 *
 * @return  {Promise<f_cards[]>}
 */
const cards = async ({host, context:{token}, boardId, listId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists/${euc(listId)}/cards`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_checklists
 * @property {String} _id
 * @property {String} title
 *
 * @return  {Promise<f_checklists[]>}
 */
const checklists = async ({host, context:{token}, boardId, cardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_checklist_item
 * @property {String} _id
 * @property {String} title
 * @property {Boolean} isFinished
 * 
 * @typedef {Object} f_checklist
 * @property {String} _id
 * @property {String} title
 * @property {String} cardId
 * @property {String} sort
 * @property {String} createdAt
 * @property {String} userId
 * @property {f_checklist_item[]} items
 *
 * @return  {Promise<f_checklist>}
 */
const checklist = async ({host, context:{token}, boardId, cardId, checkListId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists/${euc(checkListId)}`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_cards_swimlane
 * @property {String} _id
 * @property {String} title
 * @property {String} description
 * @property {String} listId
 */
 /**
 * @return  {Promise<f_cards_swimlane[]>}
 */
const cards_swimlane = async ({host, context:{token}, boardId, swimlaneId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/swimlanes/${euc(swimlaneId)}/cards`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @typedef {Object} f_card
 * @property {String} _id
 * @property {String=} title
 * @property {String=} boardId
 * @property {String=} listId
 * @property {String=} userId
 * @property {String=} swimlaneId
 * @property {String=} sort
 * @property {String[]=} members
 * @property {String=} archived
 * @property {String=} parentId
 * @property {String=} coverId
 * @property {String=} createdAt
 * @property {String=} customFields
 * @property {String=} dateLastActivity
 * @property {String=} description
 * @property {String=} requestedBy
 * @property {String=} assignedBy
 * @property {String=} labelIds
 * @property {String=} spentTime
 * @property {String=} isOvertime
 * @property {String=} subtaskSort
 * @property {String=} type
 * @property {String=} linkedId
 *
 * @return  {Promise<f_card>}
 */
const card = async ({host, context:{token}, boardId, listId, cardId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/lists/${euc(listId)}/cards/${euc(cardId)}`
    const json = await fetchWithToken({url, token, headers: null, options: null})
    return json
}

/**
 * @return  {Promise.<String>}
 */
const post_card = async ({host, context:{userId, token}, boardId, listId, swimlaneId, parentId, title}) => {
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


/**
 * @return  {Promise.<String>}
 */
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

/**
 * @return  {Promise<Null>}
 */
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

/**
 * @return  {Promise<Null>}
 */
const delete_checklist = async ({host, context:{token}, boardId, cardId, checkListId}) => {
    const url = `${host}/api/boards/${euc(boardId)}/cards/${euc(cardId)}/checklists/${euc(checkListId)}`
    const headers = {'Content-Type': 'application/json'}
    const options = {
        method: 'delete',
    }
    const json = await fetchWithToken({url, token, headers, options})
    return json
}

/**
 * @return  {Promise<String>}
 */
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
    let json = {}
    try {
        console.time(url)
        const response = await fetch(url, {
            headers: {
                Authorization: 'Bearer ' + euc(token),
                ...headers
            },
            ...options
        })
        text = await response.text()    
        if (text == "") {
            throw new Error("Empty response")
        }
        try{
            json = JSON.parse(text)
        } catch (err) {
            console.log('error', {url})
            throw new Error(text)
        }
        if (json.error){
            console.log(json.error)
            throw new Error(json.message)
        }
        console.timeEnd(url)
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