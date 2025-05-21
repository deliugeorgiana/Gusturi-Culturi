window.addEventListener("DOMContentLoaded", function () {
    const maxProduse = 2;
    const storageKey = "produseComparare";
    const container = document.getElementById("container-comparare");
    const lista = document.getElementById("lista-comparare");

    function salveazaComparare(listaProd) {
        localStorage.setItem(storageKey, JSON.stringify({
            produse: listaProd,
            timestamp: new Date().getTime()
        }));
    }

    function incarcaComparare() {
        let salvate = JSON.parse(localStorage.getItem(storageKey));
        if (!salvate) return [];

        let trecut = new Date().getTime() - salvate.timestamp;
        if (trecut > 24 * 60 * 60 * 1000) {
            localStorage.removeItem(storageKey);
            return [];
        }
        return salvate.produse || [];
    }

    function actualizeazaUI() {
        container.style.cssText = ` 
            position: fixed;
            bottom: 10px;
            right: 10px;
            background-color: var(--culoare-rosie);
            color: var(--culoare-gri);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0,0,0,0.5);
            z-index: 1000;
        `;
        let produse = incarcaComparare();
        if (produse.length === 0) {
            container.style.display = "none";
            return;
        }

        container.style.display = "block";
        lista.innerHTML = "";

        const btnExistent = container.querySelector("#btn-afiseaza");
        if (btnExistent) btnExistent.remove();

        produse.forEach((prod, idx) => {
            let li = document.createElement("li");
            li.textContent = prod.nume;
            let btnSterge = document.createElement("button");
            btnSterge.className = "btn btn-secondary btn-sm text-primary";
            btnSterge.style.cssText = `
                margin-left: 3px;
                padding: 0 5px;
            `;
            btnSterge.textContent = "✕";
            btnSterge.onclick = () => {
                produse.splice(idx, 1);
                salveazaComparare(produse);
                actualizeazaUI();
                if(produse.length === 0) enableButtons();
            };
            
            li.appendChild(btnSterge);
            lista.appendChild(li);
        });

        

        if (produse.length === 2) {
            let btnAfisare = document.createElement("button");
            btnAfisare.id = "btn-afiseaza";
            btnAfisare.textContent = "Afiseaza";
            btnAfisare.className = "btn btn-secondary btn-sm text-primary";
            btnAfisare.onclick = () => {
                window.open(`/compara?ids=${produse.map(p => p.id).join(",")}`, "_blank"); //deschide intr-o fereastra noua
            };
            container.appendChild(btnAfisare);
        }

        document.querySelectorAll(".compara-btn").forEach(btn => {
            if (produse.length >= 2) {
                btn.disabled = true;
                btn.title = "Stergeti un produs din lista de comparare.";
            } else {
                const id = btn.dataset.id;
                const dejaAdaugat = produse.some(p => p.id === id);
                btn.disabled = dejaAdaugat;
                btn.title = dejaAdaugat ? "Produsul este deja adaugat" : "";
            }
        });
        
    }

    function enableButtons() {
        document.querySelectorAll(".compara-btn").forEach(btn => {
            btn.disabled = false;
        });
    }

    function disableButtons() {
        document.querySelectorAll(".compara-btn").forEach(btn => {
            btn.disabled = true;
        });
    }

    document.querySelectorAll(".compara-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            let produse = incarcaComparare();
            if (produse.length >= maxProduse) return;

            produse.push({ id: btn.dataset.id, nume: btn.dataset.nume });
            salveazaComparare(produse);
            actualizeazaUI();

            if (produse.length === maxProduse) disableButtons();
        });
    });

    actualizeazaUI();
});