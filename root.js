const {makeExecutableSchema} = require('graphql-tools')
const fs = require('fs')
const path = require('path')
global.fetch = require('node-fetch')

const typeDefs = fs.readFileSync(path.join(__dirname, "schema.graphql"), "utf8");

const authorize = host => async (_, {user, password}) => {
    const _username = encodeURIComponent(user)
    const _password = encodeURIComponent(password)
    const response = await fetch(`${host}/users/login`, {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
        body: `username=${_username}&password=${_password}`,
    })
    const {id, token} = await response.json()
    return {id, token}
}

const boards = host => async (_, {}, context) => {
    const _user = encodeURIComponent(context.id)
    const _token = encodeURIComponent(context.token)
    const url = `${host}/api/users/${_user}/boards`
    const response = await fetch(url, {
        headers: {
            Authorization: 'Bearer ' + _token,
        }
    })
    const json = await response.json()
    return json.map(({_id, title})=>({_id, title}))
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

const resolvers = {
    Query: {
        authorize: authorize('http://wekan.triagem1'),
        boards: boards('http://wekan.triagem1'),
        board: async (_,{_id}, context) => {
            const x = await boards('http://wekan.triagem1')(_, {}, context)
            return x.find(x => x._id == _id)
        },
    },
    Board: {
        lists: lists('http://wekan.triagem1'),
        list: async (board,{_id}, context) => {
            const x = await lists('http://wekan.triagem1')(board, {}, context)
            return x.find(x => x._id == _id)
        },
    },
    List: {
        cards: cards('http://wekan.triagem1'),
    }
}

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
})

module.exports = {
    schema,
}