$(document).ready(function () {
  // API URL
  const apiUrl = "https://pokeapi.co/api/v2/pokemon/";

  // Function to fetch Pokémon data
  function fetchPokemon() {
    for (let i = 1; i <= 200; i++) {
      $.getJSON(apiUrl + i, function (data) {
        // Capitalize the first letter of Pokémon name
        data.name = capitalizeFirstLetter(data.name);
        displayPokemon(data);
      });
    }
  }

  // Function to display Pokémon
  function displayPokemon(pokemon) {
    const pokemonCard = `
      <div class="col-md-3 mb-4">
        <div class="card" onclick="showPokemonModal(${pokemon.id})"> <!-- Add onclick event -->
          <img src="${pokemon.sprites.other["official-artwork"].front_default}" class="card-img-top" alt="${pokemon.name}">
          <div class="card-body">
            <h5 class="card-header text-center">${pokemon.name}</h5>
            <p class="card-text text-left">#${pokemon.id}</p>
          </div>
        </div>
      </div>
    `;
    $("#pokemonGrid").append(pokemonCard);
  }

  // Function to capitalize the first letter of a string
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Function to show modal with Pokémon details
  window.showPokemonModal = function (pokemonId) {
    // Define globally
    $.getJSON(apiUrl + pokemonId, function (data) {
      // Set modal content
      $("#pokemonModalLabel").text(data.name);
      $("#modalPokemonImage").attr(
        "src",
        data.sprites.other["official-artwork"].front_default
      );
      $("#modalPokemonName").text(data.name);
      $("#modalPokemonNumber").text("#" + data.id);

      // Clear existing stat bars
      $("#modalPokemonStats").empty();

      // Function to map stat names to their abbreviated forms
      function getStatAbbreviation(statName) {
        switch (statName) {
          case "attack":
            return "ATK";
          case "defense":
            return "DEF";
          case "speed":
            return "SPD";
          case "special-attack":
            return "SP.ATK";
          case "special-defense":
            return "SP.DEF";
          default:
            return statName.toUpperCase(); // Default to uppercase if not matched
        }
      }

      // Display stats as progression bars
      data.stats.forEach((stat) => {
        const statBar = `
        <div class="progress mb-3">
          <div class="progress-bar" role="progressbar" style="width: ${
            stat.base_stat
          }%" aria-valuenow="${
          stat.base_stat
        }" aria-valuemin="0" aria-valuemax="100">
            ${getStatAbbreviation(stat.stat.name)}: ${
          stat.base_stat
        } <!-- Display abbreviated stat name and value -->
          </div>
        </div>
      `;
        $("#modalPokemonStats").append(statBar);
      });

      // Clear existing types
      $("#modalPokemonTypes").empty();

      // Display types with their logos
      data.types.forEach((type) => {
        const typeName = capitalizeFirstLetter(type.type.name);
        const typeLogo = `https://pokeapi.co/api/v2/type/${type.type.name}/`;

        // Create type badge with logo
        const typeBadge = `
        <div class="col-md-3">
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/types/${type.type.name}.png" alt="${typeName}" class="img-fluid">
          <p class="text-center">${typeName}</p>
        </div>
      `;
        $("#modalPokemonTypes").append(typeBadge);
      });

      // Clear existing abilities
      $("#modalPokemonAbilities").empty();

      // Display abilities with their flavor text
      data.moves.forEach((move) => {
        const moveName = capitalizeFirstLetter(move.move.name);

        // Fetch move details from the API
        console.log(`Fetching details for move: ${moveName}`);
        $.getJSON(move.move.url, function (moveData) {
          console.log(`Move data for ${moveName}:`, moveData); // Log move data for inspection

          // Check if moveData is defined
          if (moveData) {
            const flavorTextEntries = moveData.flavor_text_entries;
            // Find the first English flavor text
            const flavorTextEntry = flavorTextEntries.find(
              (entry) => entry.language.name === "en"
            );
            const flavorText = flavorTextEntry
              ? flavorTextEntry.flavor_text
              : "No flavor text available";

            // Display move with flavor text
            const moveItem = `<p>${moveName}: ${flavorText}</p>`;
            $("#modalPokemonAbilities").append(moveItem);
          } else {
            console.error(
              `Failed to fetch move details for ${moveName}: Move data is undefined.`
            );
          }
        }).fail(function (jqXHR, textStatus, errorThrown) {
          console.error(
            `Failed to fetch move details for ${moveName}: ${textStatus}, ${errorThrown}`
          );
        });
      });

      // Show modal
      $("#pokemonModal").modal("show");
    });
  };

  // Initial fetch
  fetchPokemon();
});
