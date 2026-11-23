function salvarSessao(token, usuario) {
    localStorage.setItem('sessao', JSON.stringify({ token, usuario }))
}

function lerSessao() {
    try {
        return JSON.parse(localStorage.getItem('sessao'))
    } catch {
        return null
    }
}

function sair() {
    localStorage.removeItem('sessao')
    location.href = 'index.html'
}

function irParaInicio(usuario) {
    location.href = usuario.role === 'admin' ? 'admin.html' : 'bem-vindo.html'
}

function exigirLogin(role) {
    const sessao = lerSessao()

    if (!sessao) {
        location.href = 'index.html'
        return null
    }

    if (role && sessao.usuario.role !== role) {
        irParaInicio(sessao.usuario)
        return null
    }

    return sessao
}

async function requisicao(url, opcoes = {}) {
    const sessao = lerSessao()
    const headers = { 'Content-Type': 'application/json' }

    if (sessao) headers.Authorization = 'Bearer ' + sessao.token

    let resposta

    try {
        resposta = await fetch(url, { ...opcoes, headers })
    } catch {
        throw new Error('Não foi possível conectar ao servidor.')
    }

    const dados = await resposta.json().catch(() => ({}))

    if (resposta.status === 403 && sessao) {
        sair()
    }

    if (!resposta.ok) {
        throw new Error(dados.erro || 'Algo deu errado.')
    }

    return dados
}

function mascaraCPF(valor) {
    const d = valor.replace(/\D/g, '').slice(0, 11)
    return d
        .replace(/^(\d{3})(\d)/, '$1.$2')
        .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1-$2')
}

function mostrarMensagem(texto, tipo, id = 'mensagem') {
    const el = document.getElementById(id)
    el.textContent = texto
    el.className = 'mensagem ' + tipo
}

function limparMensagem(id = 'mensagem') {
    document.getElementById(id).className = 'mensagem'
}

document.querySelectorAll('input[data-cpf]').forEach(input => {
    input.addEventListener('input', () => {
        input.value = mascaraCPF(input.value)
    })
})
