let itens = [];
let editandoItemIndex = -1;
let editandoPecaIndex = -1;
let pecasSelecionadas = {}; // Objeto para armazenar o estado de seleção das peças

// Função para importar dados de uma planilha hospedada no GitHub
function importarPlanilhaGitHub() {
    const url = "https://raw.githubusercontent.com/ELIEDSON-GUSTAVO/banco-de-dados-de-pe-as-e-componentes/350ca493c4dd6d16cfa64cb3e20072400974f4cf/BANCO%20DE%20DADOS.xlsx"; // URL RAW do arquivo no GitHub
    fetch(url)
        .then(response => response.arrayBuffer())
        .then(data => {
            const workbook = XLSX.read(new Uint8Array(data), { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
            processarImportacao(jsonData);
        })
        .catch(error => {
            console.error("Erro ao importar a planilha:", error);
            alert("Não foi possível importar a planilha do GitHub.");
        });
}

// Processa a importação dos dados
function processarImportacao(data) {
    data.forEach((linha, index) => {
        if (index === 0) return; // Ignora o cabeçalho
        const [nomeItem, codigoPeca, quantidade, unidade, descricao] = linha;
        let item = itens.find(i => i.nome === nomeItem);
        if (!item) {
            item = { nome: nomeItem, pecas: [] };
            itens.push(item);
        }
        item.pecas.push({ codigo: codigoPeca, quantidade, unidade, descricao });
    });
    atualizarListaItens();
    atualizarSelectItens();
}

// Função para adicionar ou editar um item
function adicionarOuEditarItem() {
    const nomeItem = document.getElementById("itemNome").value.trim();
    if (!nomeItem) {
        alert("Por favor, insira um nome para o item.");
        return;
    }

    if (editandoItemIndex === -1) {
        itens.push({ nome: nomeItem, pecas: [] });
    } else {
        itens[editandoItemIndex].nome = nomeItem;
        editandoItemIndex = -1;
    }

    document.getElementById("itemNome").value = "";
    atualizarListaItens();
    atualizarSelectItens();
}

// Função para adicionar ou editar uma peça
function adicionarOuEditarPeca() {
    const codigoPeca = document.getElementById("pecaCodigo").value.trim();
    const quantidade = parseInt(document.getElementById("pecaQuantidade").value.trim());
    const unidade = document.getElementById("pecaUnidade").value.trim();
    const descricao = document.getElementById("pecaDescricao").value.trim();
    const itemSelecionadoIndex = document.getElementById("itemSelect").value;

    if (itemSelecionadoIndex === "") {
        alert("Por favor, selecione um item.");
        return;
    }

    if (!codigoPeca || quantidade <= 0 || !unidade || !descricao) {
        alert("Por favor, preencha todos os campos da peça.");
        return;
    }

    const itemIndex = parseInt(itemSelecionadoIndex);
    if (editandoPecaIndex === -1) {
        itens[itemIndex].pecas.push({ codigo: codigoPeca, quantidade, unidade, descricao });
    } else {
        itens[itemIndex].pecas[editandoPecaIndex] = { codigo: codigoPeca, quantidade, unidade, descricao };
        editandoPecaIndex = -1;
    }

    document.getElementById("pecaCodigo").value = "";
    document.getElementById("pecaQuantidade").value = "";
    document.getElementById("pecaUnidade").value = "";
    document.getElementById("pecaDescricao").value = "";
    atualizarListaPecas(itemIndex);
}

// Atualiza a lista de itens na tabela
function atualizarListaItens() {
    const itensBody = document.getElementById("itensBody");
    itensBody.innerHTML = "";
    itens.forEach((item, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td><input type="checkbox" onchange="selecionarItem(${index}, this)" ${pecasSelecionadas[index] ? 'checked' : ''}></td>
            <td>${item.nome} (${item.pecas.length} peças)</td>
            <td>
                <button onclick="editarItem(${index})">Editar</button>
                <button onclick="excluirItem(${index})">Excluir</button>
                <button onclick="verPecas(${index})">Ver Peças</button>
            </td>
        `;
        itensBody.appendChild(tr);
    });
}

// Atualiza o select de itens para adicionar peças
function atualizarSelectItens() {
    const itemSelect = document.getElementById("itemSelect");
    itemSelect.innerHTML = `<option value="">Selecione um item</option>`;
    itens.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.nome;
        itemSelect.appendChild(option);
    });
}

// Função para gerar um arquivo Excel considerando as seleções
function gerarExcel() {
    const wb = XLSX.utils.book_new();
    const dados = [];

    itens.forEach(item => {
        const pecas = item.pecas.map(peca => [item.nome, peca.codigo, peca.quantidade, peca.unidade, peca.descricao]);
        dados.push(...pecas);
    });

    const ws = XLSX.utils.aoa_to_sheet(dados);
    XLSX.utils.book_append_sheet(wb, ws, "Itens e Peças");
    XLSX.writeFile(wb, "itens_e_pecas.xlsx");
}

// Função para selecionar ou desmarcar um item e suas peças
function selecionarItem(itemIndex, checkbox) {
    const todasSelecionadas = checkbox.checked;
    // Selecionar ou desmarcar as peças de acordo com o status do item
    verPecas(itemIndex); // Atualiza a lista de peças para garantir que só mostre as do item selecionado
    const pecasCheckboxes = document.querySelectorAll(`#pecasList input[type='checkbox'][data-item-index='${itemIndex}']`);
    pecasCheckboxes.forEach((pecaCheckbox) => {
        pecaCheckbox.checked = todasSelecionadas; // Marcar ou desmarcar as peças
        // Atualiza o objeto de seleção das peças
        if (!pecasSelecionadas[itemIndex]) {
            pecasSelecionadas[itemIndex] = {};
        }
        pecasSelecionadas[itemIndex][pecaCheckbox.dataset.pecaIndex] = todasSelecionadas;
    });
}

// Função que será chamada assim que a página for carregada
window.onload = function() {
    importarPlanilhaGitHub(); // Chama a função para importar os dados
};
