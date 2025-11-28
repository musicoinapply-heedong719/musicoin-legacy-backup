curl --location --request POST "https://t2.musicoin.org/management/api/sync/$1" \
  --header "Content-Type: application/json" \
  --data "{
    \"act\": \"$1\"
}"
