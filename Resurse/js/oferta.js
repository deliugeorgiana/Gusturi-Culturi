window.addEventListener("DOMContentLoaded", () => {
    const cont = document.getElementById("oferta-timer");
    if (!cont) return;
    const end = new Date(cont.dataset.end).getTime();
    
    const timerId = setInterval(() => {
      const now = Date.now();
      let diff = Math.max(0, end - now);
      const secTot = Math.floor(diff / 1000);
      const h = String(Math.floor(secTot / 3600)).padStart(2, "0");
      const m = String(Math.floor((secTot % 3600) / 60)).padStart(2, "0");
      const s = String(secTot % 60).padStart(2, "0");
      cont.textContent = `${h}:${m}:${s}`;
      // ultimele 10 sec
      if (secTot <= 10) cont.classList.add("ultimele-secunde");
      if (diff === 0) {
        clearInterval(timerId);
        location.reload();
      }
    }, 1000);
  });