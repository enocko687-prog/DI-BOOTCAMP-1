const { faker } = require('@faker-js/faker');

const users = [];

function addUser() {
  const user = {
    name: faker.person.fullName(),
    address: {
      street: faker.location.streetAddress(),
      country: faker.location.country()
    }
  };
  users.push(user);
  return user;
}

for (let i = 0; i < 3; i++) {
  addUser();
}

console.log(users);
