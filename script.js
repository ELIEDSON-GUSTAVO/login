
// Gerenciar itens e peças
let itens = [];

// Função para atualizar a tabela de itens
function atualizarTabelaItens() {
    const itensBody = document.getElementById("itensBody");
    itensBody.innerHTML = "";
    itens.forEach((item, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox" data-index="${index}"></td>
            <td>${item.nome}</td>
            <td>
                <button onclick="verPecas(${index})">Ver Peças</button>
                <button onclick="removerItem(${index})">Remover</button>
            </td>
        `;
        itensBody.appendChild(row);
    });

    atualizarSelectItens();
}

// Função para atualizar o seletor de itens
function atualizarSelectItens() {
    const itemSelect = document.getElementById("itemSelect");
    itemSelect.innerHTML = '<option value="">Selecione um item</option>';
    itens.forEach((item, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = item.nome;
        itemSelect.appendChild(option);
    });
}

// Adicionar ou editar item
function adicionarOuEditarItem() {
    const itemNome = document.getElementById("itemNome").value.trim();
    if (!itemNome) return alert("Insira um nome para o item.");
    const existente = itens.find(item => item.nome === itemNome);
    if (existente) {
        alert("Item já existe. Edite as peças associadas a ele.");
    } else {
        itens.push({ nome: itemNome, pecas: [] });
        atualizarTabelaItens();
    }
    document.getElementById("itemNome").value = "";
}

// Remover item
function removerItem(index) {
    itens.splice(index, 1);
    atualizarTabelaItens();
    document.getElementById("pecasList").innerHTML = "";
}

// Ver peças de um item
function verPecas(index) {
    const pecasList = document.getElementById("pecasList");
    pecasList.innerHTML = "";
    itens[index].pecas.forEach((peca, pecaIndex) => {
        const li = document.createElement("li");
        li.innerHTML = `
            <span>${peca.codigo} - ${peca.descricao} (${peca.quantidade} ${peca.unidade})</span>
            <button onclick="removerPeca(${index}, ${pecaIndex})">Remover</button>
        `;
        pecasList.appendChild(li);
    });
    // Rolando para a lista de peças
    pecasList.scrollIntoView({ behavior: "smooth" });
}

// Adicionar ou editar peça
function adicionarOuEditarPeca() {
    const itemIndex = document.getElementById("itemSelect").value;
    if (itemIndex === "") return alert("Selecione um item.");
    const codigo = document.getElementById("pecaCodigo").value.trim();
    const quantidade = parseInt(document.getElementById("pecaQuantidade").value);
    const unidade = document.getElementById("pecaUnidade").value.trim();
    const descricao = document.getElementById("pecaDescricao").value.trim();
    if (!codigo || isNaN(quantidade) || !unidade || !descricao) return alert("Preencha todos os campos da peça.");

    const item = itens[itemIndex];
    const existente = item.pecas.find(peca => peca.codigo === codigo);
    if (existente) {
        existente.quantidade += quantidade; // Soma as quantidades se já existir
        alert("Quantidade da peça atualizada.");
    } else {
        item.pecas.push({ codigo, quantidade, unidade, descricao });
        alert("Peça adicionada ao item.");
    }

    verPecas(itemIndex);

    document.getElementById("pecaCodigo").value = "";
    document.getElementById("pecaQuantidade").value = "";
    document.getElementById("pecaUnidade").value = "";
    document.getElementById("pecaDescricao").value = "";
}

// Remover peça
function removerPeca(itemIndex, pecaIndex) {
    itens[itemIndex].pecas.splice(pecaIndex, 1);
    verPecas(itemIndex);
}

// Importar Excel
function importarExcel() {
    const input = document.getElementById("importFile");
    if (input.files.length === 0) return alert("Selecione um arquivo para importar.");
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(sheet);
        itens = json.map(row => ({
            nome: row.Item,
            pecas: JSON.parse(row.Peças || "[]")
        }));
        atualizarTabelaItens();
        alert("Importação concluída.");
    };
    reader.readAsArrayBuffer(input.files[0]);
}

// Exportar Excel
function gerarExcel() {
    const selecionados = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'))
        .map(cb => itens[cb.dataset.index]);
    if (selecionados.length === 0) return alert("Selecione ao menos um item para exportar.");
    const data = selecionados.map(item => ({
        Item: item.nome,
        Peças: JSON.stringify(item.pecas)
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Itens");
    XLSX.writeFile(wb, "itens.xlsx");
    alert("Exportação concluída.");
}
