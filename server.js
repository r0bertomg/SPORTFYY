const path = require('path')
const crypto = require('crypto')
const jsonServer = require('json-server')

const server = jsonServer.create()
const router = jsonServer.router(path.join(__dirname, 'db.json'))
const middlewares = jsonServer.defaults({ static: path.join(__dirname, 'public') })

const porta = process.env.PORT || 3000
const sessoes = new Map()

const pessoas = () => router.db.get('pessoas')

function semSenha(pessoa) {
    const { senha, ...resto } = pessoa
    return resto
}

function exigirAdmin(req, res, next) {
    const token = (req.headers.authorization || '').replace('Bearer ', '')
    const sessao = sessoes.get(token)

    if (!sessao || sessao.role !== 'admin') {
        return res.status(403).json({ erro: 'Acesso restrito ao administrador.' })
    }

    next()
}

if (process.env.ADMIN_SENHA) {
    pessoas().find({ role: 'admin' }).assign({ senha: process.env.ADMIN_SENHA }).write()
}

router.render = (req, res) => {
    const dados = res.locals.data

    if (Array.isArray(dados)) return res.jsonp(dados.map(semSenha))
    if (dados && typeof dados === 'object') return res.jsonp(semSenha(dados))
    res.jsonp(dados)
}

server.use(middlewares)
server.use(jsonServer.bodyParser)

server.post('/login', (req, res) => {
    const { cpf, senha } = req.body
    const pessoa = pessoas().find(p => p.cpf === cpf && p.senha === senha).value()

    if (!pessoa) {
        return res.status(401).json({ erro: 'CPF ou senha incorretos.' })
    }

    const token = crypto.randomBytes(24).toString('hex')
    sessoes.set(token, { id: pessoa.id, role: pessoa.role })
    res.json({ token, usuario: semSenha(pessoa) })
})

server.post('/pessoas', (req, res, next) => {
    const { nome, idade, cpf, senha } = req.body

    if (!nome || !idade || !cpf || !senha) {
        return res.status(400).json({ erro: 'Preencha todos os campos.' })
    }

    if (pessoas().find({ cpf }).value()) {
        return res.status(409).json({ erro: 'CPF já cadastrado.' })
    }

    req.body = { nome, idade, cpf, senha, role: 'comum' }
    next()
})

server.use('/pessoas', (req, res, next) => {
    if (req.method === 'POST') return next()
    exigirAdmin(req, res, next)
})

server.put('/pessoas/:id', (req, res, next) => {
    const atual = pessoas().find({ id: Number(req.params.id) }).value()

    if (!atual) {
        return res.status(404).json({ erro: 'Usuário não encontrado.' })
    }

    const repetido = pessoas().find(p => p.cpf === req.body.cpf && p.id !== atual.id).value()

    if (repetido) {
        return res.status(409).json({ erro: 'CPF já cadastrado.' })
    }

    req.body = {
        ...req.body,
        id: atual.id,
        role: atual.role,
        senha: req.body.senha || atual.senha
    }
    next()
})

server.delete('/pessoas/:id', (req, res, next) => {
    const atual = pessoas().find({ id: Number(req.params.id) }).value()

    if (atual && atual.role === 'admin') {
        return res.status(400).json({ erro: 'O administrador não pode ser apagado.' })
    }

    next()
})

server.use(router)

server.listen(porta, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${porta}`)
})
