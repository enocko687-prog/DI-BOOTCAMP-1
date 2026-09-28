const products = require('./products');

function findProductByName(productName) {
  return products.find(product => product.name.toLowerCase() === productName.toLowerCase());
}

const productNames = ['Laptop', 'Headphones', 'Mouse', 'Smartphone', 'Tablet'];

productNames.forEach(name => {
  const product = findProductByName(name);
  if (product) {
    console.log(`Found product: ${JSON.stringify(product, null, 2)}`);
  } else {
    console.log(`No product found for: ${name}`);
  }
});
