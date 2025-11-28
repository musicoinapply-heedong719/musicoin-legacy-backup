curl --location --request POST "https://t2.musicoin.org/api/v2/release/tip?email=$1&accessToken=$2" \
  --header "Content-Type: application/json" \
  --data "{
    \"trackAddress\": \"0x70677065a0802d963a02d7f2149c0be36554ddb5\",
    \"musicoins\": 1
}"

