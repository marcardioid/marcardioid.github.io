# Extend pelicanconf.py and apply some additional settings
import os, sys
sys.path.append(os.curdir)
from pelicanconf import *

SITEURL = f"https://{DOMAIN}"
RELATIVE_URLS = False
OUTPUT_PATH = "output/publish/"
WITH_DRAFTS = False
