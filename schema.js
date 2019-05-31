const assert = require('assert')
global.fetch = require('node-fetch')

const rest = require('./rest')

const typeDefs = `
type Query{
    authorize(user: String!, password: String!): Authorization
    boards(auth: AuthorizationInput): [Board]
    board(_id: ID, title: String, auth: AuthorizationInput): Board
}

type Mutation{
    newCards(
        boardTitle:String!, 
        listTitle: String!, 
        swimlaneTitle: String, 
        titles: [String]!, 
        parentId: ID, 
        auth: AuthorizationInput
    ): [ID]
    setParentId(
        boardTitle:String!,
        listTitle: String!,
        titles: [String]!,
        parentId: ID,
        auth: AuthorizationInput
    ): [ID]
    newTree(
        auth: AuthorizationInput, 
        input: TreeInput
    ): Boolean
    setCheckListItem(
        boardId:ID!,
        cardId:ID!,
        checkListTitle: String!,
        itemTitle: String!,
        isFinished: Boolean!,
        auth: AuthorizationInput
    ): Boolean
}

input TreeInput {
    boardTitle: String!
    listTitle: String!
    title: String!
    children: [TreeInput]
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
    cards: [Card]
    card(_id: ID, title: String): Card
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

const authorize = host => async (_, {user, password}) => {
    return rest.authorize({host, user, password})
}

const boards = host => async (_, {auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    return rest.boards({host, context})
}

const get_board = host => async (_,{_id, title, auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
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
    const json = await rest.lists({host, context, boardId: board._id})
    return json.map(({_id, title})=>({_id, title, board}))
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
    const json = await rest.swimlanes({host, context, boardId: board._id})
    return json.map(({_id, title})=>({_id, title, board}))
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

const checklists = host => async(card, _, context) => {
    const json = await rest.checklists({host, context, boardId: card.board._id, cardId:card._id})
    const promises = json.map(async ({_id}) => {
        return await rest.checklist({host, context, boardId: card.board._id, cardId:card._id, checkListId: _id})
    })
    return await Promise.all(promises)
}

const cards = host => async (list, _,context) => {
    const json = await rest.cards({host, context, boardId: list.board._id, listId: list._id})
    const promises = json.map(async ({_id}) => {
        return await get_card(host)(list, {_id},context)
    })
    return await Promise.all(promises)
}

const get_card = host => async (list,{_id, title}, context) => {
    if (!_id && title){
        const x = await cards(host)(list, {}, context)
        const found = x.find(x => x.title == title)
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

const cards_swimlane = host => async (swimlane, _,context) => {
    const json = await rest.cards_swimlane({host, context, boardId: swimlane.board._id, swimlaneId: swimlane._id})
    const promises = json.map(async ({_id, listId}) => {
        return await rest.card({host, context, boardId, listId, cardId: _id})
    })
    return await Promise.all(promises)
}

const get_card_swimlane = host => async (swimlane,{_id, title}, context) => {
    const x = await cards_swimlane(host)(swimlane, {}, context)
    if (title){
        return x.find(x => x.title == title)
    }
    return x.find(x => x._id == _id)
}

const newCards = host => async(_, {boardTitle, listTitle, swimlaneTitle, titles, parentId, auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    const myboard = await get_board(host)(_,{title: boardTitle}, context)
    const boardId = myboard._id
    const mylist = await get_list(host)(myboard, {title: listTitle}, context)
    const listId = mylist._id
    if (!swimlaneTitle){
        swimlaneTitle = "Default"
    }
    const myswimlane = await get_swimlane(host)(myboard, {title: swimlaneTitle}, context)
    const swimlaneId = myswimlane._id

    const promises = titles.map(async (title) => {
        return await rest.post_card({host, context, boardId, listId, swimlaneId, parentId})
    })
    const values = await Promise.all(promises)
    await setParentId(host)(_,{boardTitle, listTitle, titles, parentId, auth}, context)
    return values
}

const setParentId = host => async(_, {boardTitle, listTitle, titles, parentId, auth}, context) => {
    if (auth){
        context.userId = auth.userId
        context.token = auth.token
    }
    const myboard = await get_board(host)(_,{title: boardTitle}, context)
    const boardId = myboard._id
    const mylist = await get_list(host)(myboard, {title: listTitle}, context)
    const listId = mylist._id
    promises = titles.map(async (title) => {
        const mycard = await get_card(host)(mylist, {title}, context)
        const cardId = mycard._id
        return await rest.put_card({host, context, boardId, listId, cardId, fields: {parentId}})
    })
    const values = await Promise.all(promises)
    return values
}

const newTree = host => async (parent,{
    auth,
    input:{boardTitle, listTitle, title, children},
    },context) => {

    if (auth){
        context.user = auth.user
        context.token = auth.token
    }
    const myboard = await get_board(host)(null,{title: boardTitle}, context)
    const mylist = await get_list(host)(myboard, {title: listTitle}, context)
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

const setCheckListItem = host => async(_, {auth, boardId, cardId, checkListTitle, itemTitle, isFinished}, context) => {
    if (auth){
        context.user = auth.user
        context.token = auth.token
    }
    const cls = await rest.checklists({host, context, boardId, cardId})
    let found = cls.find(x => x.title == checkListTitle)
    if (!found) {
        found = await rest.post_checklist({host, context, boardId, cardId, checkListTitle, items:[]})
        found = {...found, title:checkListTitle}
    }
    const cl = await rest.checklist({host, context, boardId, cardId, checkListId: found._id})
    let item = cl.items.find(x => x.title == itemTitle)
    if (!item) {
        const cls2 = await rest.post_checklist({host, context, boardId, cardId, checkListTitle, items: [...cl.items, {title: itemTitle}]})
        const cl2 = await rest.checklist({host, context, boardId, cardId, checkListId: cls2._id})
        await rest.delete_checklist({host, context, boardId, cardId, checkListId: cl._id})
        cl.items.forEach(async (i) => {
            return await setCheckListItem(host)(_,{boardId, cardId, checkListTitle, itemTitle: i.title, isFinished: i.isFinished}, context)
        })
        found = cl2
        item = cl2.items.find(x => x.title == itemTitle)
    }
    await rest.put_checklist_item({host, context, boardId, cardId, checkListId: found._id, itemId: item._id, fields: {isFinished}})
    return true
}

const get_resolvers = host => ({
    Mutation:{
        newCards: newCards(host),
        setParentId: setParentId(host),
        newTree: newTree(host),
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
    Swimlane: {
        cards: cards_swimlane(host),
        card: get_card_swimlane(host),
    },
    Card: {
        checklists: checklists(host)
    }
})

module.exports = {
    typeDefs,
    get_resolvers,
}