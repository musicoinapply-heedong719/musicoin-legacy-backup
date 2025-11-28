curl --location --request POST "https://t2.musicoin.org/api/v1/google/iap?email=$1&accessToken=$2" \
  --header "Content-Type: application/json" \
  --data "{
    \"receipt\":\"{\\\"orderId\\\":\\\"GPA.3374-6177-5888-15708\\\",\\\"packageName\\\":\\\"org.musicoin.musicoin\\\",\\\"productId\\\":\\\"coin_100\\\",\\\"purchaseTime\\\":1554389759286,\\\"purchaseState\\\":0,\\\"purchaseToken\\\":\\\"abdbmelemojpofjogibfhnhb.AO-J1Oz4oed9R4d5twz2Bc1iza-xypd0c8wSBmHuZDpq95o-NQNSUcOaruJ24SsBDN4MpfC22kDeeKrjLgi738r84-pYpFxeYMEM2eZOST0junA1EYQ_Fzk\\\"}\",
    \"signature\": \"Ey7rZh39/whMf91uWbdJE7huA3rdHLIG8A8+ISzlEJGczGkvuw9W6Hi0iA4VICQjyvEKfbhR+3LCWmfad/EYT+gek883NJk86nhiOJZ0l6OSWjOkELlCHU9WgWSYR636wouF81EZSubnM9XrfWTwflX5cXM9jvZrfPW4DJjNOU9zetbjWKxkAc2l34Y517nCTLapQI6n68N7lko47P0xqVgljvNQay3mhHL1FHasnJjeI0VIDoXTHqWx6ueN/pr1ATvcSm7fcqkJP48JPuhy0mR7xaAzKXyiigglQSplRd9WSuFs89trYuJju2CqrWDFhggnhnTK/+D/bLTEyUW4VQ==\"
}"

#\"receipt\":\"{\\"orderId\\":\\"GPA.3374-6177-5888-15708\\",\\"packageName\\":\\"org.musicoin.musicoin\\",\\"productId\\":\\"coin_100\\",\\"purchaseTime\\":1554389759286,\\"purchaseState\\":0,\\"purchaseToken\\":\\"abdbmelemojpofjogibfhnhb.AO-J1Oz4oed9R4d5twz2Bc1iza-xypd0c8wSBmHuZDpq95o-NQNSUcOaruJ24SsBDN4MpfC22kDeeKrjLgi738r84-pYpFxeYMEM2eZOST0junA1EYQ_Fzk\\"}\",
