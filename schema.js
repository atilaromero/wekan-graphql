const assert = require('assert')

const rest = require('./rest')

const typeDefs = `
type Query{
    authorize(user: String!, password: String!): Authorization
    boards(auth: AuthorizationInput): [Board]
    board(_id: ID, title: String, auth: AuthorizationInput): Board
}

type Mutation{
    newCards(
        input: newCardInput!
        auth: AuthorizationInput
    ): ID
    updateCard(
        boardTitle: String!, 
        listTitle: String!, 
        card: CardInput!,
        auth: AuthorizationInput
    ): ID
    setCheckListItem(
        boardId: ID!, 
        cardId:ID!,
        checkListTitle: String!,
        itemTitle: String!,
        isFinished: Boolean!,
        auth: AuthorizationInput
    ): Boolean
}

input newCardInput {
    boardTitle: String!
    listTitle: String!
    swimlaneTitle: String
    title: String!
    parentId: ID
    children: [newCardInput]
}

input AuthorizationInput {
    userId: ID!
    token: String!
}

type Authorization {
    userId: ID!
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
}
input CardInput {
    _id: ID!
    title: String
    description: String
    boardId: ID
    listId: ID
    swimlane: ID
    archived: Boolean
    assignedBy: ID
    coverId: ID
    createdAt: String
    dateLastActivity: String
    isOvertime: Boolean
    labelIds: [ID]
    linkedId: ID
    members: [ID]
    parentId: ID
    requestedBy: ID
    sort: Int
    spentTime: Int
    subtaskSort: Int
    swimlaneId: ID
    type: String
    userId: ID
}

type Card {
    _id: ID!
    title: String!
    description: String
    board: Board!
    list: List!
    checklists: [CheckList]
    swimlane: Swimlane!
    archived: Boolean
    assignedBy: ID
    coverId: ID
    createdAt: String
    customFields: [CustomField]
    dateLastActivity: String
    isOvertime: Boolean
    labelIds: [ID]
    linkedId: ID
    members: [ID]
    parentId: ID
    requestedBy: ID
    sort: Int
    spentTime: Int
    subtaskSort: Int
    swimlaneId: ID
    type: String
    userId: ID
}
type CustomField {
    key: String
    value: String
}
type CheckList {
    _id: ID!
    title: String
    sort: Int
    createdAt: String
    items: [CheckListItems]
}

type CheckListItems {
    _id: ID
    title: String
    isFinished: Boolean
}
`
const authorize = (host) =>
/**
 * @return {Promise<rest.f_authorize>}
 */
async (_, {user, password}) => {
    return await rest.authorize({host, user, password})
}

const boards = (host) =>
/**
 * @return {Promise<rest.f_boards[]>}
 */
async (_, {auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    return await rest.boards({host, context})
}

const get_board = (host) =>
/**
 * @return {Promise<rest.f_boards>}
 */
async (_,{_id, title, auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    const x = await boards(host)(_, {auth:null}, context)
    if (title){
        const result = x.find(x => x.title == title)
        assert(result, `board not found: ${title}`)
        return result
    }
    const result = x.find(x => x._id == _id)
    assert(result, `board not found: ${_id}`)
    return result
}

const lists = (host) =>
/**
 * @param {rest.f_boards} board
 * 
 * @typedef {Object} f_lists
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 *
 * @return  {Promise<f_lists[]>}
 */
async (board,_,context) => {
    const json = await rest.lists({host, context, boardId: board._id})
    return json.map(({_id, title})=>({_id, title, board}))
}

const get_list = (host) =>
/**
 * @return {Promise<rest.f_lists>}
 */
async (board,{_id, title}, context) => {
    const x = await lists(host)(board, {}, context)
    if (title){
        const result = x.find(x => x.title == title)
        assert(result, `list not found: ${title}`)
        return result
    }
    const result = x.find(x => x._id == _id)
    assert(result, `list not found: ${_id}`)
    return result
}

const swimlanes = (host) =>
/**
 * @param {rest.f_boards} board
 * 
 * @typedef {Object} f_lists
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 *
 * @return  {Promise<f_lists[]>}
 */
async (board,_,context) => {
    const json = await rest.swimlanes({host, context, boardId: board._id})
    return json.map(({_id, title})=>({_id, title, board}))
}

const get_swimlane = (host) =>
/**
 * @return {Promise<rest.f_lists>}
 */
async (board,{_id, title}, context) => {
    const x = await swimlanes(host)(board, {}, context)
    if (title){
        const result = x.find(x => x.title == title)
        assert(result, `swimlane not found: ${title}`)
        return result
    }
    const result = x.find(x => x._id == _id)
    assert(result, `swimlane not found: ${_id}`)
    return result
}

const get_card = (host) =>
/**
 * @typedef {Object} f_lists
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 * 
 * @typedef {Object} f_card
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 * @property {f_lists} list
 * @property {String} userId
 * @property {String} swimlaneId
 * @property {String} sort
 * @property {String[]} members
 * @property {String} archived
 * @property {String} parentId
 * @property {String} coverId
 * @property {String} createdAt
 * @property {String} customFields
 * @property {String} dateLastActivity
 * @property {String} description
 * @property {String} requestedBy
 * @property {String} assignedBy
 * @property {String} labelIds
 * @property {String} spentTime
 * @property {String} isOvertime
 * @property {String} subtaskSort
 * @property {String} type
 * @property {String} linkedId
 *
 * @return  {Promise<f_card>}
 */
async (list,{_id, title}, context) => {
    if (!_id && title){
        const x = await cards(host)(list, {}, context)
        const found = x.find(x => x.title == title)
        if (!found){
            return null
        }
        _id = found._id
    }
    const json = await rest.card({host, context, boardId: list.board._id, listId: list._id, cardId: _id})

    return [json].map(({
        _id, 
        title,
        description,
        archived,
        assignedBy,
        coverId,
        createdAt,
        customFields,
        dateLastActivity,
        isOvertime,
        labelIds,
        linkedId,
        members,
        parentId,
        requestedBy,
        sort,
        spentTime,
        subtaskSort,
        swimlaneId,
        type,
        userId,
    
    })=>({
        _id, 
        title, 
        description,
        board: list.board, 
        list: list._id,
        archived,
        assignedBy,
        coverId,
        createdAt,
        customFields,
        dateLastActivity,
        isOvertime,
        labelIds,
        linkedId,
        members,
        parentId,
        requestedBy,
        sort,
        spentTime,
        subtaskSort,
        swimlaneId,
        type,
        userId,
    }))[0]
}

const cards = (host) =>
/**
 * @typedef {Object} f_lists
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 *
 * @param {f_lists} list
 * 
 * @typedef {Object} f_card
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 * @property {f_lists} list
 * @property {String} userId
 * @property {String} swimlaneId
 * @property {String} sort
 * @property {String[]} members
 * @property {String} archived
 * @property {String} parentId
 * @property {String} coverId
 * @property {String} createdAt
 * @property {String} customFields
 * @property {String} dateLastActivity
 * @property {String} description
 * @property {String} requestedBy
 * @property {String} assignedBy
 * @property {String} labelIds
 * @property {String} spentTime
 * @property {String} isOvertime
 * @property {String} subtaskSort
 * @property {String} type
 * @property {String} linkedId
 *
 * @return {Promise<f_card[]>}
 */
async (list, _,context) => {
    const json = await rest.cards({host, context, boardId: list.board._id, listId: list._id})
    const promises = json.map(async ({_id}) => {
        return await get_card(host)(list, {_id, title: undefined},context)
    })
    return await Promise.all(promises)
}

const newCards = (host) =>
/**
 * @return {Promise<String>}
 */
async(_, {
    input: {boardTitle, listTitle, swimlaneTitle, title, parentId, children},
    auth}, context) => {
    try {
        if (auth){
            context.userId = auth.userId
            context.token = auth.token
        }
        const myboard = await get_board(host)(_,{_id:null, title: boardTitle, auth:null}, context)
        const boardId = myboard._id
        const mylist = await get_list(host)(myboard, {title: listTitle, _id:null}, context)
        const listId = mylist._id
        if (!swimlaneTitle){
            swimlaneTitle = "Default"
        }
        const myswimlane = await get_swimlane(host)(myboard, {title: swimlaneTitle, _id:null}, context)
        const swimlaneId = myswimlane._id
        
        let cardId = ''
        if (children && children.length > 0){
            const card = await get_card(host)(mylist, {_id: undefined, title}, context)
            cardId = card._id
        } 
        if (!cardId){
            cardId = await rest.post_card({host, context, boardId, listId, swimlaneId, parentId, title})
            await updateCard(host)(_,{boardTitle, listTitle, card: {_id: cardId, parentId, members:[]}, auth}, context)
        }
        if (children && children.length > 0){
            for (const child of children) {
                const {boardTitle, listTitle, swimlaneTitle, title, children} = child
                await newCards(host)(null, {auth:null, input:{boardTitle, listTitle, swimlaneTitle, title, parentId: cardId, children}}, context)
                await setCheckListItem(host)(null,{boardId:boardId, cardId, checkListTitle: "SubTasks", itemTitle: title, isFinished:false, auth:null}, context)
            }
        }
    
        return cardId
    } catch (error) {
        console.log(error)
        throw error
    }
}

const updateCard = (host) =>
/**
 * @typedef f_updateCard
 * @property {String} boardTitle
 * @property {String} listTitle
 * @property {rest.f_card} card
 * @property {any} auth
 * 
 * @param {any} _
 * @param {f_updateCard} params
 * 
 * @return {Promise<String>}
 */
async(_, {boardTitle, listTitle, card, auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    const myboard = await get_board(host)(_,{title: boardTitle, _id:null, auth:null}, context)
    const boardId = myboard._id
    const mylist = await get_list(host)(myboard, {title: listTitle, _id:null}, context)
    const listId = mylist._id
    return await rest.put_card({host, context, boardId, listId, cardId:card._id, fields: card})
}

const checklists = (host) =>
/**
 * @typedef {Object} f_card
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 * @property {f_lists} list
 * @property {String} userId
 * @property {String} swimlaneId
 * @property {String} sort
 * @property {String[]} members
 * @property {String} archived
 * @property {String} parentId
 * @property {String} coverId
 * @property {String} createdAt
 * @property {String} customFields
 * @property {String} dateLastActivity
 * @property {String} description
 * @property {String} requestedBy
 * @property {String} assignedBy
 * @property {String} labelIds
 * @property {String} spentTime
 * @property {String} isOvertime
 * @property {String} subtaskSort
 * @property {String} type
 * @property {String} linkedId
 *
 * @param {f_card} card
 * 
 * @typedef {Object} f_lists
 * @property {String} _id
 * @property {String} title
 * @property {rest.f_boards} board
 *
 * @return  {Promise<rest.f_checklist[]>}
 */
async(card, _, context) => {
    const json = await rest.checklists({host, context, boardId: card.board._id, cardId:card._id})
    const promises = json.map(async ({_id}) => {
        return await rest.checklist({host, context, boardId: card.board._id, cardId:card._id, checkListId: _id})
    })
    return await Promise.all(promises)
}

const setCheckListItem = (host) =>
/**
 * @return {Promise<Boolean>}
 */
async (_, {auth, boardId, cardId, checkListTitle, itemTitle, isFinished}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    try{
        const allChkLsts = await rest.checklists({host, context, boardId, cardId})
        let oldChkLstStub = allChkLsts.find(x => x.title == checkListTitle)
        if (!oldChkLstStub) {
            await rest.post_checklist({host, context, boardId, cardId, checkListTitle, items:[{title: itemTitle, isFinished}]})
            return true
        }
        const oldChkLst = await rest.checklist({host, context, boardId, cardId, checkListId: oldChkLstStub._id})
        let item = oldChkLst.items.find(x => x.title == itemTitle)
        if (item) {
            await rest.put_checklist_item({host, context, boardId, cardId, checkListId: oldChkLstStub._id, itemId: item._id, title: itemTitle, isFinished})
            return true
        }
        if (!item) {
            await rest.post_checklist({host, context, boardId, cardId, checkListTitle, items: [...oldChkLst.items, {title: itemTitle, isFinished}]})
            await rest.delete_checklist({host, context, boardId, cardId, checkListId: oldChkLst._id})
            for (const {title, isFinished} of oldChkLst.items) {
                await setCheckListItem(host)(_,{boardId, cardId, checkListTitle, itemTitle:title, isFinished, auth:null}, context)
            }
            return true
        }
    } catch (err) {
        console.log(err)
        throw err
    }
}

const get_resolvers = (host) => ({
    Mutation:{
        newCards: newCards(host),
        updateCard: updateCard(host),
        setCheckListItem: setCheckListItem(host),
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
    Card: {
        checklists: checklists(host)
    }
})

module.exports = {
    typeDefs,
    get_resolvers,
}
