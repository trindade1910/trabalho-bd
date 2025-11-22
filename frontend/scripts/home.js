document.addEventListener("DOMContentLoaded", () => {

    // BOTÃO DE LOGOUT
    const btnLogout = document.getElementById("logout");

    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            localStorage.removeItem("user");
            window.location.href = "index.html";
        });
    }

    const listaFilmes = document.getElementById("listaFilmes");
    const heroPoster = document.getElementById("heroPoster");

    let filmesCache = []; // manter para hero e modal

document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const btnAdmin = document.getElementById("btnAdmin");

    if (user && user.isAdmin) {
        btnAdmin.style.display = "inline-block";
    } else {
        btnAdmin.style.display = "none";
    }
});


    // ============================
    // CARREGAR FILMES
    // ============================
    async function carregarFilmes() {
        try {
            const resposta = await fetch("http://localhost:3000/api/filmes");
            const filmes = await resposta.json();
            filmesCache = filmes;

            listaFilmes.innerHTML = "";

            // Atualizar poster do banner com o primeiro filme
            if (filmes.length > 0) {
                heroPoster.src = filmes[0].capa;
            }

            filmes.forEach(filme => {
                const card = document.createElement("div");
                card.className = "card-filme";

                card.innerHTML = `
                    <img src="${filme.capa}" alt="Capa de ${filme.nome}">
                    <h3>${filme.nome}</h3>
                    <p class="card-meta">${filme.genero} • ${filme.ano_lancamento}</p>
                `;

                card.onclick = () => abrirModalFilme(filme);

                listaFilmes.appendChild(card);
            });

        } catch (erro) {
            console.error("Erro ao carregar filmes:", erro);
        }
    }

    carregarFilmes();


    // ============================
    // MODAL DOS FILMES
    // ============================
    function abrirModalFilme(filme) {
        const modal = document.getElementById("modalFilme");
        const modalConteudo = document.getElementById("modalConteudo");

        // Corrigir link do YouTube para embed
        let linkTrailer = filme.trailer_url || "";
        if (linkTrailer.includes("watch?v=")) {
            const id = linkTrailer.split("watch?v=")[1];
            linkTrailer = `https://www.youtube.com/embed/${id}`;
        }

        modalConteudo.innerHTML = `
            <span id="fecharModal">&times;</span>

            <h2>${filme.nome}</h2>

            <div class="modal-info">

                <iframe
                    src="${linkTrailer}"
                    title="Trailer"
                    frameborder="0"
                    allowfullscreen>
                </iframe>

                <div class="meta">
                    <p><strong>Sinopse:</strong> ${filme.sinopse}</p>
                    <p><strong>Gênero:</strong> ${filme.genero}</p>
                    <p><strong>Ano:</strong> ${filme.ano_lancamento}</p>
                    <p><strong>Idioma:</strong> ${filme.idioma}</p>
                </div>

            </div>
        `;

        modal.style.display = "flex";

        document.getElementById("fecharModal").onclick = () => {
            modal.style.display = "none";
        };
    }

    // FECHAR MODAL AO CLICAR FORA
    window.onclick = event => {
        const modal = document.getElementById("modalFilme");
        if (event.target === modal) modal.style.display = "none";
    };


    // ============================
    // BOTÕES DO BANNER
    // ============================

    // Mais informações → abre o modal do primeiro filme
    const btnMaisInfo = document.getElementById("maisInfo");
    if (btnMaisInfo) {
        btnMaisInfo.addEventListener("click", () => {
            if (filmesCache.length > 0) {
                abrirModalFilme(filmesCache[0]);
            }
        });
    }

    // Assistir trailer → rola para o catálogo
    const btnVerAgora = document.getElementById("verAgora");
    if (btnVerAgora) {
        btnVerAgora.addEventListener("click", () => {
            window.scrollTo({ top: listaFilmes.offsetTop - 80, behavior: "smooth" });
        });
    }

});
