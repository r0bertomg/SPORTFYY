const sessao = exigirLogin('admin')

if (sessao) {
    const corpo = document.getElementById('tabela-corpo')
    const busca = document.getElementById('busca')
    const dialogo = document.getElementById('dialogo')
    let lista = []

    document.getElementById('topoNome').textContent = sessao.usuario.nome
    document.getElementById('btnSair').addEventListener('click', sair)

    function celula(texto) {
        const td = document.createElement('td')
        td.textContent = texto
        return td
    }

    function desenhar() {
        const termo = busca.value.trim().toLowerCase()
        const digitos = termo.replace(/\D/g, '')

        const filtrada = lista.filter(p =>
            p.nome.toLowerCase().includes(termo) ||
            (digitos && p.cpf.replace(/\D/g, '').includes(digitos))
        )

        document.getElementById('contador').textContent = filtrada.length
        corpo.innerHTML = ''

        if (!filtrada.length) {
            const tr = document.createElement('tr')
            const td = celula('Nenhum usuário encontrado.')
            td.colSpan = 5
            td.className = 'vazio'
            tr.appendChild(td)
            corpo.appendChild(tr)
            return
        }

        filtrada.forEach(pessoa => {
            const tr = document.createElement('tr')
            tr.appendChild(celula(pessoa.nome))
            tr.appendChild(celula(pessoa.idade))
            tr.appendChild(celula(pessoa.cpf))

            const tdTipo = document.createElement('td')
            const selo = document.createElement('span')
            selo.className = 'selo' + (pessoa.role === 'admin' ? ' admin' : '')
            selo.textContent = pessoa.role === 'admin' ? 'Admin' : 'Comum'
            tdTipo.appendChild(selo)
            tr.appendChild(tdTipo)

            const tdAcoes = document.createElement('td')
            tdAcoes.className = 'acoes'

            const btnEditar = document.createElement('button')
            btnEditar.className = 'contorno pequeno'
            btnEditar.textContent = 'Editar'
            btnEditar.addEventListener('click', () => abrirEdicao(pessoa))
            tdAcoes.appendChild(btnEditar)

            if (pessoa.role !== 'admin') {
                const btnApagar = document.createElement('button')
                btnApagar.className = 'perigo pequeno'
                btnApagar.textContent = 'Apagar'
                btnApagar.addEventListener('click', () => apagar(pessoa))
                tdAcoes.appendChild(btnApagar)
            }

            tr.appendChild(tdAcoes)
            corpo.appendChild(tr)
        })
    }

    async function carregar() {
        try {
            lista = await requisicao('/pessoas')
            desenhar()
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro')
        }
    }

    function abrirEdicao(pessoa) {
        limparMensagem('mensagemEdicao')
        document.getElementById('editId').value = pessoa.id
        document.getElementById('editNome').value = pessoa.nome
        document.getElementById('editIdade').value = pessoa.idade
        document.getElementById('editCpf').value = pessoa.cpf
        document.getElementById('editSenha').value = ''
        dialogo.showModal()
    }

    async function apagar(pessoa) {
        if (!confirm(`Apagar ${pessoa.nome}?`)) return

        try {
            await requisicao(`/pessoas/${pessoa.id}`, { method: 'DELETE' })
            mostrarMensagem('Usuário apagado com sucesso!', 'ok')
            await carregar()
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro')
        }
    }

    document.getElementById('formEdicao').addEventListener('submit', async evento => {
        evento.preventDefault()
        limparMensagem('mensagemEdicao')

        const id = document.getElementById('editId').value
        const cpf = document.getElementById('editCpf').value
        const senha = document.getElementById('editSenha').value

        if (cpf.length !== 14) {
            mostrarMensagem('Informe um CPF completo.', 'erro', 'mensagemEdicao')
            return
        }

        const corpoRequisicao = {
            nome: document.getElementById('editNome').value.trim(),
            idade: document.getElementById('editIdade').value,
            cpf
        }

        if (senha) corpoRequisicao.senha = senha

        try {
            await requisicao(`/pessoas/${id}`, {
                method: 'PUT',
                body: JSON.stringify(corpoRequisicao)
            })
            dialogo.close()
            mostrarMensagem('Usuário atualizado com sucesso!', 'ok')
            await carregar()
        } catch (erro) {
            mostrarMensagem(erro.message, 'erro', 'mensagemEdicao')
        }
    })

    document.getElementById('btnCancelar').addEventListener('click', () => dialogo.close())
    busca.addEventListener('input', desenhar)

    carregar()
}
