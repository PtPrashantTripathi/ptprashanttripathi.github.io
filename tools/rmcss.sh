for filename in $(find . -name "*.css"); do
  echo "$filename"
  purgecss --css "$filename" --content index.html --output "$filename"
done
