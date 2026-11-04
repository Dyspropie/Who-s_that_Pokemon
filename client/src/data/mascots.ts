export interface Mascot {
  id: string;
  pokemonId: number;
  name: string;
  type: string;
  color: string;
  spriteUrl: string;
}

export const MASCOTS: Mascot[] = [
  {
    id: 'pikachu',
    pokemonId: 25,
    name: 'Pikachu',
    type: 'Electric',
    color: 'from-amber-400 to-yellow-500 border-amber-400',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png'
  },
  {
    id: 'charmander',
    pokemonId: 4,
    name: 'Charmander',
    type: 'Fire',
    color: 'from-orange-500 to-red-600 border-orange-500',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png'
  },
  {
    id: 'squirtle',
    pokemonId: 7,
    name: 'Squirtle',
    type: 'Water',
    color: 'from-sky-400 to-blue-600 border-sky-400',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/7.png'
  },
  {
    id: 'bulbasaur',
    pokemonId: 1,
    name: 'Bulbasaur',
    type: 'Grass',
    color: 'from-emerald-400 to-teal-600 border-emerald-400',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png'
  },
  {
    id: 'eevee',
    pokemonId: 133,
    name: 'Eevee',
    type: 'Normal',
    color: 'from-amber-600 to-stone-700 border-amber-500',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/133.png'
  },
  {
    id: 'gengar',
    pokemonId: 94,
    name: 'Gengar',
    type: 'Ghost',
    color: 'from-purple-600 to-indigo-800 border-purple-500',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/94.png'
  },
  {
    id: 'snorlax',
    pokemonId: 143,
    name: 'Snorlax',
    type: 'Normal',
    color: 'from-teal-600 to-slate-800 border-teal-500',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/143.png'
  },
  {
    id: 'lucario',
    pokemonId: 448,
    name: 'Lucario',
    type: 'Fighting',
    color: 'from-blue-600 to-slate-800 border-blue-400',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/448.png'
  },
  {
    id: 'mewtwo',
    pokemonId: 150,
    name: 'Mewtwo',
    type: 'Psychic',
    color: 'from-purple-500 to-pink-700 border-pink-400',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/150.png'
  }
];

export function getMascot(id: string): Mascot {
  return MASCOTS.find((m) => m.id === id) || MASCOTS[0];
}
