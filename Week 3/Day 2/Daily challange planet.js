const planets = [
  { name: 'Mercury', colorClass: 'mercury', moons: 0 },
  { name: 'Venus', colorClass: 'venus', moons: 0 },
  { name: 'Earth', colorClass: 'earth', moons: 1 },
  { name: 'Mars', colorClass: 'mars', moons: 2 },
  { name: 'Jupiter', colorClass: 'jupiter', moons: 4 },
  { name: 'Saturn', colorClass: 'saturn', moons: 3 },
  { name: 'Uranus', colorClass: 'uranus', moons: 2 },
  { name: 'Neptune', colorClass: 'neptune', moons: 1 }
];

const planetColors = {
  mercury: '#b5b5b5',
  venus: '#d9c58a',
  earth: '#3a82f7',
  mars: '#d95d39',
  jupiter: '#d2a679',
  saturn: '#d7c38d',
  uranus: '#7bdff2',
  neptune: '#3f5efb'
};

const section = document.querySelector('.listPlanets');

if (section) {
  planets.forEach((planet, index) => {
    const planetDiv = document.createElement('div');
    planetDiv.classList.add('planet', planet.colorClass);
    planetDiv.style.backgroundColor = planetColors[planet.colorClass];
    planetDiv.style.margin = '20px';
    planetDiv.style.display = 'inline-block';
    planetDiv.textContent = planet.name;
    planetDiv.style.color = 'white';
    planetDiv.style.lineHeight = '100px';

    for (let i = 0; i < planet.moons; i++) {
      const moon = document.createElement('div');
      moon.classList.add('moon');

      const angle = (Math.PI * 2 * i) / Math.max(planet.moons, 1);
      const radius = 40 + i * 18;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      moon.style.left = `${50 + x}px`;
      moon.style.top = `${50 + y}px`;
      planetDiv.appendChild(moon);
    }

    section.appendChild(planetDiv);
  });
}
