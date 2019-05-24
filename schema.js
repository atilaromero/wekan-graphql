global.fetch = require('node-fetch')

const typeDefs = `
type Query{
    authorize(user: String!, password: String!): Authorization
    boards(user: String token: String): [Board]
    board(_id: ID, title: String, user: String token: String): Board
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
}

type List {
    _id: ID!
    title: String!
    board: Board!
    cards: [Card]
    card(_id: ID, title: String): Card
}

type Card {
    _id: ID!
    title: String!
    board: Board!
    list: List!
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

const board = host => async (_,{_id, title, user, token}, context) => {
    if (user && token){
        context.user = user
        context.token = token
    }
    const x = await boards(host)(_, {}, context)
    if (title){
        return x.find(x => x.title == title)
    }
    return x.find(x => x._id == _id)
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

const list = host => async (board,{_id, title}, context) => {
    const x = await lists(host)(board, {}, context)
    if (title){
        return x.find(x => x.title == title)
    }
    return x.find(x => x._id == _id)
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
    return json.map(({_id, title})=>({_id, title, board: list.board, list: list._id}))
}

const card = host => async (list,{_id, title}, context) => {
    const x = await cards(host)(list, {}, context)
    if (title){
        return x.find(x => x.title == title)
    }
    return x.find(x => x._id == _id)
}


const get_resolvers = host => ({
    Query: {
        authorize: authorize(host),
        boards: boards(host),
        board: board(host),
    },
    Board: {
        lists: lists(host),
        list: list(host),
    },
    List: {
        cards: cards(host),
        card: card(host),
    }
})

module.exports = {
    typeDefs,
    get_resolvers,
}