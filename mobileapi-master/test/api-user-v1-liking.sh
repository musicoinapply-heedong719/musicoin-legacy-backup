if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request GET "$target/api/v1/user/liking?email=$2&accessToken=$3" 
