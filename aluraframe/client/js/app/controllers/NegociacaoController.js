class NegociacaoController {

    constructor() {
        
        let $ = document.querySelector.bind(document);

        this._inputData = $('#data');
        this._inputQuantidade = $('#quantidade');
        this._inputValor = $('#valor');

        this._listaNegociacoes = new Bind(
            new ListaNegociacoes(), 
            new NegociacoesView($('#negociacoesView')), 'adiciona', 'esvaiza', 'ordena', 'inverteOrdem');

        this._mensagem = new Bind(
            new Mensagem(), 
            new MensagemView($('#mensagemView')), 'texto');
        
        this._ordemAtual = '';

        ConnectionFactory
            .getConnection()
            .then(connection => {
                new NegociacaoDao(connection).listaTodos().then(negociacoes => {
                negociacoes.forEach(negociacao => {
                    this._listaNegociacoes.adiciona(negociacao);
                });
            });
        });
    }  

    adiciona(event) {

        event.preventDefault();

        ConnectionFactory.getConnection().then(connection => {

            let negociacao = this._criaNegociacao();

            new NegociacaoDao(connection).adiciona(negociacao).then(() => {
                this._listaNegociacoes.adiciona(negociacao);
                this._mensagem.texto = 'Negociação adicionada com sucesso';
                this._limpaFormulario();
            })
        })
        .catch(erro => this._mensagem.texto = erro);
    }

    importaNegociacoes() {

        let service = new NegociacaoService();

        service
            .obterNegociacoes()
            .then(negociacoes => {
                negociacoes.forEach(negociacao => this._listaNegociacoes.adiciona(negociacao));
                this._mensagem.texto = 'Negociações importadas com sucesso.'
            })
            .catch(erro => this._mensagem.texto.erro);
    }

    apaga() {

        this._listaNegociacoes.esvazia();
        this._mensagem.texto = 'Negociações apagadas com sucesso';
    }

    _criaNegociacao() {

        return new Negociacao(
            DateHelper.textoParaData(this._inputData.value),
            parseInt(this._inputQuantidade.value),
            parseFloat(this._inputValor.value)
        );
    }
    _limpaFormulario() {

        this._inputData.value = '';
        this._inputQuantidade.value = 1;
        this._inputValor.value = 0.0;

        this._inputData.focus();
    }

    ordena (coluna) {

        if(this._ordemAtual == coluna) {

            this._listaNegociacoes.inverteOrdem();

        }else {

            this._listaNegociacoes.ordena((a, b) => a[coluna] - b[coluna]); 
        }
        this._ordemAtual = coluna;
    }
}