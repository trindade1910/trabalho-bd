async function carregarFilme() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("ID do filme não encontrado!");
    return;
  }

  try {
    const res = await fetch(`/api/filmes/${id}`);
    const filme = await res.json();

    document.getElementById("titulo").textContent = filme.titulo;
    document.getElementById("imagem").src = filme.imagem;
    document.getElementById("descricao").textContent = filme.descricao;

    document.getElementById("genero").textContent = filme.genero || "—";
    document.getElementById("ano").textContent = filme.ano_lancamento || "—";
    document.getElementById("idiomas").textContent = filme.idiomas || "—";
    document.getElementById("duracao").textContent = filme.duracao || "—";

    // Trailer em embed
    if (filme.trailer) {
      document.getElementById("trailer").src = filme.trailer.replace("watch?v=", "embed/");
    } else {
      document.getElementById("trailer").style.display = "none";
    }

  } catch (e) {
    console.error("Erro:", e);
    alert("Erro ao carregar o filme.");
  }
}

// Botão de voltar
document.getElementById("voltar").addEventListener("click", () => {
  history.back();
});

carregarFilme();
