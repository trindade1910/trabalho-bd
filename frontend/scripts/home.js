document.addEventListener("DOMContentLoaded", () => {

    // 🔹 BOTÃO DE LOGOUT (correção principal)
    const btnLogout = document.getElementById("logout");

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("user"); 
            window.location.href = "index.html"; 
        });
    }

    // =========================================
    // 🔹 CARREGAR FILMES
    // =========================================

    const listaFilmes = document.getElementById("listaFilmes");

    async function carregarFilmes() {
        try {
            // 🔥 ERRO CORRIGIDO → sua rota correta é /api/filmes
            const resposta = await fetch("http://localhost:3000/api/filmes");
            const filmes = await resposta.json();

            listaFilmes.innerHTML = "";

            filmes.forEach(filme => {
                const card = document.createElement("div");
                card.className = "card-filme";

                card.innerHTML = `
                    <img src="${filme.imagem}" alt="Capa de ${filme.nome}">
                    <h3>${filme.nome}</h3>
                `;

                // 🔹 Ao clicar no card → abre o modal
                card.onclick = () => abrirModalFilme(filme);

                listaFilmes.appendChild(card);
            });

        } catch (erro) {
            console.error("Erro ao carregar filmes:", erro);
        }
    }

    carregarFilmes();

    // =========================================
    // 🔹 MODAL DO FILME
    // =========================================

    function abrirModalFilme(filme) {
        const modal = document.getElementById("modalFilme");
        const modalConteudo = document.getElementById("modalConteudo");

        modalConteudo.innerHTML = `
            <span id="fecharModal">&times;</span>

            <h2>${filme.nome}</h2>

            <div class="modal-info">

                <iframe width="100%" height="315" 
                    src="${filme.trailer || ""}"
                    title="Trailer"
                    frameborder="0"
                    allowfullscreen>
                </iframe>

                <p><strong>Sinopse:</strong> ${filme.sinopse || "Não informada."}</p>
                <p><strong>Gênero:</strong> ${filme.genero}</p>
                <p><strong>Ano de lançamento:</strong> ${filme.ano_lancamento ? new Date(filme.ano_lancamento).getFullYear() : "—"}</p>
                <p><strong>Idioma:</strong> ${filme.idioma || "—"}</p>
            </div>
        `;

        modal.style.display = "block";

        // 🔹 Fechar modal
        document.getElementById("fecharModal").onclick = () => {
            modal.style.display = "none";
        };
    }

    // 🔹 Fecha modal clicando fora
    window.onclick = (event) => {
        const modal = document.getElementById("modalFilme");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    };

});
