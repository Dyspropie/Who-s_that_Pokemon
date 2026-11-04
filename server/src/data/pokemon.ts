import { Difficulty, PokemonData } from '../types.js';

// Cache for fetched Pokémon so we only hit PokeAPI once per pokemon
const pokemonCache = new Map<number, PokemonData>();

// Fallback seed Pokémon for instant offline resilience
const SEED_POKEMON: Record<number, Partial<PokemonData>> = {
  25: { name: 'pikachu', displayName: 'Pikachu', types: ['electric'], height: 4, weight: 60, generation: 1 },
  6: { name: 'charizard', displayName: 'Charizard', types: ['fire', 'flying'], height: 17, weight: 905, generation: 1 },
  94: { name: 'gengar', displayName: 'Gengar', types: ['ghost', 'poison'], height: 15, weight: 405, generation: 1 },
  133: { name: 'eevee', displayName: 'Eevee', types: ['normal'], height: 3, weight: 65, generation: 1 },
  150: { name: 'mewtwo', displayName: 'Mewtwo', types: ['psychic'], height: 20, weight: 1220, generation: 1 },
  143: { name: 'snorlax', displayName: 'Snorlax', types: ['normal'], height: 21, weight: 4600, generation: 1 },
  1: { name: 'bulbasaur', displayName: 'Bulbasaur', types: ['grass', 'poison'], height: 7, weight: 69, generation: 1 },
  4: { name: 'charmander', displayName: 'Charmander', types: ['fire'], height: 6, weight: 85, generation: 1 },
  7: { name: 'squirtle', displayName: 'Squirtle', types: ['water'], height: 5, weight: 90, generation: 1 },
  39: { name: 'jigglypuff', displayName: 'Jigglypuff', types: ['normal', 'fairy'], height: 5, weight: 55, generation: 1 },
  149: { name: 'dragonite', displayName: 'Dragonite', types: ['dragon', 'flying'], height: 22, weight: 2100, generation: 1 },
  197: { name: 'umbreon', displayName: 'Umbreon', types: ['dark'], height: 10, weight: 270, generation: 2 },
  249: { name: 'lugia', displayName: 'Lugia', types: ['psychic', 'flying'], height: 52, weight: 2160, generation: 2 },
  250: { name: 'ho-oh', displayName: 'Ho-Oh', types: ['fire', 'flying'], height: 38, weight: 1990, generation: 2 },
  448: { name: 'lucario', displayName: 'Lucario', types: ['fighting', 'steel'], height: 12, weight: 540, generation: 4 },
  445: { name: 'garchomp', displayName: 'Garchomp', types: ['dragon', 'ground'], height: 19, weight: 950, generation: 4 },
  658: { name: 'greninja', displayName: 'Greninja', types: ['water', 'dark'], height: 15, weight: 400, generation: 6 },
  384: { name: 'rayquaza', displayName: 'Rayquaza', types: ['dragon', 'flying'], height: 70, weight: 2065, generation: 3 }
};

export function getGeneration(id: number): number {
  if (id <= 151) return 1;
  if (id <= 251) return 2;
  if (id <= 386) return 3;
  if (id <= 493) return 4;
  if (id <= 649) return 5;
  if (id <= 721) return 6;
  if (id <= 809) return 7;
  if (id <= 905) return 8;
  return 9;
}

export function getMaxIdForDifficulty(difficulty: Difficulty): number {
  switch (difficulty) {
    case 'easy':
      return 151; // Gen 1 Kanto
    case 'medium':
      return 251; // Gen 1-2 Johto
    case 'hard':
      return 493; // Gen 1-4 Sinnoh
    case 'all':
    default:
      return 1025; // All Gens through Paldea
  }
}

export async function fetchPokemon(id: number): Promise<PokemonData | null> {
  if (pokemonCache.has(id)) {
    return pokemonCache.get(id)!;
  }

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data: any = await res.json();

    const name = data.name.toLowerCase();
    const displayName = data.name
      .split('-')
      .map((part: string) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const types = data.types.map((t: any) => t.type.name);
    const sprite = data.sprites?.front_default || 
      `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
    
    // Official artwork is gorgeous and sharp
    const artwork = data.sprites?.other?.['official-artwork']?.front_default || sprite;
    
    // PokeAPI latest cry audio
    const cryUrl = `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`;

    const pokemon: PokemonData = {
      id,
      name,
      displayName,
      types,
      height: data.height,
      weight: data.weight,
      sprite,
      artwork,
      cryUrl,
      generation: getGeneration(id)
    };

    pokemonCache.set(id, pokemon);
    return pokemon;
  } catch (err) {
    console.warn(`Failed to fetch Pokemon #${id} from PokéAPI, checking fallback seed...`, err);

    // Fallback if network issue
    const seed = SEED_POKEMON[id] || {
      name: `pokemon-${id}`,
      displayName: `Pokémon #${id}`,
      types: ['normal'],
      height: 10,
      weight: 100,
      generation: getGeneration(id)
    };

    const fallback: PokemonData = {
      id,
      name: seed.name || `pokemon-${id}`,
      displayName: seed.displayName || `Pokémon #${id}`,
      types: seed.types || ['normal'],
      height: seed.height || 10,
      weight: seed.weight || 100,
      sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`,
      artwork: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      cryUrl: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`,
      generation: seed.generation || getGeneration(id)
    };

    pokemonCache.set(id, fallback);
    return fallback;
  }
}

export async function getRandomPokemon(difficulty: Difficulty): Promise<PokemonData> {
  const maxId = getMaxIdForDifficulty(difficulty);
  const randomId = Math.floor(Math.random() * maxId) + 1;
  const pokemon = await fetchPokemon(randomId);
  if (!pokemon) {
    // Return guaranteed Pikachu if something catastrophic occurs
    return (await fetchPokemon(25))!;
  }
  return pokemon;
}
