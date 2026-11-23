document.getElementById('formulario').addEventListener('submit', async evento => {
    evento.preventDefault()
    limparMensagem()

    const nome = document.getElementById('nome').value.trim()
    const idade = document.getElementById('idade').value
    const cpf = document.getElementById('cpf').value
    const senha = document.getElementById('senha').value
    const confirmar = document.getElementById('confirmar').value

    if (cpf.length !== 14) {
        mostrarMensagem('Informe um CPF completo.', 'erro')
        return
    }

    if (senha !== confirmar) {
        mostrarMensagem('As senhas não coincidem.', 'erro')
        return
    }

    try {
        await requisicao('/pessoas', {
            method: 'POST',
            body: JSON.stringify({ nome, idade, cpf, senha })
        })
        mostrarMensagem('Cadastro realizado! Redirecionando para o login...', 'ok')
        evento.target.reset()
        setTimeout(() => { location.href = 'index.html' }, 1500)
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro')
    }
})
