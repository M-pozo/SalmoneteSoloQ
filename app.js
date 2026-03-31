const SUPABASE_URL = "https://ulhvmtqzcibwdghechga.supabase.co";
const SUPABASE_KEY = "sb_publishable_1CEj7ZTXh5xFct5eyX_09A_jrMSqqUX";

const RIOT_BASE = "https://europe.api.riotgames.com";
const RIOT_PLAYERS = "https://euw1.api.riotgames.com";

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
  const tag = document.getElementById("tag").value;
  const file = document.getElementById("image").files[0];

  if (!file) {
    alert("Selecciona una imagen");
    return;
  }

  try {
    const apiKey = await getApiKey();

    // 🔹 1. Subir imagen
    const imageUrl = await uploadImage(file);

    // 🔹 2. Obtener PUUID
    const riotRes = await fetch(
      `${RIOT_BASE}/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
      {
        headers: { "X-Riot-Token": apiKey }
      }
    );

    const riotData = await riotRes.json();

    if (!riotData.puuid) {
      alert("Jugador no encontrado");
      return;
    }

    // 🔹 3. Verificar duplicado
    const check = await fetch(
      `${SUPABASE_URL}/rest/v1/Usuarios?puuid=eq.${riotData.puuid}`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`
        }
      }
    );

    const exists = await check.json();

    if (exists.length > 0) {
      alert("Participante ya registrado");
      return;
    }

    // 🔹 4. Insertar en DB
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
        image_url: imageUrl
      })
    });

    // ✅ Éxito
    alert("✅ Participante registrado correctamente");

    // 🔹 limpiar formulario
    document.getElementById("name").value = "";
    document.getElementById("tag").value = "";
    document.getElementById("image").value = "";

    modal.classList.add("hidden");

    loadPlayers();

  } catch (err) {
    console.error(err);
    alert("Error en el registro");
  }
};

// 🔹 Render card
function createCard(p, ranked) {
  let winrate = 0;
  let lp = 0;

  if (ranked) {
    winrate = Math.round((ranked.wins / (ranked.wins + ranked.losses)) * 100);
    lp = ranked.leaguePoints || 0;
  }

  // Definir ruta de imagen de rango
  let rankImage = ranked 
    ? `img/elo/${ranked.tier.toUpperCase()}${ranked.rank.toUpperCase()}.png`
    : "img/elo/unranked.png";

  // Link OP.GG (EUW como ejemplo, cambia según región)
  const opggLink = `https://www.op.gg/summoners/euw/${encodeURIComponent(p.name)}-${encodeURIComponent(p.tag)}`;

  return `
    <div class="bg-gray-800 rounded-xl p-4 shadow-lg w-full flex flex-col gap-2">
      
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <img src="${p.image_url}" class="w-16 h-16 rounded-lg">

          <div>
            <h3 class="text-lg font-bold">${p.name}#${p.tag.toUpperCase()}</h3>

            <div class="flex items-center gap-2">
              <p class="text-sm text-gray-300">${ranked?.tier || "Unranked"} ${ranked?.rank || ""}</p>
              <img src="${rankImage}" class="w-6 h-6">
            </div>

            <p class="text-sm text-gray-400">LP: ${lp}</p>
          </div>
        </div>

        <div class="flex gap-2">
          ${ranked?.hotStreak ? '<span class="text-red-400">🔥</span>' : ''}
          ${ranked?.freshBlood ? '<span class="text-green-400">🆕</span>' : ''}
        </div>
      </div>

      <div class="flex justify-between items-center mt-2">
        <p class="text-sm text-gray-300">Wins: ${ranked?.wins || 0} | Losses: ${ranked?.losses || 0} | Winrate: ${winrate}%</p>
        <a href="${opggLink}" target="_blank" class="text-blue-400 text-sm hover:underline">OP.GG</a>
      </div>

    </div>
  `;
}

// 🔹 Cargar jugadores
async function loadPlayers() {
  const apiKey = await getApiKey();

  const res = await fetch(`${SUPABASE_URL}/rest/v1/Usuarios`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`
    }
  });

  const players = await res.json();
  const container = document.getElementById("players");

  container.innerHTML = "<p>Cargando...</p>";

  let playersWithRank = [];

  for (let p of players) {
    const rankRes = await fetch(
      `${RIOT_PLAYERS}/lol/league/v4/entries/by-puuid/${p.puuid}`,
      {
        headers: { "X-Riot-Token": apiKey }
      }
    );

    const rankData = await rankRes.json();
    const ranked = rankData[0];

    const elo = calculateElo(ranked);

    playersWithRank.push({
      player: p,
      ranked,
      elo
    });
  }

  // 🔥 ORDENAR POR ELO DESC
  playersWithRank.sort((a, b) => b.elo - a.elo);

  // 🔹 render
  let html = "";

  for (let item of playersWithRank) {
    html += createCard(item.player, item.ranked);
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

loadPlayers();