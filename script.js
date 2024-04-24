$(document).ready(function () {
  // API URLs
  const apiUrl = "https://pokeapi.co/api/v2/pokemon/";
  const locationUrl = "https://pokeapi.co/api/v2/pokemon/";

  // Function to fetch Pokémon data
  function fetchPokemon(pokemonId) {
    const maxPokemonId = 1025; // Set the maximum Pokémon ID to fetch (adjust as needed)

    // Recursive function to fetch Pokémon data
    function fetchNextPokemon(pokemonId) {
      if (pokemonId > maxPokemonId) {
        console.log("Reached the maximum Pokémon ID:", maxPokemonId);
        return; // Stop fetching when we reach the maximum ID
      }

      $.getJSON(apiUrl + pokemonId, function (data) {
        // Capitalize the first letter of Pokémon name
        data.name = capitalizeFirstLetter(data.name);
        displayPokemon(data);

        // Fetch next Pokémon
        const nextPokemonId = pokemonId + 1;
        fetchNextPokemon(nextPokemonId);
      }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error(
          `Failed to fetch Pokémon with ID ${pokemonId}: ${textStatus}, ${errorThrown}`
        );

        // If fetching fails, try fetching the next Pokémon
        const nextPokemonId = pokemonId + 1;
        fetchNextPokemon(nextPokemonId);
      });
    }

    // Start fetching Pokémon from the specified ID
    fetchNextPokemon(pokemonId);
  }

  // Function to fetch Pokémon location areas
  function fetchPokemonLocations(pokemonId) {
    const url = `${locationUrl}${pokemonId}/encounters`;

    $.getJSON(url, function (data) {
      displayPokemonLocations(data);
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error(
        `Failed to fetch Pokémon locations with ID ${pokemonId}: ${textStatus}, ${errorThrown}`
      );
    });
  }

  // Function to display Pokémon
  function displayPokemon(pokemon) {
    const pokemonCard = `
            <div class="col-md-3 mb-4">
                <div class="card" onclick="showPokemonModal(${pokemon.id})">
                    <img src="${pokemon.sprites.other["official-artwork"].front_default}" class="card-img-top" alt="${pokemon.name}" style="width: 50%; height: auto; display: block; margin: 0 auto;">
                    <div class="card-body" id="pokemonCard">
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
            return statName.toUpperCase();
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
        }
                        </div>
                    </div>
                `;
        $("#modalPokemonStats").append(statBar);
      });

      // Clear existing moves
      $("#modalPokemonAbilities").empty();

      // Display moves learned at level 1
      const moveNames = data.moves.reduce((acc, move) => {
        // Check if move is a base move (learned through level-up) and learned at level 1
        const isAtLevel1 = move.version_group_details.some(
          (detail) =>
            detail.move_learn_method.name === "level-up" &&
            detail.level_learned_at === 1
        );

        if (isAtLevel1) {
          const moveName = capitalizeFirstLetter(move.move.name);
          acc.push(moveName);
        }

        return acc;
      }, []);

      const movesLine = moveNames.join(", ");
      $("#modalPokemonAbilities").append(`<p>${movesLine}</p>`);

      // Clear existing types
      $("#modalPokemonTypes").empty();

      // Types images
      const typeImages = {
        normal: { image: "images/types/normal.png", name: "Normal" },
        fire: { image: "images/types/fire.png", name: "Fire" },
        water: { image: "images/types/water.png", name: "Water" },
        electric: { image: "images/types/electric.png", name: "Electric" },
        grass: { image: "images/types/grass.png", name: "Grass" },
        ice: { image: "images/types/ice.png", name: "Ice" },
        fighting: { image: "images/types/fighting.png", name: "Fighting" },
        poison: { image: "images/types/poison.png", name: "Poison" },
        ground: { image: "images/types/ground.png", name: "Ground" },
        flying: { image: "images/types/flying.png", name: "Flying" },
        psychic: { image: "images/types/psychic.png", name: "Psychic" },
        bug: { image: "images/types/bug.png", name: "Bug" },
        rock: { image: "images/types/rock.png", name: "Rock" },
        ghost: { image: "images/types/ghost.png", name: "Ghost" },
        dragon: { image: "images/types/dragon.png", name: "Dragon" },
        dark: { image: "images/types/dark.png", name: "Dark" },
        steel: { image: "images/types/steel.png", name: "Steel" },
        fairy: { image: "images/types/fairy.png", name: "Fairy" },
      };

      // Display Pokémon types
      data.types.forEach((type) => {
        const typeName = type.type.name;
        const typeData = typeImages[typeName];
        if (typeData) {
          const typeContainer = `
                        <div class="col-6 text-center">
                            <img src="${typeData.image}" alt="${typeName}" class="img-fluid mx-auto type-icon" />
                            <p class="mb-0">${typeData.name}</p>
                        </div>
                    `;
          $("#modalPokemonTypes").append(typeContainer);
        } else {
          console.error(`Type data not found for type: ${typeName}`);
        }
      });

      // Display height and weight
      const heightMeters = (data.height / 10).toFixed(1); // Convert height to meters
      const weightKg = (data.weight / 10).toFixed(1); // Convert weight to kilograms

      const heightWeightContainer = `
                <div class="row">
                    <div class="col border-right d-flex justify-content-center align-items-center">
                        <p class="mb-0">${heightMeters}m</p>
                    </div>
                    <div class="col d-flex justify-content-center align-items-center">
                        <p class="mb-0">${weightKg}kg</p>
                    </div>
                </div>
            `;
      $("#modalPokemonHeight").html(heightWeightContainer);

      // Display Pokémon description
      const speciesUrl = data.species.url;
      $.getJSON(speciesUrl, function (speciesData) {
        console.log("Species data:", speciesData);
        const descriptionEntry = speciesData.flavor_text_entries.find(
          (entry) => entry.language.name === "en"
        );
        console.log("Description entry:", descriptionEntry);
        let description = descriptionEntry
          ? descriptionEntry.flavor_text
          : "No description available";
        console.log("Description:", description);

        // Sanitize description
        description = description.replace(/[\n\f\v\r\t]/g, " "); // Remove newline and tab characters
        description = description.replace(/\s+/g, " "); // Remove multiple consecutive spaces
        description = description.replace(/POKéMON/g, "Pokémon"); // Correct Pokémon spelling

        const descriptionContainer = `
                    <div class="col-12 text-center">
                        <p><em>${description}</em></p>
                    </div>
                `;
        $("#modalPokemonDescription").html(descriptionContainer);
      }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error(
          `Failed to fetch species details: ${textStatus}, ${errorThrown}`
        );
      });

      // Fetch and display Pokémon location areas
      fetchPokemonLocations(pokemonId);

      // Fetch and display evolution chain
      fetchEvolutionChain(pokemonId);

      // Show modal
      $("#pokemonModal").modal("show");
    });
  };

  // Function to display Pokémon location areas
  function displayPokemonLocations(locations) {
    const locationList = locations.map(
      (location) => location.location_area.name
    );
    const locationHtml =
      locationList.length > 0
        ? `<ul>${locationList
            .map((location) => `<li>${location}</li>`)
            .join("")}</ul>`
        : "<p>No location data available</p>";
    $("#modalPokemonLocationAreas").html(locationHtml);
  }

  // Function to fetch and display evolution chain
  function fetchEvolutionChain(pokemonId) {
    const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonId}/`;

    console.log("Fetching Pokémon species data for ID:", pokemonId);

    $.getJSON(speciesUrl, function (speciesData) {
      console.log("Species Data:", speciesData);

      const evolutionChainUrl = speciesData.evolution_chain.url;
      console.log("Evolution Chain URL:", evolutionChainUrl);

      $.getJSON(evolutionChainUrl, function (chainData) {
        console.log("Evolution Chain Data:", chainData);
        displayEvolutionChain(chainData.chain);
      }).fail(function (jqXHR, textStatus, errorThrown) {
        console.error(
          `Failed to fetch evolution chain for Pokémon with ID ${pokemonId}: ${textStatus}, ${errorThrown}`
        );
      });
    }).fail(function (jqXHR, textStatus, errorThrown) {
      console.error(
        `Failed to fetch Pokémon species data for ID ${pokemonId}: ${textStatus}, ${errorThrown}`
      );
    });
  }

  // Function to display the evolution chain
  function displayEvolutionChain(chainData) {
    // Clear existing evolution chain
    $("#evolutionChainCardBody").empty();

    // Display each stage of the evolution chain
    displayEvolutionStage(chainData);
  }

  // Function to recursively display each stage of the evolution chain
  function displayEvolutionStage(stage) {
    const pokemon = stage.species;
    const pokemonUrlParts = pokemon.url.split("/");
    const pokemonId = pokemonUrlParts[pokemonUrlParts.length - 2];
    const pokemonName = capitalizeFirstLetter(pokemon.name);

    // Create HTML for the evolution stage
    const stageHtml = `
      <div class="col-md-3 mb-4">
        <div class="card" style="max-width: 250px;">
          <img src="${getOfficialArtworkUrl(
            pokemonId
          )}" class="card-img-top" alt="${
      pokemon.name
    }" style="width: 50%; height: auto; display: block; margin: 0 auto;">
          <div class="card-body">
            <h5 class="card-header text-center">${pokemonName}</h5>
            <p class="card-text text-left">#${pokemonId}</p>
          </div>
        </div>
      </div>
    `;

    // Append the stage HTML to the evolution chain card body
    $("#evolutionChainCardBody").append(stageHtml);

    // Check if there's a next evolution stage
    if (stage.evolves_to && stage.evolves_to.length > 0) {
      // Create a container to hold the next evolution stages and arrows in a single row
      const nextStagesContainer = $(
        '<div class="row justify-content-center align-items-center"></div>'
      );

      // Recursively display each evolution stage in the array
      stage.evolves_to.forEach((nextStage) => {
        // Add arrow icon between stages
        nextStagesContainer.append(
          '<div class="col-md-1 text-center align-self-center"><i class="fas fa-long-arrow-alt-right" style="font-size: 2em;"></i></div>'
        );

        displayEvolutionStage(nextStage); // Recursively display the next evolution stage
      });

      // Append the container for next evolution stages and arrows
      $("#evolutionChainCardBody").append(nextStagesContainer);
    }
  }

  // Function to get the official artwork URL from the species data
  function getOfficialArtworkUrl(pokemonId) {
    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`;
  }

  // Initial fetch
  fetchPokemon(1);
});
