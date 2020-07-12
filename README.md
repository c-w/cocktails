## What's this?

This blog is a space for me to collect tasty cocktail recipes that I've prepared
and make them easily searchable for the future.

The frontend for the blog is hosted on [gh-pages](https://justamouse.com/cocktails/).
It's built using ReactJS and SemanticUI and pulls data from this repository.

## Recipes schema

```json
[
  {
    "Rating": "integer",
    "Name": "string",
    "Ingredients": "string"
  }
]
```

## Generating new recipes

Install Torch and LSTM:

```sh
git clone https://github.com/nagadomi/distro.git ~/torch --recursive
cd ~/torch
./install-deps
./clean.sh
./update.sh
cd -
. ~/torch/install/bin/torch-activate
git clone https://github.com/karpathy/char-rnn.git ~/char-rnn
```

Prepare training data and train model:

```sh
node ./scripts/lstm-pretrain.js ~/char-rnn/data/tinyshakespeare/input.txt
cd ~/char-rnn
th ./train.lua -batch_size 10 -rnn_size 128 -val_frac 0.05 -train_frac 0.9 -max_epochs 50 -eval_val_every 500 -dropout 0.45 | tee ./train.txt
```

Sample from best model:

```sh
best_validation_score="$(find ./cv -name '*.t7' -exec basename {} .t7 \; | cut -d'_' -f4 | sort -n | head -n1)"
best_model="$(find ./cv -name "*${best_validation_score}.t7")"
th ./sample.lua -primetext '>' "${best_model}" -length 5000 -verbose 0 | tee ./sample.txt
cd -
clear
node ./scripts/lstm-postsample.js ~/char-rnn/sample.txt | tee ./lstm-recipes.json
```
