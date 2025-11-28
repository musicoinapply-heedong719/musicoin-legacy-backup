# 0xda9c4a467626d341907acb2ef40383d03aeaf37e
if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/v1/user/like?email=$2&accessToken=$3" \
  --header "Content-Type: application/json" \
  --data "{
    \"trackAddress\": \"$4\"
}"
