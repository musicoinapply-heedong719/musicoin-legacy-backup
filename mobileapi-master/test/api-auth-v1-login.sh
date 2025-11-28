if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/v1/auth/login" \
  --header "Content-Type: application/json" \
  --data "{
    \"email\": \"$2\",
    \"password\": \"$3\"
}"
