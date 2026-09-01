// Exercise 1 : Find the numbers divisible by 23
function displayNumbersDivisible(divisor = 23) {
  let sum = 0;
  const divisibleNumbers = [];

  for (let i = 0; i <= 500; i++) {
    if (i % divisor === 0) {
      divisibleNumbers.push(i);
      sum += i;
    }
  }

  console.log(divisibleNumbers.join(" "));
  console.log("Sum :", sum);

  return { numbers: divisibleNumbers, sum };
}

displayNumbersDivisible();
displayNumbersDivisible(3);
displayNumbersDivisible(45);

// Exercise 2 : Shopping List
const stock = {
  banana: 6,
  apple: 0,
  pear: 12,
  orange: 32,
  blueberry: 1,
};

const prices = {
  banana: 4,
  apple: 2,
  pear: 1,
  orange: 1.5,
  blueberry: 10,
};

const shoppingList = ["banana", "orange", "apple"];

function myBill() {
  let total = 0;

  for (const item of shoppingList) {
    if (item in stock && stock[item] > 0 && item in prices) {
      total += prices[item];
      stock[item] -= 1;
    }
  }

  return total;
}

console.log("My bill:", myBill());
console.log("Updated stock:", stock);

// Exercise 3 : What's in my wallet ?
function changeEnough(itemPrice, amountOfChange) {
  const coinValues = [0.25, 0.1, 0.05, 0.01];
  const total = amountOfChange.reduce((sum, count, index) => {
    return sum + count * coinValues[index];
  }, 0);

  return total >= itemPrice;
}

console.log(changeEnough(4.25, [25, 20, 5, 0]));
console.log(changeEnough(14.11, [2, 100, 0, 0]));
console.log(changeEnough(0.75, [0, 0, 20, 5]));

// Exercise 4 : Vacation Costs
function hotelCost() {
  let nights;

  while (true) {
    nights = Number(prompt("How many nights would you like to stay in the hotel?"));
    if (Number.isFinite(nights) && nights > 0) {
      break;
    }
    alert("Please enter a valid number of nights.");
  }

  return nights * 140;
}

function planeRideCost() {
  let destination;

  while (true) {
    destination = prompt("What is your destination?");
    if (typeof destination === "string" && destination.trim() !== "") {
      break;
    }
    alert("Please enter a valid destination.");
  }

  const destinationLower = destination.trim().toLowerCase();

  if (destinationLower === "london") {
    return 183;
  }
  if (destinationLower === "paris") {
    return 220;
  }
  return 300;
}

function rentalCarCost() {
  let days;

  while (true) {
    days = Number(prompt("How many days would you like to rent the car?"));
    if (Number.isFinite(days) && days > 0) {
      break;
    }
    alert("Please enter a valid number of days.");
  }

  const costPerDay = 40;
  const total = days * costPerDay;

  if (days > 10) {
    return total * 0.95;
  }

  return total;
}

function totalVacationCost() {
  const hotel = hotelCost();
  const plane = planeRideCost();
  const car = rentalCarCost();
  const total = hotel + plane + car;

  console.log(`The car cost: $${car}, the hotel cost: $${hotel}, the plane tickets cost: $${plane}.`);
  console.log(`Total vacation cost: $${total}`);

  return total;
}

totalVacationCost();

// Exercise 5 : Users
const myName = "YourName";

document.addEventListener("DOMContentLoaded", () => {
  const container = document.getElementById("container");
  if (container) {
    console.log(container);
    container.style.backgroundColor = "lightblue";
    container.style.padding = "10px";
  }

  const listItems = document.querySelectorAll(".list li");
  const firstList = document.querySelectorAll(".list")[0];
  const secondList = document.querySelectorAll(".list")[1];

  if (firstList) {
    const pete = firstList.querySelectorAll("li")[1];
    if (pete) pete.textContent = "Richard";
  }

  if (secondList) {
    const secondLi = secondList.querySelectorAll("li")[1];
    if (secondLi) secondList.removeChild(secondLi);
  }

  const lists = document.querySelectorAll(".list");
  lists.forEach((list) => {
    const firstLi = list.querySelector("li");
    if (firstLi) {
      firstLi.textContent = myName;
    }
    list.classList.add("student_list");
  });

  if (firstList) {
    firstList.classList.add("university", "attendance");
  }

  const richardLi = Array.from(document.querySelectorAll("li")).find(
    (li) => li.textContent.trim() === "Richard"
  );
  if (richardLi) {
    richardLi.style.border = "2px solid black";
  }

  const danLi = Array.from(document.querySelectorAll("li")).find(
    (li) => li.textContent.trim() === "Dan"
  );
  if (danLi) {
    danLi.style.display = "none";
  }

  document.body.style.fontSize = "18px";

  const userList = Array.from(document.querySelectorAll("li"))
    .map((li) => li.textContent.trim())
    .filter(Boolean);

  if (
    container &&
    getComputedStyle(container).backgroundColor === "rgb(173, 216, 230)" &&
    userList.length >= 2
  ) {
    alert(`Hello ${userList[0]} and ${userList[1]}`);
  }
});

// Exercise 6 : Change the navbar

document.addEventListener("DOMContentLoaded", () => {
  const navBar = document.getElementById("navBar");

  if (navBar) {
    navBar.setAttribute("id", "socialNetworkNavigation");

    const list = navBar.querySelector("ul");
    const newItem = document.createElement("li");
    const textNode = document.createTextNode("Logout");

    newItem.appendChild(textNode);
    list.appendChild(newItem);

    const firstLink = list.firstElementChild?.textContent.trim();
    const lastLink = list.lastElementChild?.textContent.trim();

    console.log("First link:", firstLink);
    console.log("Last link:", lastLink);
  }
});

// Exercise 7 : My Book List
const allBooks = [
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=300&q=80",
    alreadyRead: true,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=300&q=80",
    alreadyRead: false,
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const section = document.querySelector(".listBooks");

  if (!section) return;

  allBooks.forEach((book) => {
    const bookDiv = document.createElement("div");
    bookDiv.style.marginBottom = "10px";

    const title = document.createElement("p");
    title.textContent = `${book.title} written by ${book.author}`;
    title.style.color = book.alreadyRead ? "red" : "black";

    const image = document.createElement("img");
    image.src = book.image;
    image.width = 100;
    image.alt = `${book.title} cover`;

    bookDiv.appendChild(title);
    bookDiv.appendChild(image);
    section.appendChild(bookDiv);
  });
});
