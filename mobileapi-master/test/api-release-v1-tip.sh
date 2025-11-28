if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/v1/release/tip?email=$2&accessToken=$3" \
  --header "Content-Type: application/json" \
  --data "{
    \"trackAddress\": \"0x70677065a0802d963a02d7f2149c0be36554ddb5\",
    \"musicoins\": 10
}"

