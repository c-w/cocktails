const fs = require('fs');

const infile = process.argv.length === 3 ? process.argv[2] : null;
if (!infile || !fs.existsSync(infile)) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <infile>`)
  process.exit(1);
}

const recipes = [];

fs.readFileSync(infile, 'utf-8')
  .split('\n')
  .forEach(line => {
    const match = line.match(/^>([^<]+)<(.*);(stir|shake|build)$/);
    if (match) {
      recipes.push({
        Name: match[1],
        Ingredients: `${match[2]}\n${match[3]}`.replace(/;/g, '\n'),
      });
    }
  });

console.log(JSON.stringify(recipes, null, 2));
