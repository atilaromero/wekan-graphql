const assert = require('assert')
global.fetch = require('node-fetch')

const typeDefs = `
type Query{
    authorize(user: String!, password: String!): Authorization
    boards(user: String token: String): [Board]
    board(_id: ID, title: String, user: String token: String): Board
}

type Mutation{
    newCards(board:String!, list: String!, swimlane: String, titles: [String]!, parentId: ID, user: String, token: String): [ID]
    setParentId(board:String!, list: String!, titles: [String]!, parentId: ID, user: String, token: String): [ID]
    newTree(auth: AuthorizationInput, input: TreeInput): Boolean
}

input TreeInput {
    board: String!
    list: String!
    title: String!
    children: [TreeInput]
}

input AuthorizationInput {
    user: ID!
    token: String!
}

type Authorization {
    user: ID!
    token: String!
}

type Board {
    _id: ID!
    title: String!
    lists: [List]
    list(_id: ID, title: String): List
    swimlanes: [Swimlane]
    swimlane(_id: ID, title: String): Swimlane
}

type List {
    _id: ID!
    title: String!
    board: Board!
    cards: [Card]
    card(_id: ID, title: String): Card
}

type Swimlane {
    _id: ID!
    title: String!
    board: Board!
    cards: [Card]
    card(_id: ID, title: String): Card
}

type Card {
    _id: ID!
    title: String!
    description: String
    board: Board!
    list: List!
    swimlane: Swimlane!
}
`

const authorize = host => async (_, {user, password}) => {
    const _username = encodeURIComponent(user)
    const _password = encodeURIComponent(password)
    const response = await fetch(`${host}/users/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `username=${_username}&password=${_password}`,
    })
    const {id, token} = await response.json()
    return {user: id, token}
}

const boards = host => async (_, {user, token}, context) => {
    if (user && token){
        context.user = user
        context.token = token
    }
    const _user = encodeURIComponent(context.user)
    const _token = encodeURIComponent(context.token)
    const url = `${host}/api/users/${_user}/boards`
    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + _token,
        }
    })
    const json = await response.json()
    if (json.error){
        throw new Error(json.message)
    }
    return json.map(({_id, title})=>({_id, title}))
}

const get_board = host => async (_,{_id, title, user, token}, context) => {
    if (user && token){
        context.user = user
        context.token = token
    }
    const x = await boards(host)(_, {}, context)
    if (title){
        result = x.find(x => x.title == title)
        assert(result, `board not found: ${title}`)
        return result
    }
    result = x.find(x => x._id == _id)
    assert(result, `board not found: ${_id}`)
    return result
}

const lists = host => async (board,_,context) => {
    const _board = encodeURIComponent(board._id)
    const _token = encodeURIComponent(context.token)
    const url = `${host}/api/boards/${_board}/lists`
    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + _token,
        }
    })
    const json = await response.json()
    return json.map(({_id, title})=>({_id, title, board: board._id}))
}

const get_list = host => async (board,{_id, title}, context) => {
    const x = await lists(host)(board, {}, context)
    if (title){
        result = x.find(x => x.title == title)
        assert(result, `list not found: ${title}`)
        return result
    }
    result = x.find(x => x._id == _id)
    assert(result, `list not found: ${_id}`)
    return result
}

const swimlanes = host => async (board,_,context) => {
    const _board = encodeURIComponent(board._id)
    const _token = encodeURIComponent(context.token)
    const url = `${host}/api/boards/${_board}/swimlanes`
    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + _token,
        }
    })
    const json = await response.json()
    return json.map(({_id, title})=>({_id, title, board: board._id}))
}

const get_swimlane = host => async (board,{_id, title}, context) => {
    const x = await swimlanes(host)(board, {}, context)
    if (title){
        result = x.find(x => x.title == title)
        assert(result, `swimlane not found: ${title}`)
        return result
    }
    result = x.find(x => x._id == _id)
    assert(result, `swimlane not found: ${_id}`)
    return result
}

const cards = host => async (list, _,context) => {
    const _board = encodeURIComponent(list.board)
    const _list = encodeURIComponent(list._id)
    const _token = encodeURIComponent(context.token)
    const url = `${host}/api/boards/${_board}/lists/${_list}/cards`
    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + _token,
        }
    })
    const json = await response.json()
    return json.map(({
        _id, 
        title,
        description,
    })=>({
        _id, 
        title, 
        description,
        board: list.board, 
        list: list._id
    }))
}

const get_card = host => async (list,{_id, title}, context) => {
    const x = await cards(host)(list, {}, context)
    if (title){
        result = x.find(x => x.title == title)
        return result
    }
    result = x.find(x => x._id == _id)
    return result
}

const cards_swimlane = host => async (swimlane, _,context) => {
    const _board = encodeURIComponent(swimlane.board)
    const _swimlane = encodeURIComponent(swimlane._id)
    const _token = encodeURIComponent(context.token)
    const url = `${host}/api/boards/${_board}/swimlane/${_swimlane}/cards`
    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + _token,
        }
    })
    const json = await response.json()
    return json.map(({
        _id, 
        title,
        description,
    })=>({
        _id, 
        title, 
        description,
        board: swimlane.board, 
        swimlane: swimlane._id
    }))
}

const get_card_swimlane = host => async (swimlane,{_id, title}, context) => {
    const x = await cards_swimlane(host)(swimlane, {}, context)
    if (title){
        return x.find(x => x.title == title)
    }
    return x.find(x => x._id == _id)
}

const newCards = host => async(_, {board, list, swimlane, titles, parentId, user, token}, context) => {
    if (user && token){
        context.user = user
        context.token = token
    }
    const _user = encodeURIComponent(context.user)
    const _token = encodeURIComponent(context.token)
    const myboard = await get_board(host)(_,{title: board}, context)
    const boardId = myboard._id
    const mylist = await get_list(host)(myboard, {title: list}, context)
    const listId = mylist._id
    if (!swimlane){
        swimlane = "Default"
    }
    const myswimlane = await get_swimlane(host)(myboard, {title: swimlane}, context)
    const swimlaneId = myswimlane._id
    const url = `${host}/api/boards/${boardId}/lists/${listId}/cards`
    const promises = titles.map(async (title) => {
        const body = JSON.stringify({
            title,
            authorId: _user,
            swimlaneId,
            parentId,
        })
        const response = await fetch(url, {
            headers: {
                Authorization: 'Bearer ' + _token,
                'Content-Type': 'application/json',
            },
            method: 'post',
            body,
        })
        const json = await response.json()
        return json._id
    })
    const values = await Promise.all(promises)
    await setParentId(host)(_,{board, list, titles, parentId, user, token}, context)
    return values
}

const setParentId = host => async(_, {board, list, titles, parentId, user, token}, context) => {
    if (user && token){
        context.user = user
        context.token = token
    }
    const _user = encodeURIComponent(context.user)
    const _token = encodeURIComponent(context.token)
    const myboard = await get_board(host)(_,{title: board}, context)
    const boardId = myboard._id
    const mylist = await get_list(host)(myboard, {title: list}, context)
    const listId = mylist._id
    promises = titles.map(async (title) => {
        const mycard = await get_card(host)(mylist, {title}, context)
        const cardId = mycard._id
        const url = `${host}/api/boards/${boardId}/lists/${listId}/cards/${cardId}`
        const body = JSON.stringify({
            parentId,
        })
        const response = await fetch(url, {
            headers: {
                Authorization: 'Bearer ' + _token,
                'Content-Type': 'application/json',
            },
            method: 'put',
            body,
        })
        const json = await response.json()
        return json._id
    })
    const values = await Promise.all(promises)
    return values
}

const newTree = host => async (parent,{
    auth,
    input:{board, list, title, children},
    },context) => {

    if (auth){
        context.user = auth.user
        context.token = auth.token
    }
    const myboard = await get_board(host)(null,{title: board}, context)
    const mylist = await get_list(host)(myboard, {title: list}, context)
    let mycard = await get_card(host)(mylist, {title}, context)
    const parentId = parent && parent._id || undefined
    if (!mycard){
        const swimlane = "Default"
        const cards = await newCards(host)(null,{board, list, swimlane, titles:[title],parentId},context)
        mycard = await get_card(host)(mylist, {_id: cards[0]}, context)
    }
    if (children && children.length > 0){
        const promises = children.map(async ({board, list, title, children}) => {
            return await newTree(host)(mycard, {input:{board, list, title, children}}, context)
        })
        await Promise.all(promises)
    }
    return true
}

const get_resolvers = host => ({
    Mutation:{
        newCards: newCards(host),
        setParentId: setParentId(host),
        newTree: newTree(host),
    },
    Query: {
        authorize: authorize(host),
        boards: boards(host),
        board: get_board(host),
    },
    Board: {
        lists: lists(host),
        list: get_list(host),
        swimlanes: swimlanes(host),
        swimlane: get_swimlane(host),
    },
    List: {
        cards: cards(host),
        card: get_card(host),
    },
    Swimlane: {
        cards: cards_swimlane(host),
        card: get_card_swimlane(host),
    },
})

module.exports = {
    typeDefs,
    get_resolvers,
}