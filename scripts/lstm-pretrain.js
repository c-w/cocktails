const fs = require('fs');
const child_process = require('child_process');

const outfile = process.argv.length === 3 ? process.argv[2] : null;
if (!outfile) {
  console.error(`Usage: ${process.argv[0]} ${process.argv[1]} <outfile>`)
  process.exit(1);
}

if (!fs.existsSync('./recipes.json')) {
  child_process.execFileSync('wget', ['-q', 'https://raw.githubusercontent.com/c-w/cocktails/master/recipes.json'])
}

if (!fs.existsSync('./words.json')) {
  child_process.execFileSync('wget', ['-q', 'https://raw.githubusercontent.com/c-w/cocktails/master/words.json'])
}

const recipes = JSON.parse(fs.readFileSync('./recipes.json', 'utf-8'));
const words = JSON.parse(fs.readFileSync('./words.json', 'utf-8'));

const brands = new RegExp(`(${words.brands.join('|')})[a-z0-9&' ]* (${words.spirits.join('|')})`, 'gi');

const data = recipes
  .filter(recipe =>
    recipe.Ingredients.toLowerCase().indexOf('choya plum wine') === -1 &&
    recipe.Ingredients.toLowerCase().indexOf('canada dry ginger ale') === -1)
  .map(recipe => {
    const ingredients = recipe.Ingredients
        .toLowerCase()
        .replace(/anise liqueur/gi, 'absinthe')
        .replace(/home-made /gi, '')
        .replace(brands, '$2')
        .replace(/(oz|barsp) [a-z -]* syrup[^\n]*/gi, '$1 syrup')
        .split('\n')
        .map(line =>
          line.replace(/(build|stir|shake).*$/gi, '$1'))
        .filter(line =>
          line.indexOf('glass-age') === -1 &&
          line.indexOf('(garnish)') === -1 &&
          line.indexOf(' rind') === -1 &&
          line.indexOf(' peel') === -1 &&
          line.indexOf(' twist') === -1);
    return `>${recipe.Name}<${ingredients.join(';')}`
  })
  .map(recipe => recipe
    .replace(/ & /g, ' ')
    .replace(/['!#,&]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/ \([^)]*\)/g, ''));

fs.writeFileSync(outfile, data.join('\n').toLowerCase(), { encoding: 'utf-8' });
