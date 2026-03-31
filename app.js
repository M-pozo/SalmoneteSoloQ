const SUPABASE_URL = "https://ulhvmtqzcibwdghechga.supabase.co";
const SUPABASE_KEY = "sb_publishable_1CEj7ZTXh5xFct5eyX_09A_jrMSqqUX";

const RIOT_BASE = "https://europe.api.riotgames.com";
const RIOT_PLAYERS = "https://euw1.api.riotgames.com";

document.getElementById("filterAll").onclick = () => loadPlayers("all");
document.getElementById("filterMain").onclick = () => loadPlayers("main");
document.getElementById("filterNonMain").onclick = () => loadPlayers("nonMain");

const modal = document.getElementById("modal");
document.getElementById("openModal").onclick = () => {
  modal.classList.remove("hidden");
};

const modal2 = document.getElementById("modal");

modal2.addEventListener("click", (e) => {
  // si haces click en el fondo (no en el contenido)
  if (e.target === modal2) {
    modal2.classList.add("hidden");
  }
});

// 🔹 Obtener API key
async function getApiKey() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Root`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const data = await res.json();
  return data[0].api_key;
}

// 🔹 Registrar
document.getElementById("register").onclick = async () => {
  const name = document.getElementById("name").value;
  let tag = document.getElementById("tag").value.replace(/#/g, "");
  const file = document.getElementById("image").files[0];
  const isMain = document.getElementById("isMain").checked; // 🔹 aquí

  if (!file) {
    alert("Selecciona una imagen");
    return;
  }

  try {
    const apiKey = await getApiKey();

    // Subir imagen
    const imageUrl = await uploadImage(file);

    // Obtener PUUID
    const riotRes = await fetch(
      `${RIOT_BASE}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
      {
        headers: { "X-Riot-Token": apiKey }
      }
    );
    const riotData = await riotRes.json();
    if (!riotData.puuid) return alert("Jugador no encontrado");

    // Verificar duplicado
    const check = await fetch(
      `${SUPABASE_URL}/rest/v1/Usuarios?puuid=eq.${riotData.puuid}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const exists = await check.json();
    if (exists.length > 0) return alert("Participante ya registrado");

    // Insertar en DB incluyendo `main`
    await fetch(`${SUPABASE_URL}/rest/v1/Usuarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify({
        puuid: riotData.puuid,
        name,
        tag,
        image_url: imageUrl,
        main: isMain // 🔹 aquí guardamos si es main
      })
    });

    alert("✅ Participante registrado correctamente");

    // Limpiar formulario
    document.getElementById("name").value = "";
    document.getElementById("tag").value = "";
    document.getElementById("image").value = "";
    document.getElementById("isMain").checked = false;
    document.getElementById("drop-text").innerHTML = "Arrastra una imagen aquí<br>o haz clic para seleccionar";

    modal.classList.add("hidden");

    loadPlayers();

  } catch (err) {
    console.error(err);
    alert("Error en el registro");
  }
};

// 🔹 Render card
function createCard(p, ranked, isTop = false, isLast = false) {
  let winrate = 0;
  let lp = 0;

  if (ranked) {
    winrate = Math.round((ranked.wins / (ranked.wins + ranked.losses)) * 100);
    lp = ranked.leaguePoints || 0;
  }

  let rankImage = ranked 
    ? `img/elo/${ranked.tier.toUpperCase()}${ranked.rank.toUpperCase()}.png`
    : "img/elo/unranked.png";

  const opggLink = `https://www.op.gg/summoners/euw/${encodeURIComponent(p.name)}-${encodeURIComponent(p.tag)}`;

  // Borde dorado si es top
  const topClass = isTop 
    ? "border-2 border-yellow-400 shadow-lg shadow-yellow-500/30 bg-gradient-to-r from-yellow-500/10 to-transparent"
    : "";

  // Contenedor externo para borde arcoíris
  const outerStart = isLast ? `<div class="rounded-xl p-[2px] bg-[linear-gradient(90deg,#e40303,#ff8c00,#ffed00,#008026,#24408e,#732982)]">` : "";
  const outerEnd = isLast ? `</div>` : "";

  const cardClass = `${topClass} bg-gray-800 rounded-xl shadow-lg w-full flex flex-col gap-3 p-4`;

  return `
    ${outerStart}
      <div class="${cardClass}">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <img src="${p.image_url}" class="w-16 h-16 rounded-lg object-cover">

            <div>
              <h3 class="text-lg font-bold flex items-center gap-2">
                ${p.name} #${p.tag.toUpperCase()}
                ${isTop ? '<span class="text-yellow-400">👑</span>' : ''}
              </h3>

              <div class="flex items-center gap-2">
                <p class="text-sm text-gray-300">
                  ${ranked?.tier || "Unranked"} ${ranked?.rank || ""}
                </p>
                <img src="${rankImage}" class="w-6 h-6">
              </div>

              <p class="text-sm text-gray-400">${lp} LP</p>
            </div>
          </div>

          <div class="flex gap-2 text-lg">
            ${ranked?.hotStreak ? '🔥' : ''}
            ${ranked?.freshBlood ? '🆕' : ''}
          </div>
        </div>

        <div class="flex justify-between items-center mt-2 text-sm">
          <div class="flex gap-4 flex-wrap">
            <span class="text-green-400 font-semibold">${ranked?.wins || 0}W</span>
            <span class="text-red-400 font-semibold">${ranked?.losses || 0}L</span>
            <span class="text-gray-300">
              ${(ranked?.wins || 0) + (ranked?.losses || 0)} games
            </span>
            <span class="text-blue-400 font-semibold">${winrate}%</span>
          </div>

          <a href="${opggLink}" target="_blank" class="text-blue-400 hover:underline">
            OP.GG
          </a>
        </div>
      </div>
    ${outerEnd}
  `;
}

// 🔹 Cargar jugadores
async function loadPlayers(filter = "main") {
  const apiKey = await getApiKey();

  // 🔹 Obtener todos
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Usuarios`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
  });
  let players = await res.json();

  // 🔹 Aplicar filtro
  if (filter === "main") players = players.filter(p => p.main);
  if (filter === "nonMain") players = players.filter(p => !p.main);

  const container = document.getElementById("players");
  container.innerHTML = "<p>Cargando...</p>";

  let playersWithRank = [];

  for (let p of players) {
    const rankRes = await fetch(
      `${RIOT_PLAYERS}/lol/league/v4/entries/by-puuid/${p.puuid}`,
      { headers: { "X-Riot-Token": apiKey } }
    );
    const rankData = await rankRes.json();
    const ranked = rankData[0];
    const elo = calculateElo(ranked);

    playersWithRank.push({ player: p, ranked, elo });
  }

  // Ordenar por ELO
  playersWithRank.sort((a, b) => b.elo - a.elo);

  // Render
  let html = "";
  for (let i = 0; i < playersWithRank.length; i++) {
    const item = playersWithRank[i];
    const isTop = i === 0;
    const isLast = i === playersWithRank.length - 1;
    html += createCard(item.player, item.ranked, isTop, isLast);
  }

  container.innerHTML = html;
}

async function uploadImage(file) {
  const fileName = `${Date.now()}-${file.name}`;

  const res = await fetch(
    `${SUPABASE_URL}/storage/v1/object/avatars/${fileName}`,
    {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": file.type
      },
      body: file
    }
  );

  if (!res.ok) {
    throw new Error("Error subiendo imagen");
  }

  // URL pública
  return `${SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
}

const tierOrder = {
  IRON: 1,
  BRONZE: 2,
  SILVER: 3,
  GOLD: 4,
  PLATINUM: 5,
  EMERALD: 6,
  DIAMOND: 7,
  MASTER: 8,
  GRANDMASTER: 9,
  CHALLENGER: 10
};

const rankOrder = {
  IV: 1,
  III: 2,
  II: 3,
  I: 4
};

function calculateElo(ranked) {
  if (!ranked) return 0;

  const tier = tierOrder[ranked.tier] || 0;
  const rank = rankOrder[ranked.rank] || 0;
  const lp = ranked.leaguePoints || 0;

  return (tier * 1000) + (rank * 100) + lp;
}

const registerBtn = document.getElementById("register");

registerBtn.addEventListener("click", () => {
  // Limpiar inputs
  document.getElementById("name").value = "";
  document.getElementById("tag").value = "";
  document.getElementById("image").value = "";

  // Resetear texto del drop zone
  document.getElementById("drop-text").innerHTML =
    "Arrastra una imagen aquí<br>o haz clic para seleccionar";
});

loadPlayers();
