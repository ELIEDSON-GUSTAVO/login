let itens = [];
let pecas = {};

function adicionarOuEditarItem() {
    const itemNome = document.getElementById("itemNome").value.trim();
    if (!itemNome) {
        alert("Digite o nome do item.");
        return;
    }

    if (!itens.includes(itemNome)) {
        itens.push(itemNome);
        atualizarListaItens();
    } else {
        alert("Item já existe, pode ser editado nas peças.");
    }
    document.getElementById("itemNome").value = "";
}

function adicionarOuEditarPeca() {
    const item = document.getElementById("itemSelect").value;
    const codigo = document.getElementById("pecaCodigo").value.trim();
    const quantidade = parseInt(document.getElementById("pecaQuantidade").value);
    const unidade = document.getElementById("pecaUnidade").value.trim();
    const descricao = document.getElementById("pecaDescricao").value.trim();

    if (!item || !codigo || !quantidade || !unidade || !descricao) {
        alert("Preencha todos os campos para adicionar ou editar uma peça.");
        return;
    }

    if (!pecas[item]) {
        pecas[item] = [];
    }

    const index = pecas[item].findIndex((peca) => peca.codigo === codigo);
    if (index > -1) {
        pecas[item][index].quantidade += quantidade;
    } else {
        pecas[item].push({ codigo, quantidade, unidade, descricao });
    }

    atualizarListaPecas(item);
    limparCamposPeca();
}

function atualizarListaItens() {
    const tbody = document.getElementById("itensBody");
    tbody.innerHTML = "";
    const itemSelect = document.getElementById("itemSelect");
    itemSelect.innerHTML = '<option value="">Selecione um item</option>';

    itens.forEach((item) => {
        const row = document.createElement("tr");

        const selecionarCell = document.createElement("td");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        selecionarCell.appendChild(checkbox);
        row.appendChild(selecionarCell);

        const itemCell = document.createElement("td");
        itemCell.textContent = item;
        row.appendChild(itemCell);

        const acoesCell = document.createElement("td");
        const verPecasBtn = document.createElement("button");
        verPecasBtn.textContent = "Ver Peças";
        verPecasBtn.onclick = () => {
            document.getElementById("pecasList").scrollIntoView({ behavior: "smooth" });
            atualizarListaPecas(item);
        };
        acoesCell.appendChild(verPecasBtn);
        row.appendChild(acoesCell);

        tbody.appendChild(row);

        const option = document.createElement("option");
        option.value = item;
        option.textContent = item;
        itemSelect.appendChild(option);
    });
}

function atualizarListaPecas(item) {
    const ul = document.getElementById("pecasList");
    ul.innerHTML = "";
    if (!pecas[item]) return;

    pecas[item].forEach((peca) => {
        const li = document.createElement("li");
        li.textContent = `${peca.codigo} - ${peca.quantidade} ${peca.unidade} - ${peca.descricao}`;
        ul.appendChild(li);
    });
}

function limparCamposPeca() {
    document.getElementById("pecaCodigo").value = "";
    document.getElementById("pecaQuantidade").value = "";
    document.getElementById("pecaUnidade").value = "";
    document.getElementById("pecaDescricao").value = "";
}

// Placeholder para funções de importação/exportação (não alteradas).

function importarExcel() {
    // ...
}

function gerarExcel() {
    // ...
}
