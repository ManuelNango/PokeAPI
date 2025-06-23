// app.js

import { fetchPokemonList, fetchPokemonDetails, preloadImages } from './api.js';
import {
    displayPokemons,
    setupPagination,
    openModal,
    typeIconClasses,
    typeColors,
    typeModalBackgrounds,
} from './ui.js';

const pokemonsPerPage = 40;
let currentPage = 1;
let totalPokemons = 0;
let totalPages = 0;
let pokemons = []; // Array de todos los Pokémones (nonbre y URL)
let filteredPokemons = []; // Array de filtrado de Pokémon
let isFiltered = false; // Indicates if we are showing filtered results

const searchInput = document.getElementById('searchInput');
const pokemonContainer = document.getElementById('pokemonContainer');
const paginationContainer = document.getElementById('paginationContainer');
const modeToggle = document.getElementById('modeToggle');
const root = document.documentElement;

// Iconos SVG como cadenas de texto
const darkModeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-cloud-moon-fill" viewBox="0 0 16 16">
    <path d="M11.473 11a4.5 4.5 0 0 0-8.72-.99A3 3 0 0 0 3 16h8.5a2.5 2.5 0 0 0 0-5z"/>
    <path d="M11.286 1.778a.5.5 0 0 0-.565-.755 4.595 4.595 0 0 0-3.18 5.003 5.5 5.5 0 0 1 1.055.209A3.6 3.6 0 0 1 9.83 2.617a4.593 4.593 0 0 0 4.31 5.744 3.58 3.58 0 0 1-2.241.634q.244.477.394 1a4.59 4.59 0 0 0 3.624-2.04.5.5 0 0 0-.565-.755 3.593 3.593 0 0 1-4.065-5.422z"/>
</svg>
`;

const lightModeIcon = `
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-sun-fill" viewBox="0 0 16 16">
    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8M8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0m0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13m8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5M3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8m10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0m-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0m9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707M4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708"/>
</svg>
`;

// Función para aplicar el tema según la preferencia
function applyTheme(theme) {
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        modeToggle.innerHTML = `Claro ` + lightModeIcon;
        modeToggle.classList.remove('btn-light');
        modeToggle.classList.add('btn-dark');
    } else {
        root.setAttribute('data-theme', 'light');
        modeToggle.innerHTML = `Oscuro ` + darkModeIcon;
        modeToggle.classList.remove('btn-dark');
        modeToggle.classList.add('btn-light');
    }
    localStorage.setItem('theme', theme); // Guarda la preferencia en localStorage
}

// Detecta el tema preferido del usuario
function detectPreferredTheme() {
    const savedTheme = localStorage.getItem('theme'); // Revisa si hay un tema guardado
    if (savedTheme) {
        return savedTheme; // Usa el tema guardado
    }
    // Detecta el tema del sistema si no hay guardado
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
}

// Aplica el tema detectado al cargar la página
applyTheme(detectPreferredTheme());

// Event listener para el botón de toggle
modeToggle.addEventListener('click', () => {
    const currentTheme = root.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
});

// Function to fetch and display the Pokémon list
async function fetchAndDisplayPokemonList() {
    try {
        pokemons = await fetchPokemonList();
        totalPokemons = pokemons.length;
        totalPages = Math.ceil(totalPokemons / pokemonsPerPage);
        displayPage(currentPage);
        setupPaginationControls();
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Function to display the Pokémon on the current page
function displayPage(page) {
    currentPage = page;
    const startIndex = (page - 1) * pokemonsPerPage;
    const endIndex = startIndex + pokemonsPerPage;
    const pokemonsToDisplay = isFiltered
        ? filteredPokemons.slice(startIndex, endIndex)
        : pokemons.slice(startIndex, endIndex);

    fetchPokemonDetails(pokemonsToDisplay)
        .then(pokemonDetails => {
            displayPokemons(pokemonDetails, pokemonContainer, openModal);

            // Pre-cargar imágenes de la siguiente página
            const nextStartIndex = endIndex;
            const nextEndIndex = nextStartIndex + pokemonsPerPage;
            const pokemonsToPreload = isFiltered
                ? filteredPokemons.slice(nextStartIndex, nextEndIndex)
                : pokemons.slice(nextStartIndex, nextEndIndex);

            if (pokemonsToPreload.length > 0) {
                fetchPokemonDetails(pokemonsToPreload)
                    .then(preloadPokemonDetails => {
                        preloadImages(preloadPokemonDetails);
                    })
                    .catch(error => {
                        console.error('Error pre-cargando imágenes:', error.message);
                    });
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
}

// Function to set up pagination controls
function setupPaginationControls() {
    setupPagination(paginationContainer, currentPage, totalPages, (page) => {
        displayPage(page);
        setupPaginationControls();
    });
}

// Event listener for search input
searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm === '') {
        isFiltered = false;
        totalPages = Math.ceil(totalPokemons / pokemonsPerPage);
        currentPage = 1;
        displayPage(currentPage);
        setupPaginationControls();
    } else {
        isFiltered = true;
        filteredPokemons = pokemons.filter(pokemon =>
            pokemon.name.toLowerCase().includes(searchTerm)
        );
        const totalFilteredPokemons = filteredPokemons.length;
        totalPages = Math.ceil(totalFilteredPokemons / pokemonsPerPage);
        currentPage = 1;
        displayPage(currentPage);
        setupPaginationControls();
    }
});

// Start the application
fetchAndDisplayPokemonList();