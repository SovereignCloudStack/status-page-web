#!/bin/bash
if ! command -v mustache &> /dev/null
then
    echo "this script needs an install of the mustache template system"
    exit 1
fi

cd templates
mustache ../data.yaml page.mustache > ../index.html
cd ..

echo "Generated index.html using mustache"