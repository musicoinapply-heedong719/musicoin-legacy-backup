curl --location --request POST "https://t2.musicoin.org/api/v1/auth/signup" \
  --header "Content-Type: application/json" \
  --data "{
    \"email\": \"$1\",
    \"password\": \"$2\",
    \"username\": \"$3\"
}"

