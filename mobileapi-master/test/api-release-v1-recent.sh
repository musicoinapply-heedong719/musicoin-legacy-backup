if [ $1 == "dev" ];
then
    target="http://mc.wegox.cn"
else
    target="https://t2.musicoin.org"
fi

curl --location --request GET "$target/api/v1/release/recent?email=$2&accessToken=$3&limit=10&skip=1"
