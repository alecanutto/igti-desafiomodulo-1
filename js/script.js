const MINIMUM_ALLOWED_INPUT_SIZE = 1;
const enableButtonClass = 'bg-green-600';

let allUsers = [];
let filteredUsers = [];

const form = document.querySelector('form');

const inputSearch = document.querySelector('#inputSearch');
const buttonSearch = document.querySelector('#btnSearch');

const usersResult = document.querySelector('#users-result');
const statisticsResult = document.querySelector('#statistics-result');

const usersTitle = document.querySelector('#users-title');
const statisticsTitle = document.querySelector('#statistics-title');

async function start() {
  await fetchUsers();

  enableControls();
  enableEvents();

  render();
}

async function fetchUsers() {
  const resource = await fetch('http://localhost:3001/users');
  const json = await resource.json();

  allUsers = json.map(({ login, name, gender, picture, dob }) => {
    const fullName = `${name.first} ${name.last}`;
    const searchName = fullName.toLocaleLowerCase();
    return {
      id: login.uuid,
      name: fullName,
      searchName,
      age: dob.age,
      gender,
      picture: picture.thumbnail,
    }
  });
}

function enableControls() {
  inputSearch.disabled = false;
  inputSearch.focus();
}

function enableEvents() {
  inputSearch.addEventListener('input', ({ target }) => {
    const shouldEnable = target.value.length >= MINIMUM_ALLOWED_INPUT_SIZE;
    buttonSearch.disabled = !shouldEnable;
    shouldEnable ? buttonSearch.classList.add(enableButtonClass) : buttonSearch.classList.remove(enableButtonClass);
  });

  form.addEventListener('submit', evt => {
    evt.preventDefault();
    doFilterUsers(inputSearch.value);
  });
}

function doFilterUsers(searchTerm) {
  const lowerCaseSearchTerm = searchTerm.toLocaleLowerCase();
  filteredUsers = allUsers.filter(user =>
    user.searchName.includes(lowerCaseSearchTerm)).sort((a, b) => a.name.localeCompare(b.name));
  render();
}

function render() {
  if (filteredUsers.length === 0) {
    usersTitle.textContent = 'Nenhum usuário filtrado';
    statisticsTitle.textContent = 'Nada a ser exibido';
    return;
  }
  renderUsers();
  renderStatistics();
}

function renderUsers() {
  usersTitle.textContent = `${filteredUsers.length} usuário(s) encontrado(s)`;

  const content = document.createElement('div');
  content.innerHTML = `<ul>
  ${filteredUsers.map(user => {
    return `
    <li class='flex flex-row items-center mb-2 space-x-4'>
    <img class='rounded-full' src='${user.picture}' alt=${user.name} title=${user.name}>
    <span>${user.name}, ${user.age} anos</span>
    </li>`;
  }).join('')}
  </ul>`;

  usersResult.appendChild(content);
}

function renderStatistics() {
  statisticsTitle.textContent = 'Estatísticas';

  const countMale = filteredUsers.filter(({ gender }) => gender === 'male').length;
  const countFemale = filteredUsers.filter(({ gender }) => gender === 'female').length;
  const totalAges = filteredUsers.reduce((accum, { age }) => accum + age, 0);
  const ageAvg = (totalAges / filteredUsers.length).toFixed(2).replace(".", ",");

  const statisticsHTML = `
  <ul>
    <li>Sexo masculino: <strong>${countMale}</strong></li>
    <li>Sexo feminino: <strong>${countFemale}</strong></li>
    <li>Soma das idades: <strong>${totalAges}</strong></li>
    <li>Média das idades: <strong>${ageAvg}</strong></li>
  </ul>`;

  const statisticsElement = document.createElement('div');
  statisticsElement.innerHTML = statisticsHTML;
  statisticsResult.appendChild(statisticsElement);
}

start();