ng build --prod --base-href /NBARotationChart/
git add dist -f
git commit -m "rebuild site"
git subtree push --prefix dist origin gh-pages