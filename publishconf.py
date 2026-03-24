# Extend pelicanconf.py and apply some additional settings
import os
import sys

CONFIG_DIR = os.path.dirname(os.path.abspath(__file__))
if CONFIG_DIR not in sys.path:
    sys.path.insert(0, CONFIG_DIR)

from pelicanconf import *

SITEURL = f"https://{DOMAIN}"
RELATIVE_URLS = False
OUTPUT_PATH = "output/publish/"
WITH_DRAFTS = False
