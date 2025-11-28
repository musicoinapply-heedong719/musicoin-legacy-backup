if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/v1/auth/sociallogin" \
  --header "Content-Type: application/json" \
  --data "{
    \"channel\": \"google\",
    \"accessToken\": \"$2\"
}"

