curl --location --request POST "https://t2.musicoin.org/api/v1/dev/deluser" \
  --header "Content-Type: application/json" \
  --data "{
    \"email\": \"$1\"
}"
