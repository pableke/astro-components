
export const getCharacters = async () => {
    const res = await fetch("https://rickandmortyapi.com/api/character");
    const data = await res.json();
    return data.results;
}

export const getCharacterById = async (id) => {
    const res = await fetch("https://rickandmortyapi.com/api/character/" + id);
    return await res.json();
}
