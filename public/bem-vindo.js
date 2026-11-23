const sessao = exigirLogin()

if (sessao) {
    const usuario = sessao.usuario

    if (usuario.role === 'admin') {
        irParaInicio(usuario)
    }

    document.getElementById('topoNome').textContent = usuario.nome
    document.getElementById('saudacao').textContent = 'Olá, ' + usuario.nome.split(' ')[0]
    document.getElementById('avatar').textContent = usuario.nome.charAt(0).toUpperCase()
    document.getElementById('dNome').textContent = usuario.nome
    document.getElementById('dIdade').textContent = usuario.idade
    document.getElementById('dCpf').textContent = usuario.cpf
    document.getElementById('btnSair').addEventListener('click', sair)
}
