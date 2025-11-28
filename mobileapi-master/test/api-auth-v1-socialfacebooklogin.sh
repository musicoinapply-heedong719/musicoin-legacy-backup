if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
elif [ $1 == "kickass" ];
then
    target="https://kickass.musicoin.org"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/v1/auth/sociallogin" \
  --header "Content-Type: application/json" \
  --data "{
    \"channel\": \"facebook\",
    \"accessToken\": \"$2\"
}"

