curl --location --request POST "https://t2.musicoin.org/api/v1/auth/accesstoken/timeout" \
  --header "Content-Type: application/json" \
  --data "{
    \"email\": \"$1\",
    \"accessToken\": \"$2\"
}"

