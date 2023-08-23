for filename in $(find . -name "*.js"); do
  echo "$filename"
  google-closure-compiler --js "$filename" --js_output_file "$filename"
done
