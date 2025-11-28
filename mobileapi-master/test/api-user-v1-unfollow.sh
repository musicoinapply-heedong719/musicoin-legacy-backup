if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request POST "$target/api/v1/user/unfollow?email=$2&accessToken=$3" \
  --header "Content-Type: application/json" \
  --data "{
    \"follower\": \"$4\"
}"
