const rest = require('./rest')

const REST_URL = process.env.REST_URL
const USER =process.env.USER
const PASS =process.env.PASS

let auth = {
    userId:'',
    token:'',
}

beforeAll(async() => {
    auth = await rest.authorize({host: REST_URL, user:USER, password:PASS})
})

test('boards', async () => {
    const r = await rest.boards({host: REST_URL, context: auth})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r[0])).toEqual(['_id', 'title'])
})

test('lists', async () => {
    const r = await rest.lists({host: REST_URL, context: auth, boardId:"9GDKfHqdcMni9ybpL"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r[0])).toEqual(['_id', 'title'])
})

test('swimlanes', async () => {
    const r = await rest.swimlanes({host: REST_URL, context: auth, boardId:"9GDKfHqdcMni9ybpL"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r[0])).toEqual(['_id', 'title'])
})

test('cards', async () => {
    const r = await rest.cards({host: REST_URL, context: auth, boardId:"9GDKfHqdcMni9ybpL", listId: "hzDkp5ew7JR27i78E"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r[0])).toEqual(['_id', 'title', 'description'])
})

test('checklists', async () => {
    const r = await rest.checklists({host: REST_URL, context: auth, boardId:"Z5SDG8CTZ7SBsaX4t", cardId: "QQ8an6oqvfrgEuKCE"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r[0])).toEqual(['_id', 'title'])
})

test('checklist', async () => {
    const r = await rest.checklist({host: REST_URL, context: auth, boardId:"Z5SDG8CTZ7SBsaX4t", cardId: "QQ8an6oqvfrgEuKCE", checkListId: "WdFXdfLdfppKohMiJ"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r)).toEqual(['_id', 'title', 'cardId', 'sort', 'createdAt', 'userId', 'items'])
})

test('cards_swimlane', async () => {
    const r = await rest.cards_swimlane({host: REST_URL, context: auth, boardId:"9GDKfHqdcMni9ybpL", swimlaneId: "npnCCz5Xgapckd5kE"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r[0])).toEqual(['_id', 'title', 'description', 'listId'])
})

test('card', async () => {
    const r = await rest.card({host: REST_URL, context: auth, boardId:"9GDKfHqdcMni9ybpL", listId: "LFy4SYhcBNQT5xG27", cardId: "jLZcnT8kcRE3rfjsM"})
    expect(r).toMatchSnapshot()
    expect(Object.keys(r)).toEqual([
        "_id",
        "title",
        "boardId",
        "listId",
        "userId",
        "swimlaneId",
        "sort",
        "members",
        "archived",
        "parentId",
        "coverId",
        "createdAt",
        "customFields",
        "dateLastActivity",
        "description",
        "requestedBy",
        "assignedBy",
        "labelIds",
        "spentTime",
        "isOvertime",
        "subtaskSort",
        "type",
        "linkedId",
    ])
})

// test('post_checklist', async () => {
//     const r = await rest.post_checklist({host: REST_URL, context: auth, boardId:"9GDKfHqdcMni9ybpL", cardId: "jLZcnT8kcRE3rfjsM", checkListTitle: "teste", items:[{title: "1"}, {title:"2"}]})
//     expect(r[0]).toEqual(undefined)
// })
