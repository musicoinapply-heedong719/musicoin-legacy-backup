if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/license/release/v1?email=$2&accessToken=$3" \
--header "Content-Type: application/json" \
  --data "{
    \"email\": \"$2\",
    \"accessToken\": \"$3\"
}"
