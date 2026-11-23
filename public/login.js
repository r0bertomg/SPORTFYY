const sessaoAtual = lerSessao()

if (sessaoAtual) irParaInicio(sessaoAtual.usuario)

document.getElementById('formulario').addEventListener('submit', async evento => {
    evento.preventDefault()
    limparMensagem()

    const cpf = document.getElementById('cpf').value
    const senha = document.getElementById('senha').value

    try {
        const dados = await requisicao('/login', {
            method: 'POST',
            body: JSON.stringify({ cpf, senha })
        })
        salvarSessao(dados.token, dados.usuario)
        irParaInicio(dados.usuario)
    } catch (erro) {
        mostrarMensagem(erro.message, 'erro')
    }
})
