#!/usr/bin/env
import sys
from urllib.parse import urlparse, parse_qs

parsed = urlparse(sys.argv[1])
print(parse_qs(parsed.query)['code'][0])

